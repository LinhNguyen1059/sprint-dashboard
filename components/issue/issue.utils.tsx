"use client";

import * as React from "react";
import { Column, ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CombinedIssue } from "@/lib/types";
import {
  bugTrackerUrl,
  cn,
  getFeatureStatus,
  visibleColumns,
} from "@/lib/utils";
import { Progress } from "../ui/progress";

/** Extracts a multi-value column filter as a typed string array. */
export function getMultiFilterValue(colValue: unknown): string[] {
  return Array.isArray(colValue) ? (colValue as string[]) : [];
}

/** Derives a list of unique non-empty string values for a field across all rows. */
export function getUniqueValues<T>(data: T[], key: keyof T): string[] {
  return Array.from(new Set(data.map((row) => row[key] as string))).filter(
    Boolean,
  );
}

// Define a reusable component for sortable headers
export const SortableHeader = ({
  column,
  title,
  className = "",
}: {
  column: Column<CombinedIssue>;
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
export const columns: ColumnDef<CombinedIssue>[] = [
  {
    id: "id",
    header: () => null,
    cell: ({ row }) => (
      <Link
        href={`${bugTrackerUrl}/${row.original.id}`}
        target="_blank"
        rel="noopener"
        className="hover:underline"
      >
        {row.original.id}
      </Link>
    ),
  },
  {
    accessorKey: "subject",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["subject"]} />
    ),
    enableHiding: false,
    cell: ({ row }) => (
      <div className="truncate max-w-[500px]">{row.original.subject}</div>
    ),
    size: 500,
  },
  {
    accessorKey: "parentTaskSubject",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title={visibleColumns["parentTaskSubject"]}
      />
    ),
    enableHiding: true,
    cell: ({ row }) => (
      <div className="truncate max-w-[500px]">
        {row.original.parentTaskSubject}
      </div>
    ),
    size: 500,
  },
  {
    accessorKey: "tracker",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["tracker"]} />
    ),
    filterFn: (row, id, value) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;

      const tracker = row.getValue(id);
      const isWithoutSubtasks = row.original.isWithoutSubtasks;

      if (Array.isArray(value)) {
        return value.some((filterValue) => {
          // Check for specific filter values
          if (filterValue === "Story without subtasks") {
            return tracker === "Story" && isWithoutSubtasks;
          }
          if (filterValue === "Suggestion without subtasks") {
            return tracker === "Suggestion" && isWithoutSubtasks;
          }

          return tracker === filterValue;
        });
      }
      return value === "" || tracker === value;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["status"]} />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;
      if (Array.isArray(value)) {
        return value.includes(row.getValue(id));
      }
      return value === "" || row.getValue(id) === value;
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["priority"]} />
    ),
    filterFn: (row, id, value) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;
      if (Array.isArray(value)) {
        return value.includes(row.getValue(id));
      }
      return value === "" || row.getValue(id) === value;
    },
  },
  {
    accessorKey: "closed",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["closed"]} />
    ),
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["dueDate"]} />
    ),
  },
  {
    accessorKey: "spentTime",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title={visibleColumns["spentTime"]}
        className="w-full justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{Math.round(row.original.spentTime)} hrs</div>
    ),
  },
  {
    accessorKey: "doneBy",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["doneBy"]} />
    ),
  },
  {
    accessorKey: "issueCategories",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title={visibleColumns["issueCategories"]}
      />
    ),
    filterFn: (row, id, value) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;

      const rowCategories = row.getValue(id) as string;

      if (!rowCategories) return false;

      const individualRowCategories = rowCategories
        .split(",")
        .map((cat) => cat.trim())
        .filter(Boolean);

      if (Array.isArray(value)) {
        return value.some((selectedCategory) =>
          individualRowCategories.includes(selectedCategory),
        );
      }

      return individualRowCategories.includes(value);
    },
  },
  {
    accessorKey: "author",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["author"]} />
    ),
  },
  {
    accessorKey: "assignee",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["assignee"]} />
    ),
  },
  /**
   * Virtual filter-only column.
   * TanStack Table uses AND between column filters, so filtering `assignee`
   * and `doneBy` separately would require a row to satisfy both at once.
   * This column checks OR: the member is either the assignee OR listed in doneBy.
   * It has no `accessorFn` so it is invisible and hidden from the Customize
   * Columns dropdown (which gates on `typeof column.accessorFn !== "undefined"`).
   */
  {
    id: "assigneeOrDoneBy",
    filterFn: (row, _id, member: string) => {
      if (!member) return true;
      const { assignee, doneBy } = row.original;
      return assignee === member || doneBy?.includes(member);
    },
  },
  /**
   * Virtual filter-only column.
   * When set to a list of category strings, excludes any row whose
   * issueCategories contains at least one of those categories.
   */
  {
    id: "excludeIssueCategories",
    filterFn: (row, _id, excluded: string[]) => {
      if (!excluded || excluded.length === 0) return true;
      const raw = row.original.issueCategories ?? "";
      const rowCategories = raw
        .split(",")
        .map((c: string) => c.trim())
        .filter(Boolean);
      return !rowCategories.some((cat: string) => excluded.includes(cat));
    },
  },
  {
    id: "isPostReleaseBug",
    filterFn: (row, _id, isChecked: boolean) => {
      if (!isChecked) return true;
      const isBug = row.original.tracker === "Bug";
      const categories = row.original.issueCategories
        ? row.original.issueCategories.split("; ").map((c) => c.trim())
        : [];
      return isBug && categories.includes("Post-release Issue");
    },
  },
  {
    accessorKey: "triggeredBy",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["triggeredBy"]} />
    ),
    filterFn: (row, id, value) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;
      if (Array.isArray(value)) {
        return value.includes(row.getValue(id));
      }
      return value === "" || row.getValue(id) === value;
    },
  },
  {
    accessorKey: "percentDone",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["percentDone"]} />
    ),
    cell: ({ row }) => (
      <div className="w-32 flex items-center gap-2">
        <Progress
          value={row.original.percentDone}
          className="bg-primary/10"
          progressClassName="bg-blue-500"
        />
        <span className="">{row.original.percentDone}%</span>
      </div>
    ),
  },
  {
    accessorKey: "created",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["created"]} />
    ),
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["startDate"]} />
    ),
  },
  {
    accessorKey: "updated",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["updated"]} />
    ),
  },
  {
    accessorKey: "lastUpdatedBy",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["lastUpdatedBy"]} />
    ),
  },
  {
    accessorKey: "dueStatus",
    header: ({ column }) => (
      <SortableHeader column={column} title="Due status" />
    ),
    cell: ({ row }) => {
      const status = getFeatureStatus(row.original.dueStatus);
      return (
        <Badge
          variant="outline"
          className={cn("text-muted-foreground px-1.5", status.class)}
        >
          {status.icon && <status.icon />}
          {status.text}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value === "" || !value || row.getValue(id) === value;
    },
  },
];
