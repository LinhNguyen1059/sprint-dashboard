import Papa from 'papaparse';
import { CSVRow, ProcessedCSVRow, SprintData, SprintMetrics, ChartData, TeamMember, TimelineData, Story, StoryBreakdown, StoryStatusBreakdown, StoryTimeMetrics } from './types';

export const parseCSV = (file: File): Promise<CSVRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<CSVRow>) => {
        if (results.errors.length > 0) {
          reject(results.errors);
        } else {
          resolve(results.data);
        }
      },
      error: (error: Error) => reject(error)
    });
  });
};

export const processSprintData = (data: CSVRow[]): SprintData => {
  // Clean and normalize data
  const cleanData: ProcessedCSVRow[] = data.map(row => ({
    ...row,
    'Spent time': parseFloat(String(row['Spent time'])) || 0,
    'Total spent time': parseFloat(String(row['Total spent time'])) || 0,
    'Estimated time': parseFloat(String(row['Estimated time'])) || 0,
    'Total estimated time': parseFloat(String(row['Total estimated time'])) || 0,
    'Updated': new Date(row['Updated']),
    'Created': new Date(row['Created']),
    'Closed': row['Closed'] ? new Date(row['Closed']) : null,
  }));

  return {
    raw: cleanData,
    metrics: calculateMetrics(cleanData),
    charts: prepareChartData(cleanData),
    team: calculateTeamMetrics(cleanData),
    timeline: calculateTimelineData(cleanData),
    stories: calculateStoryMetrics(cleanData)
  };
};

const calculateMetrics = (data: ProcessedCSVRow[]): SprintMetrics => {
  const totalIssues = data.length;
  const closedIssues = data.filter(item => item.Status === 'Closed').length;
  const inProgressIssues = data.filter(item => item.Status === 'In Progress');
  const pendingIssues = data.filter(item => ['Waiting', 'Confirmed', 'Feedback'].includes(item.Status));
  
  const totalSpentTime = data.reduce((sum, item) => sum + item['Total spent time'], 0);
  const totalEstimatedTime = data.reduce((sum, item) => sum + item['Total estimated time'], 0);
  
  const bugCount = data.filter(item => item.Tracker === 'Bug').length;
  const taskCount = data.filter(item => item.Tracker === 'Task_Scr').length;
  const storyCount = data.filter(item => item.Tracker === 'Story').length;
  
  const highPriorityCount = data.filter(item => item.Priority === 'High').length;
  const urgentPriorityCount = data.filter(item => item.Priority === 'Urgent').length;

  return {
    total: totalIssues,
    closed: closedIssues,
    inProgress: inProgressIssues,
    inProgressCount: inProgressIssues.length,
    pending: pendingIssues,
    pendingCount: pendingIssues.length,
    completionRate: totalIssues > 0 ? (closedIssues / totalIssues * 100).toFixed(1) : '0',
    totalSpentTime: totalSpentTime.toFixed(1),
    totalEstimatedTime: totalEstimatedTime.toFixed(1),
    timeEfficiency: totalEstimatedTime > 0 ? (totalSpentTime / totalEstimatedTime * 100).toFixed(1) : '0',
    bugCount,
    taskCount,
    storyCount,
    highPriorityCount,
    urgentPriorityCount
  };
};

const prepareChartData = (data: ProcessedCSVRow[]): ChartData => {
  // Status distribution
  const statusData = data.reduce((acc: Record<string, number>, item) => {
    acc[item.Status] = (acc[item.Status] || 0) + 1;
    return acc;
  }, {});

  // Priority distribution
  const priorityData = data.reduce((acc: Record<string, number>, item) => {
    acc[item.Priority] = (acc[item.Priority] || 0) + 1;
    return acc;
  }, {});

  // Tracker type distribution
  const trackerData = data.reduce((acc: Record<string, number>, item) => {
    acc[item.Tracker] = (acc[item.Tracker] || 0) + 1;
    return acc;
  }, {});

  // Module progress (based on subject keywords)
  const moduleProgress = {
    'Video/Streaming': data.filter(item => 
      item.Subject?.toLowerCase().includes('video') || 
      item.Subject?.toLowerCase().includes('streaming') ||
      item.Subject?.toLowerCase().includes('direct') ||
      item.Subject?.toLowerCase().includes('relay')
    ).length,
    'Smart-ER': data.filter(item => 
      item.Subject?.toLowerCase().includes('smart-er') || 
      item.Subject?.toLowerCase().includes('smarter')
    ).length,
    'Dashboard': data.filter(item => 
      item.Subject?.toLowerCase().includes('dashboard') ||
      item.Subject?.toLowerCase().includes('tdl')
    ).length,
    'Alarm': data.filter(item => 
      item.Subject?.toLowerCase().includes('alarm')
    ).length,
    'Health': data.filter(item => 
      item.Subject?.toLowerCase().includes('health')
    ).length,
    'OAM': data.filter(item => 
      item.Subject?.toLowerCase().includes('oam')
    ).length,
    'Other': data.filter(item => {
      const subject = item.Subject?.toLowerCase() || '';
      return !subject.includes('video') && 
             !subject.includes('streaming') && 
             !subject.includes('smart-er') && 
             !subject.includes('smarter') && 
             !subject.includes('dashboard') && 
             !subject.includes('tdl') && 
             !subject.includes('alarm') && 
             !subject.includes('health') && 
             !subject.includes('oam');
    }).length
  };

  return {
    status: statusData,
    priority: priorityData,
    tracker: trackerData,
    modules: moduleProgress
  };
};

