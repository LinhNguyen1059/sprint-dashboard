"use client";

import * as React from "react";
import { Column, ColumnDef, Table } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { CombinedIssue, FeatureStatus, Member } from "@/lib/types";
import {
  countBugsByPriority,
  cn,
  countBugsSupportedByMember,
} from "@/lib/utils";
import { MEMBER_ROLE } from "@/lib/teams";

export const visibleColumns = {
  name: "Member name",
  timeSpent: "Time spent",
  criticalBugs: "Critical bugs",
  highBugs: "High bugs",
  supported: "Supported",
  normalBugs: "Normal bugs",
  postReleaseBugs: "Post-Release bugs",
  projects: "Projects",
};

const getIssuesByProjects = (table: Table<Member>, issues: CombinedIssue[]) => {
  const projectFilterValue = table.getColumn("projects")?.getFilterValue();
  const selectedProjects = Array.isArray(projectFilterValue)
    ? projectFilterValue
    : projectFilterValue
      ? [projectFilterValue]
      : [];

  let filteredIssues = issues;
  if (selectedProjects.length > 0) {
    filteredIssues = issues.filter((issue) =>
      selectedProjects.includes(issue.projectName),
    );
  }

  return filteredIssues;
};

// Define a reusable component for sortable headers
const SortableHeader = ({
  column,
  title,
  className = "",
}: {
  column: Column<Member>;
  title: string;
  className?: string;
}) => {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className={cn("!px-0 hover:bg-transparent", className)}
    >
      {title}
      {column.getIsSorted() === "desc" ? (
        <ChevronDown className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === "asc" ? (
        <ChevronUp className="ml-2 h-4 w-4" />
      ) : (
        <ChevronsUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
};

// Define columns with clear, readable structure
export const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="min-w-80">
        <Link
          href={`/member/${row.original.slug}`}
          className="hover:underline font-medium"
        >
          {row.original.name}
        </Link>
      </div>
    ),
    filterFn: "includesString",
    enableHiding: false,
  },
  {
    accessorKey: "role",
    header: ({ column }) => <SortableHeader column={column} title="Role" />,
    cell: ({ row }) => {
      let color = "text-blue-500 bg-blue-500/10";
      if (row.original.role === MEMBER_ROLE.DESIGNER) {
        color = "text-green-500 bg-green-500/10";
      } else if (row.original.role === MEMBER_ROLE.TESTER) {
        color = "text-pink-500 bg-pink-500/10";
      } else if (row.original.role === MEMBER_ROLE.PM) {
        color = "text-orange-500 bg-orange-500/10";
      }
      return (
        <Badge variant="secondary" className={color}>
          {row.original.role}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;
      if (Array.isArray(value)) {
        return value.includes(row.getValue(id));
      }
      return value === "" || row.getValue(id) === value;
    },
    enableHiding: false,
  },
  {
    accessorKey: "ontimePercent",
    header: () => <div className="text-right">% Tasks On Time</div>,
    cell: ({ row, table }) => {
      const filteredIssues = getIssuesByProjects(table, row.original.issues);

      const ontimeCount = filteredIssues.filter(
        (issue) =>
          (issue.tracker === "Tasks" || issue.tracker === "Task_Scr") &&
          issue.dueStatus === FeatureStatus.ONTIME,
      ).length;
      const totalCount = filteredIssues.length;
      const percent =
        totalCount > 0 ? Math.round((ontimeCount / totalCount) * 100) : 0;

      return <div className="text-right">{percent}%</div>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "timeSpent",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title="Time spent"
        className="w-full justify-end"
      />
    ),
    cell: ({ row, table }) => {
      const filteredIssues = getIssuesByProjects(table, row.original.issues);

      const timeSpent = filteredIssues.reduce((acc, issue) => {
        acc += issue.spentTime;
        return acc;
      }, 0);

      return (
        <div className="text-right">{parseFloat(timeSpent.toFixed(2))} hrs</div>
      );
    },
  },
  {
    accessorKey: "criticalBugs",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title="Critical bugs"
        className="w-full justify-end"
      />
    ),
    cell: ({ row, table }) => {
      const filteredIssues = getIssuesByProjects(table, row.original.issues);

      const criticalBugs = countBugsByPriority({
        member: row.original.name,
        issues: filteredIssues,
        priorities: ["Urgent", "Immediate"],
      });

      return <div className="text-right">{criticalBugs}</div>;
    },
  },
  {
    accessorKey: "highBugs",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title="High bugs"
        className="w-full justify-end"
      />
    ),
    cell: ({ row, table }) => {
      const filteredIssues = getIssuesByProjects(table, row.original.issues);

      const highBugs = countBugsByPriority({
        member: row.original.name,
        issues: filteredIssues,
        priorities: ["High"],
      });

      return <div className="text-right">{highBugs}</div>;
    },
  },
  {
    accessorKey: "supported",
    header: () => <div className="text-right">Supported</div>,
    cell: ({ row, table }) => {
      const filteredIssues = getIssuesByProjects(table, row.original.issues);

      const supportedBugs = countBugsSupportedByMember({
        member: row.original.name,
        issues: filteredIssues,
      });

      return <div className="text-right">{supportedBugs}</div>;
    },
  },
  {
    accessorKey: "postReleaseBugs",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title="Post-Release bugs"
        className="w-full justify-end"
      />
    ),
    cell: ({ row, table }) => {
      const filteredIssues = getIssuesByProjects(table, row.original.issues);

      const postReleaseBugs = countBugsByPriority({
        member: row.original.name,
        issues: filteredIssues,
        priorities: ["Urgent", "Immediate"],
        isPostRelease: true,
      });

      return <div className="text-right">{postReleaseBugs}</div>;
    },
  },
  {
    accessorKey: "projects",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title="Projects"
        className="w-full justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.projects.join(", ")}</div>
    ),
    filterFn: (row, id, value) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;

      const memberProjects = row.getValue(id) as string[];

      if (!memberProjects || memberProjects.length === 0) return false;

      if (Array.isArray(value)) {
        return value.some((selectedProject) =>
          memberProjects.includes(selectedProject),
        );
      }

      return memberProjects.includes(value);
    },
  },
];
