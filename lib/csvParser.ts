import { parse, ParseResult } from "papaparse";
import { CombinedIssue, Feature, FeatureStatus, Project, Story } from "./types";
import { formatValueToSlug } from "./utils";

// Define a type for our CSV row data
type CSVRowData = Record<string, string>;

/**
 * Parse a File object (from browser upload) and extract issues with project info
 * @param file File object from input
 * @returns Promise that resolves to array of issues with project info
 */
export function parseCSVFileObject(file: File): Promise<CombinedIssue[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const fileContent = event.target?.result as string;
        if (!fileContent) {
          reject(new Error("Failed to read file content"));
          return;
        }

        // Extract project name from file name
        const projectName = file.name.replace(".csv", "").replace(/%20/g, " ");
        const projectSlug = formatValueToSlug(projectName);

        // Parse CSV data
        const parsedData: ParseResult<CSVRowData> = parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          transform: (value, header) => {
            // Transform numeric fields
            if (header === "#" || header === "Parent task") {
              return value ? parseInt(value, 10) : null;
            }
            if (
              header === "Estimated time" ||
              header === "Total estimated time" ||
              header === "Spent time" ||
              header === "Total spent time" ||
              header === "Story points" ||
              header === "% Done"
            ) {
              return value ? parseFloat(value) : 0;
            }
            if (header === "Private") {
              return value === "1";
            }
            return value;
          },
        });

        // Convert parsed data to our CombinedIssue interface
        const issues: CombinedIssue[] = parsedData.data.map((row) => {
          return {
            id: row["#"] ? parseInt(row["#"], 10) : 0,
            tracker: row["Tracker"] || "",
            status: row["Status"] || "",
            subject: row["Subject"] || "",
            author: row["Author"] || "",
            assignee: row["Assignee"] || "",
            priority: row["Priority"] || "",
            foundVersion: row["Found Version"] || "",
            dueDate: row["Due date"] || "",
            targetVersion: row["Target version"] || "",
            relatedAppVersion: row["Related app version"] || "",
            sprint: row["Sprint"] || "",
            project: row["Project"] || "",
            parentTask: row["Parent task"]
              ? parseInt(row["Parent task"], 10)
              : null,
            parentTaskSubject: row["Parent task subject"] || "",
            updated: row["Updated"] || "",
            category: row["Category"] || "",
            startDate: row["Start date"] || "",
            estimatedTime: row["Estimated time"]
              ? parseFloat(row["Estimated time"])
              : 0,
            totalEstimatedTime: row["Total estimated time"]
              ? parseFloat(row["Total estimated time"])
              : 0,
            spentTime: row["Spent time"] ? parseFloat(row["Spent time"]) : 0,
            totalSpentTime: row["Total spent time"]
              ? parseFloat(row["Total spent time"])
              : 0,
            percentDone: row["% Done"] ? parseFloat(row["% Done"]) : 0,
            created: row["Created"] || "",
            closed: row["Closed"] || "",
            lastUpdatedBy: row["Last updated by"] || "",
            relatedIssues: row["Related issues"] || "",
            files: row["Files"] || "",
            tags: row["Tags"]
              ? row["Tags"].split(",").map((tag: string) => tag.trim())
              : [],
            doneBy: row["Done by"] || "",
            projectName: row["Project Name"] || projectName,
            position: row["Position"] || "",
            issueCategories: row["Issue Categories"] || "",
            private: row["Private"] === "1",
            storyPoints: row["Story points"]
              ? parseFloat(row["Story points"])
              : 0,
            projectSlug: projectSlug,
          };
        });

        resolve(issues);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

/**
 * Parse multiple File objects (from browser upload) and combine all data
 * @param files Array of File objects from input
 * @returns Promise that resolves to combined array of issues with project info
 */
export async function parseMultipleCSVFileObjects(
  files: File[]
): Promise<CombinedIssue[]> {
  const allIssues: CombinedIssue[] = [];

  for (const file of files) {
    const issues = await parseCSVFileObject(file);
    allIssues.push(...issues);
  }

  return allIssues;
}

/**
 * Calculate feature status based on due date, closed date and status
 * @param dueDate Due date of the feature
 * @param closedDate Closed date of the feature
 * @param status Status of the feature
 * @returns Feature status
 */
