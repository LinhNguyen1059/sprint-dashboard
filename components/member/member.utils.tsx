"use client";

import * as React from "react";
import { Column, ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { MemberWithOverview } from "@/lib/types";
import { cn } from "@/lib/utils";
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

// Define a reusable component for sortable headers
const SortableHeader = ({
  column,
  title,
  className = "",
}: {
  column: Column<MemberWithOverview>;
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
export const columns: ColumnDef<MemberWithOverview>[] = [
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
    accessorKey: "completion",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title="Completion rate"
        className="w-full justify-end"
      />
    ),
    cell: ({ row }) => {
      return <div className="text-right">{row.original.completion}%</div>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "inprogress",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title="In-progress rate"
        className="w-full justify-end"
      />
    ),
    cell: ({ row }) => {
      return <div className="text-right">{row.original.inprogress}%</div>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "overdueTasks",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title="Overdue tasks"
        className="w-full justify-end"
      />
    ),
    cell: ({ row }) => {
      return <div className="text-right">{row.original.overdueTasks}</div>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "totalSpentTime",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title="Spent time"
        className="w-full justify-end"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-right">{row.original.totalSpentTime} hrs</div>
      );
    },
    enableHiding: false,
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