const calculateTeamMetrics = (data: ProcessedCSVRow[]): TeamMember[] => {
  // Team member performance
  const assigneeMetrics = data.reduce((acc: Record<string, Omit<TeamMember, 'completionRate' | 'efficiency'>>, item) => {
    const assignee = item.Assignee || 'Unassigned';
    if (!acc[assignee]) {
      acc[assignee] = {
        name: assignee,
        total: 0,
        closed: 0,
        inProgress: 0,
        totalSpentTime: 0,
        totalEstimatedTime: 0
      };
    }
    
    acc[assignee].total += 1;
    if (item.Status === 'Closed') acc[assignee].closed += 1;
    if (item.Status === 'In Progress') acc[assignee].inProgress += 1;
    acc[assignee].totalSpentTime += item['Total spent time'];
    acc[assignee].totalEstimatedTime += item['Total estimated time'];
    
    return acc;
  }, {});

  // Convert to array and calculate completion rates
  const teamArray: TeamMember[] = Object.values(assigneeMetrics).map(member => ({
    ...member,
    completionRate: member.total > 0 ? (member.closed / member.total * 100).toFixed(1) : '0',
    efficiency: member.totalEstimatedTime > 0 ? 
      (member.totalSpentTime / member.totalEstimatedTime * 100).toFixed(1) : '0'
  })).sort((a, b) => b.closed - a.closed);

  return teamArray;
};

const calculateTimelineData = (data: ProcessedCSVRow[]): TimelineData[] => {
  // Daily completion data
  const dailyData = data
    .filter(item => item.Closed)
    .reduce((acc: Record<string, number>, item) => {
      const date = item.Closed!.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

  // Convert to array format for charts
  const timelineArray: TimelineData[] = Object.entries(dailyData)
    .map(([date, count]) => ({ date, count: count as number }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return timelineArray;
};

// Utility function to get color for chart data
export const getChartColors = (count: number): string[] => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6366F1'
  ];
  
  return colors.slice(0, count);
};

// Format time display
export const formatTime = (hours: number): string => {
  if (hours < 1) return `${(hours * 60).toFixed(0)}m`;
  return `${hours.toFixed(1)}h`;
};

const calculateStoryMetrics = (data: ProcessedCSVRow[]): Story[] => {
  // Get all stories
  const stories = data.filter(item => item.Tracker === 'Story');
  
  // Calculate metrics for each story
  const storyMetrics: Story[] = stories.map(story => {
    // Find all related issues (those that have this story as parent)
    const relatedIssues = data.filter(item => 
      item['Parent task'] === story['#'] || 
      item['Parent task'] === story['#'].toString()
    );
    
    // Count by tracker type
    const bugCount = relatedIssues.filter(item => item.Tracker === 'Bug').length;
    const taskCount = relatedIssues.filter(item => item.Tracker === 'Task_Scr').length;
    const suggestionCount = relatedIssues.filter(item => item.Tracker === 'Suggestion').length;
    const otherCount = relatedIssues.filter(item => 
      !['Bug', 'Task_Scr', 'Suggestion'].includes(item.Tracker)
    ).length;
    
    // Count by status
    const closedCount = relatedIssues.filter(item => item.Status === 'Closed').length;
    const inProgressCount = relatedIssues.filter(item => item.Status === 'In Progress').length;
    const resolvedCount = relatedIssues.filter(item => item.Status === 'Resolved').length;
    const pendingCount = relatedIssues.filter(item => 
      ['Waiting', 'Confirmed', 'Feedback', 'Pended'].includes(item.Status)
    ).length;
    
    // Calculate total time
    const totalSpentTime = relatedIssues.reduce((sum, item) => sum + item['Total spent time'], 0);
    const totalEstimatedTime = relatedIssues.reduce((sum, item) => sum + item['Total estimated time'], 0);
    
    // Calculate completion rate
    const completionRate = relatedIssues.length > 0 ? 
      (closedCount / relatedIssues.length * 100).toFixed(1) : '0';
    
    return {
      id: story['#'],
      subject: story.Subject,
      status: story.Status,
      assignee: story.Assignee,
      created: story.Created,
      closed: story.Closed,
      totalRelated: relatedIssues.length,
      breakdown: {
        bugs: bugCount,
        tasks: taskCount,
        suggestions: suggestionCount,
        other: otherCount
      },
      statusBreakdown: {
        closed: closedCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
        pending: pendingCount
      },
      timeMetrics: {
        totalSpentTime: totalSpentTime.toFixed(1),
        totalEstimatedTime: totalEstimatedTime.toFixed(1),
        efficiency: totalEstimatedTime > 0 ? 
          (totalSpentTime / totalEstimatedTime * 100).toFixed(1) : '0'
      },
      completionRate: parseFloat(completionRate),
      relatedIssues: relatedIssues
    };
  });
  
  // Sort by number of related issues (descending)
  return storyMetrics.sort((a, b) => b.totalRelated - a.totalRelated);
};

// Format date display
export const formatDate = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
};