function calculateFeatureStatus({
  dueDate,
  closedDate,
  status,
}: {
  dueDate: string;
  closedDate: string;
  status: string;
}) {
  if (status === "Closed") {
    return FeatureStatus.ONTIME;
  }
  if (dueDate && closedDate) {
    const due = new Date(dueDate);
    const closed = new Date(closedDate);
    return closed > due ? FeatureStatus.LATE : FeatureStatus.ONTIME;
  }
  return FeatureStatus.INPROGRESS;
}

/**
 * Calculate projects from combined issues data
 * @param issues Array of combined issues with project info
 * @returns Array of projects grouped by project name
 */
export function calculateProjects(issues: CombinedIssue[]): Project[] {
  // Group issues by project
  const issuesByProject: Record<string, CombinedIssue[]> = {};
  issues.forEach((issue) => {
    const projectName = issue.projectName;
    if (!issuesByProject[projectName]) {
      issuesByProject[projectName] = [];
    }
    issuesByProject[projectName].push(issue);
  });

  // Process each project
  const projects: Project[] = [];
  for (const projectName in issuesByProject) {
    const projectIssues = issuesByProject[projectName];
    const projectSlug = formatValueToSlug(projectName);

    // Count unique members (assignees) in this project
    const uniqueAssignees = new Set<string>();
    projectIssues.forEach((issue) => {
      if (issue.assignee && issue.assignee.trim() !== "") {
        uniqueAssignees.add(issue.assignee.trim());
      }
    });
    const totalMembers = uniqueAssignees.size;

    // Group issues by parent task within this project
    const issuesByParent: Record<number, CombinedIssue[]> = {};
    projectIssues.forEach((issue) => {
      const parentId = issue.parentTask;
      if (parentId) {
        if (!issuesByParent[parentId]) {
          issuesByParent[parentId] = [];
        }
        issuesByParent[parentId].push(issue);
      }
    });

    // Identify features (Epics) within this project
    const features: Feature[] = projectIssues
      .filter((issue) => issue.tracker === "Epic")
      .map((epic) => {
        return {
          ...epic,
          dueStatus: calculateFeatureStatus({
            closedDate: epic.closed,
            dueDate: epic.dueDate,
            status: epic.status,
          }),
          slug: formatValueToSlug(epic.subject),
          urgentBugs: 0,
          highBugs: 0,
          normalBugs: 0,
          ncrBugs: 0,
          stories: [],
        };
      });

    // Identify stories and other issues within this project
    const stories: Story[] = projectIssues
      .filter((issue) => issue.tracker === "Story")
      .map((story) => {
        // Get child issues for this story
        const childIssues = issuesByParent[story.id] || [];

        // Count bugs and NCR issues for this story
        let urgentCount = 0;
        let highCount = 0;
        let normalCount = 0;
        let ncrCount = 0;

        childIssues.forEach((issue) => {
          // Check if the issue is a bug with priority "Urgent" or "High"
          if (issue.tracker === "Bug") {
            if (issue.priority === "Urgent") {
              urgentCount += 1;
            } else if (issue.priority === "High") {
              highCount += 1;
            } else if (issue.priority === "Normal") {
              normalCount += 1;
            }
          }

          // Check if the issue has category "NCR"
          if (issue.issueCategories === "NCR") {
            ncrCount += 1;
          }
        });

        return {
          ...story,
          name: story.subject,
          timeSpent: story.totalSpentTime,
          parent: story.parentTask || 0,
          issues: childIssues,
          urgentBugs: urgentCount,
          highBugs: highCount,
          normalBugs: normalCount,
          ncrBugs: ncrCount,
        };
      });

    // Associate stories with their features and aggregate counts
    stories.forEach((story) => {
      const feature = features.find((f) => f.id === story.parent);
      if (feature) {
        // Add the story to the feature
        feature.stories.push(story);

        // Aggregate bug counts from the story to the feature
        feature.urgentBugs += story.urgentBugs || 0;
        feature.highBugs += story.highBugs || 0;
        feature.normalBugs += story.normalBugs || 0;
        feature.ncrBugs += story.ncrBugs || 0;
      }
    });

    // Create the project structure
    const project: Project = {
      projectName: projectName,
      projectSlug: projectSlug,
      totalItems: projectIssues.length,
      totalMembers: totalMembers,
      features: features,
    };

    projects.push(project);
  }

  return projects;
}
