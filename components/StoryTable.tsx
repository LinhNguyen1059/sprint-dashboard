import React, { useState } from "react";
import { GitBranch, Bug, FileText, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  StatusBadgeProps,
  StoryRowProps,
  StoryTableProps,
  SortOption,
  FilterOption,
} from "@/lib/types";

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusVariant = (): string => {
    switch (status?.toLowerCase()) {
      case "waiting":
        return "bg-[#cad832]";
      case "confirmed":
        return "bg-[#173e45]";
      case "in progress":
        return "bg-[#f574c5]";
      case "resolved":
        return "bg-[#ea2735]";
      case "feedback":
        return "bg-[#c70e32]";
      case "reopened":
        return "bg-[#de282e]";
      default:
        return "bg-[#b6d1d3]";
    }
  };

  return <Badge className={cn("text-xs", getStatusVariant())}>{status}</Badge>;
};

const StoryRow: React.FC<StoryRowProps> = ({ story }) => {
  return (
    <TableRow className="hover:bg-muted/50 cursor-pointer">
      <TableCell className="w-12">
        <Link
          href={`https://bugtracker.i3international.com/issues/${story.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium"
        >
          #{story.id}
        </Link>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <div
            className="text-sm text-muted-foreground truncate max-w-[200px]"
            title={story.subject}
          >
            {story.subject}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={story.status} />
      </TableCell>
      <TableCell className="text-center">{story.totalRelated}</TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center space-x-1">
          <Bug className="h-3 w-3 text-red-500" />
          <span className="text-red-600">{story.breakdown.bugs}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center space-x-1">
          <FileText className="h-3 w-3 text-blue-500" />
          <span className="text-blue-600">{story.breakdown.tasks}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center space-x-1">
          <Lightbulb className="h-3 w-3 text-yellow-500" />
          <span className="text-yellow-600">{story.breakdown.suggestions}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div
          className={`font-medium ${
            story.completionRate >= 80
              ? "text-green-600"
              : story.completionRate >= 60
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {story.completionRate}%
        </div>
      </TableCell>
      <TableCell>
        <div className="w-16">
          <Progress
            value={Math.min(story.completionRate, 100)}
            className="h-2"
            progressClassName="bg-blue-500"
          />
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {story.assignee || "Unassigned"}
      </TableCell>
    </TableRow>
  );
};

const StoryTable: React.FC<StoryTableProps> = ({ sprintData }) => {
  const [sortBy, setSortBy] = useState<SortOption>("totalRelated");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  if (!sprintData || !sprintData.stories || sprintData.stories.length === 0) {
    return (
      <Card className="lg:col-span-12">
        <CardContent className="p-8 text-center">
          <GitBranch className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">No Stories Found</CardTitle>
          <p className="text-muted-foreground">
            No stories were found in your data. Stories help organize related
            bugs, tasks, and suggestions.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { stories } = sprintData;

  // Filter stories
  const filteredStories = stories.filter((story) => {
    if (filterBy === "all") return true;
    if (filterBy === "active") return story.status !== "Closed";
    if (filterBy === "completed") return story.status === "Closed";
    if (filterBy === "has-bugs") return story.breakdown.bugs > 0;
    return true;
  });

  // Sort stories
  const sortedStories = [...filteredStories].sort((a, b) => {
    if (sortBy === "totalRelated") return b.totalRelated - a.totalRelated;
    if (sortBy === "completionRate") return b.completionRate - a.completionRate;
    if (sortBy === "bugs") return b.breakdown.bugs - a.breakdown.bugs;
    if (sortBy === "created")
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    return 0;
  });

  const totalStories = stories.length;
  const activeStories = stories.filter((s) => s.status !== "Closed").length;
  const totalIssues = stories.reduce((sum, s) => sum + s.totalRelated, 0);
  const totalBugs = stories.reduce((sum, s) => sum + s.breakdown.bugs, 0);

  return (
    <div className="lg:col-span-12 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle className="flex items-center">
                <GitBranch className="h-6 w-6 mr-2 text-purple-600" />
                Stories & Related Issues
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Track stories and their related bugs, tasks, and suggestions
              </p>
            </div>

            <div className="flex space-x-4">
              <Select
                value={sortBy}
                onValueChange={(value: string) =>
                  setSortBy(value as SortOption)
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="totalRelated">Total Issues</SelectItem>
                  <SelectItem value="completionRate">
                    Completion Rate
                  </SelectItem>
                  <SelectItem value="bugs">Bug Count</SelectItem>
                  <SelectItem value="created">Created Date</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterBy}
                onValueChange={(value: string) =>
                  setFilterBy(value as FilterOption)
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stories</SelectItem>
                  <SelectItem value="active">Active Stories</SelectItem>
                  <SelectItem value="completed">Completed Stories</SelectItem>
                  <SelectItem value="has-bugs">Stories with Bugs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {totalStories}
              </div>
              <div className="text-sm text-purple-700">Total Stories</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {activeStories}
              </div>
              <div className="text-sm text-blue-700">Active Stories</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-muted-foreground">
                {totalIssues}
              </div>
              <div className="text-sm text-muted-foreground">
                Related Issues
              </div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{totalBugs}</div>
              <div className="text-sm text-red-700">Total Bugs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stories Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Story</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Total Issues</TableHead>
                <TableHead className="text-center">Bugs</TableHead>
                <TableHead className="text-center">Tasks</TableHead>
                <TableHead className="text-center">Suggestions</TableHead>
                <TableHead className="text-center">Completion</TableHead>
                <TableHead className="text-center">Progress</TableHead>
                <TableHead>Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStories.map((story) => (
                <StoryRow key={story.id} story={story} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryTable;
