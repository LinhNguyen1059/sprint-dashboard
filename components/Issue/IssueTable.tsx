"use client";

import * as React from "react";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  X,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MultiSelectFilter } from "@/components/MultiSelectFilter";
import { CombinedIssue, FeatureStatus, Story } from "@/lib/types";
import {
  bugTrackerUrl,
  cn,
  getFeatureStatus,
  visibleColumns,
} from "@/lib/utils";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { IssueOverview } from "./";
import { IssueOverviewData } from "./IssueOverview";

// Define a reusable component for sortable headers
const SortableHeader = ({
  column,
  title,
  className = "",
}: {
  column: Column<Story | CombinedIssue>;
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
const columns: ColumnDef<Story | CombinedIssue>[] = [
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
    accessorKey: "totalSpentTime",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title={visibleColumns["totalSpentTime"]}
        className="w-full justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        {Math.round(row.original.totalSpentTime)} hrs
      </div>
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
          individualRowCategories.includes(selectedCategory)
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

export function IssueTable({
  data,
  issues,
  memberName,
}: {
  data: IssueOverviewData;
  issues: Story[] | CombinedIssue[];
  memberName?: string;
}) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      author: false,
      percentDone: false,
      created: false,
      startDate: false,
      updated: false,
      lastUpdatedBy: false,
      dueStatus: false,
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 100,
  });

  // Get unique tracker values from the data
  const trackerOptions = React.useMemo(() => {
    const trackers = issues.map((story) => story.tracker);
    const uniqueTrackers = Array.from(new Set(trackers)).filter(Boolean);

    // Add special options for Story and Suggestion without subtasks
    const hasStory = uniqueTrackers.includes("Story");
    const hasSuggestion = uniqueTrackers.includes("Suggestion");

    const options = [...uniqueTrackers];
    if (hasStory) options.push("Story without subtasks");
    if (hasSuggestion) options.push("Suggestion without subtasks");

    return options;
  }, [issues]);
  const statusOptions = React.useMemo(() => {
    const statuses = issues.map((story) => story.status);
    return Array.from(new Set(statuses)).filter(Boolean);
  }, [issues]);
  const priorityOptions = React.useMemo(() => {
    const priorities = issues.map((story) => story.priority);
    return Array.from(new Set(priorities)).filter(Boolean);
  }, [issues]);
  const issueCategoriesOptions = React.useMemo(() => {
    const issueCategories = issues.map((story) => story.issueCategories);
    const individualCategories = issueCategories
      .filter(Boolean)
      .flatMap((category) => category.split(",").map((item) => item.trim()))
      .filter(Boolean);
    return Array.from(new Set(individualCategories));
  }, [issues]);
  const triggeredByOptions = React.useMemo(() => {
    const triggeredByValues = issues.map((story) => story.triggeredBy);
    return Array.from(new Set(triggeredByValues)).filter(Boolean);
  }, [issues]);

  const table = useReactTable({
    data: issues,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Get the current tracker filter value
  const trackerFilterValue =
    table.getColumn("tracker")?.getFilterValue() &&
    Array.isArray(table.getColumn("tracker")?.getFilterValue())
      ? (table.getColumn("tracker")?.getFilterValue() as string[])
      : [];
  const statusFilterValue =
    table.getColumn("status")?.getFilterValue() &&
    Array.isArray(table.getColumn("status")?.getFilterValue())
      ? (table.getColumn("status")?.getFilterValue() as string[])
      : [];
  const priorityFilterValue =
    table.getColumn("priority")?.getFilterValue() &&
    Array.isArray(table.getColumn("priority")?.getFilterValue())
      ? (table.getColumn("priority")?.getFilterValue() as string[])
      : [];
  const issueCategoriesFilterValue =
    table.getColumn("issueCategories")?.getFilterValue() &&
    Array.isArray(table.getColumn("issueCategories")?.getFilterValue())
      ? (table.getColumn("issueCategories")?.getFilterValue() as string[])
      : [];

  const completionRateClick = () => {
    table.resetColumnFilters();
    table.getColumn("dueStatus")?.setFilterValue(FeatureStatus.ONTIME);
  };
  const inProgressClick = () => {
    table.resetColumnFilters();
    table.getColumn("dueStatus")?.setFilterValue(FeatureStatus.INPROGRESS);
  };
  const overdueClick = () => {
    table.resetColumnFilters();
    table.getColumn("dueStatus")?.setFilterValue(FeatureStatus.LATE);
  };
  const criticalBugsClick = () => {
    let priorities = priorityOptions.filter((item) =>
      ["Urgent", "Immediate"].includes(item)
    );
    if (priorities.length === 0) {
      priorities = ["Urgent", "Immediate"];
    }
    table.resetColumnFilters();
    table.getColumn("tracker")?.setFilterValue(["Bug"]);
    table.getColumn("priority")?.setFilterValue(priorities);
  };
  const highBugsClick = () => {
    table.resetColumnFilters();
    table.getColumn("tracker")?.setFilterValue(["Bug"]);
    table.getColumn("priority")?.setFilterValue(["High"]);
  };
  const postReleaseBugsClick = () => {
    table.resetColumnFilters();
    table.getColumn("tracker")?.setFilterValue(["Bug"]);
    table.getColumn("issueCategories")?.setFilterValue("Post-Release Issue");
  };
  const bugsFoundClick = () => {
    table.resetColumnFilters();
    table.getColumn("tracker")?.setFilterValue(["Bug"]);
    table.getColumn("author")?.setFilterValue([memberName]);
  };
  const supportedClick = () => {
    table.resetColumnFilters();
    // Filter for bugs where triggeredBy is not the current member
    if (memberName) {
      const otherTriggeredBy = triggeredByOptions.filter((triggered) => {
        const triggeredNames = triggered.split(",").map((name) => name.trim());
        return !triggeredNames.includes(memberName);
      });
      table.getColumn("triggeredBy")?.setFilterValue(otherTriggeredBy);
    }
  };

  return (
    <>
      <IssueOverview
        data={data}
        issues={issues}
        memberName={memberName}
        actions={{
          completionRateClick,
          inProgressClick,
          overdueClick,
          criticalBugsClick,
          highBugsClick,
          postReleaseBugsClick,
          bugsFoundClick,
          supportedClick,
        }}
      />
      <div className="w-full flex-col justify-start gap-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* Tracker Multi-Select Filter */}
            <MultiSelectFilter
              options={trackerOptions}
              selectedValues={trackerFilterValue}
              onSelectionChange={(values) => {
                table
                  .getColumn("tracker")
                  ?.setFilterValue(values.length > 0 ? values : undefined);
              }}
              placeholder="All Trackers"
              popoverWidth="w-56"
            />

            {/* Status Multi-Select Filter */}
            <MultiSelectFilter
              options={statusOptions}
              selectedValues={statusFilterValue}
              onSelectionChange={(values) => {
                table
                  .getColumn("status")
                  ?.setFilterValue(values.length > 0 ? values : undefined);
              }}
              placeholder="All Statuses"
            />

            {/* Priority Multi-Select Filter */}
            <MultiSelectFilter
              options={priorityOptions}
              selectedValues={priorityFilterValue}
              onSelectionChange={(values) => {
                table
                  .getColumn("priority")
                  ?.setFilterValue(values.length > 0 ? values : undefined);
              }}
              placeholder="All Priorities"
            />

            {/* Issue Categories Multi-Select Filter */}
            <MultiSelectFilter
              options={issueCategoriesOptions}
              selectedValues={issueCategoriesFilterValue}
              onSelectionChange={(values) => {
                table
                  .getColumn("issueCategories")
                  ?.setFilterValue(values.length > 0 ? values : undefined);
              }}
              placeholder="All Issue Categories"
            />

            {columnFilters.length > 0 && (
              <>
                <Separator orientation="vertical" className="mx-2 !h-4" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.resetColumnFilters()}
                >
                  Reset
                  <X className="ml-1" />
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <span className="hidden lg:inline">Customize Columns</span>
                  <span className="lg:hidden">Columns</span>
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {
                          visibleColumns[
                            column.id as keyof typeof visibleColumns
                          ]
                        }
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                <>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            Total {table.getFilteredRowModel().rows.length} row(s)
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit mt-4">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
