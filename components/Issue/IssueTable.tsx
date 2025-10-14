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
import { Story } from "@/lib/types";
import { Progress } from "../ui/progress";
import { bugTrackerUrl, cn, visibleColumns } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import Link from "next/link";

// Define a reusable component for sortable headers
const SortableHeader = ({
  column,
  title,
  className = "",
}: {
  column: Column<Story>;
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
const columns: ColumnDef<Story>[] = [
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
    accessorKey: "tracker",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["tracker"]} />
    ),
    filterFn: (row, id, value) => {
      return value === "" || !value || row.getValue(id) === value;
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
      return value === "" || !value || row.getValue(id) === value;
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
    accessorKey: "priority",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["priority"]} />
    ),
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["dueDate"]} />
    ),
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
    accessorKey: "totalSpentTime",
    header: ({ column }) => (
      <SortableHeader
        column={column}
        title={visibleColumns["totalSpentTime"]}
        className="w-full justify-end"
      />
    ),
    cell: ({ row }) => (
      <div className="text-right">{row.original.totalSpentTime} hrs</div>
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
    accessorKey: "closed",
    header: ({ column }) => (
      <SortableHeader column={column} title={visibleColumns["closed"]} />
    ),
  },
];

export function IssueTable({ data: initialData }: { data: Story[] }) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      percentDone: false,
      doneBy: false,
      issueCategories: false,
      created: false,
      startDate: false,
      updated: false,
      lastUpdatedBy: false,
      closed: false,
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Get unique tracker values from the data
  const trackerOptions = React.useMemo(() => {
    const trackers = initialData.map((story) => story.tracker);
    return Array.from(new Set(trackers)).filter(Boolean);
  }, [initialData]);
  const statusOptions = React.useMemo(() => {
    const statuses = initialData.map((story) => story.status);
    return Array.from(new Set(statuses)).filter(Boolean);
  }, [initialData]);
  const assigneeOptions = React.useMemo(() => {
    const assignees = initialData.map((story) => story.assignee);
    return Array.from(new Set(assignees)).filter(Boolean);
  }, [initialData]);

  const table = useReactTable({
    data: initialData,
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
    (table.getColumn("tracker")?.getFilterValue() as string) || "";
  const statusFilterValue =
    (table.getColumn("status")?.getFilterValue() as string) || "";
  const assigneeFilterValue =
    (table.getColumn("assignee")?.getFilterValue() as string) || "";

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Tracker Filter Dropdown */}
          <Select
            value={trackerFilterValue}
            onValueChange={(value) => {
              table
                .getColumn("tracker")
                ?.setFilterValue(value === "all" ? "" : value);
            }}
          >
            <SelectTrigger size="sm" className="w-32" id="tracker-filter">
              <SelectValue placeholder="All Trackers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trackers</SelectItem>
              {trackerOptions.map((tracker) => (
                <SelectItem key={tracker} value={tracker}>
                  {tracker}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilterValue}
            onValueChange={(value) => {
              table
                .getColumn("status")
                ?.setFilterValue(value === "all" ? "" : value);
            }}
          >
            <SelectTrigger size="sm" className="w-32" id="status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={assigneeFilterValue}
            onValueChange={(value) => {
              table
                .getColumn("assignee")
                ?.setFilterValue(value === "all" ? "" : value);
            }}
          >
            <SelectTrigger size="sm" className="w-32" id="assignee-filter">
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {assigneeOptions.map((assignee) => (
                <SelectItem key={assignee} value={assignee}>
                  {assignee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                      {visibleColumns[column.id as keyof typeof visibleColumns]}
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
          {table.getFilteredRowModel().rows.length} row(s)
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
                {[10, 20, 30, 40, 50].map((pageSize) => (
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
  );
}
