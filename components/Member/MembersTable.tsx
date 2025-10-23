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
  Table,
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
  Search,
  X,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CombinedIssue, FeatureStatus, Member } from "@/lib/types";
import { checkCriticalBugs, cn } from "@/lib/utils";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { MultiSelectFilter } from "../MultiSelectFilter";
import { Separator } from "../ui/separator";
import { MEMBER_ROLE } from "@/lib/teams";

const visibleColumns = {
  name: "Member name",
  timeSpent: "Time spent",
  criticalBugs: "Critical bugs",
  highBugs: "High bugs",
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
      selectedProjects.includes(issue.projectName)
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
const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Name" />,
    cell: ({ row }) => (
      <div className="min-w-80">
        <Link
          href={`/members/${row.original.slug}`}
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
          issue.dueStatus === FeatureStatus.ONTIME
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
        acc += issue.totalSpentTime;
        return acc;
      }, 0);

      return <div className="text-right">{Math.round(timeSpent)} hrs</div>;
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

      const criticalBugs = checkCriticalBugs(
        row.original.name,
        filteredIssues,
        false
      );

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

      const highBugs = filteredIssues.filter(
        (issue) => issue.priority === "High" && issue.tracker === "Bug"
      );

      return <div className="text-right">{highBugs.length}</div>;
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

      const postReleaseBugs = checkCriticalBugs(
        row.original.name,
        filteredIssues,
        true
      );

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
          memberProjects.includes(selectedProject)
        );
      }

      return memberProjects.includes(value);
    },
  },
];

export function MembersTable({ data: initialData }: { data: Member[] }) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      projects: false,
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 50,
  });

  const table = useReactTable({
    data: initialData,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.slug,
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

  const roleOptions = React.useMemo(() => {
    const roles = initialData.map((mem) => mem.role);
    return Array.from(new Set(roles)).filter(Boolean);
  }, [initialData]);

  const projectOptions = React.useMemo(() => {
    const allProjects = initialData.flatMap((mem) => mem.projects);
    return Array.from(new Set(allProjects)).filter(Boolean);
  }, [initialData]);

  // Get the current name filter value
  const nameFilterValue = table.getColumn("name")?.getFilterValue() ?? "";
  const roleFilterValue =
    table.getColumn("role")?.getFilterValue() &&
    Array.isArray(table.getColumn("role")?.getFilterValue())
      ? (table.getColumn("role")?.getFilterValue() as string[])
      : [];
  const projectFilterValue =
    table.getColumn("projects")?.getFilterValue() &&
    Array.isArray(table.getColumn("projects")?.getFilterValue())
      ? (table.getColumn("projects")?.getFilterValue() as string[])
      : [];

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={nameFilterValue as string}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pl-8"
            />
          </div>

          {/* Role Multi-Select Filter */}
          <MultiSelectFilter
            options={roleOptions}
            selectedValues={roleFilterValue}
            onSelectionChange={(values) => {
              table
                .getColumn("role")
                ?.setFilterValue(values.length > 0 ? values : undefined);
            }}
            placeholder="All Roles"
          />

          {/* Projects Multi-Select Filter */}
          <MultiSelectFilter
            options={projectOptions}
            selectedValues={projectFilterValue}
            onSelectionChange={(values) => {
              table
                .getColumn("projects")
                ?.setFilterValue(values.length > 0 ? values : undefined);
            }}
            placeholder="All Projects"
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
                      {visibleColumns[column.id as keyof typeof visibleColumns]}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <TableUI>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
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
        </TableUI>
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
