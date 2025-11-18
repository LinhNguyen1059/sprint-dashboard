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
  VisibilityState
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Feature } from "@/lib/types";
import { Progress } from "../ui/progress";
import {
  bugTrackerUrl,
  cn,
  getFeatureStatus,
  visibleColumns
} from "@/lib/utils";

// Define a reusable component for sortable headers
const SortableHeader = ({
  column,
  title,
  className = ""
}: {
  column: Column<Feature>;
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

export function FeatureTable({
  data: initialData,
  slug,
  route
}: {
  data: Feature[];
  slug: string;
  route: string;
}) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Define columns with clear, readable structure
  const columns: ColumnDef<Feature>[] = [
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
      )
    },
    {
      accessorKey: "subject",
      header: ({ column }) => (
        <SortableHeader column={column} title="Feature" />
      ),
      cell: ({ row }) => (
        <Link href={`/${route}/${slug}/${row.original.slug}`}>
          <Button
            variant="link"
            className="text-foreground w-fit px-0 text-left"
          >
            {row.original.subject}
          </Button>
        </Link>
      ),
      enableHiding: false
    },
    ...(route === "solutions"
      ? [
          {
            accessorKey: "projectName" as const,
            header: ({ column }: { column: Column<Feature> }) => (
              <SortableHeader column={column} title="Project" />
            ),
            cell: ({ row }: { row: { original: Feature } }) => (
              <div>{row.original.projectName}</div>
            ),
            enableHiding: false
          }
        ]
      : ([] as ColumnDef<Feature>[])),
    {
      accessorKey: "percentDone",
      header: ({ column }) => (
        <SortableHeader column={column} title="Progress" />
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
      )
    },
    {
      accessorKey: "dueStatus",
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
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
      }
    },
    {
      accessorKey: "totalSpentTime",
      header: ({ column }) => (
        <SortableHeader
          column={column}
          title="Time spent"
          className="w-full justify-end"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right">
          {Math.round(row.original.totalSpentTime)} hrs
        </div>
      )
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
      cell: ({ row }) => (
        <div className="text-right">{row.original.criticalBugs}</div>
      )
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
      cell: ({ row }) => (
        <div className="text-right">{row.original.highBugs}</div>
      )
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
      cell: ({ row }) => (
        <div className="text-right">{row.original.postReleaseBugs}</div>
      )
    }
  ];

  const table = useReactTable({
    data: initialData,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  });

  return (
    <div className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-end mb-4">
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
        </Table>
      </div>
    </div>
  );
}
