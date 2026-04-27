"use client";

import * as React from "react";
import {
  ColumnFiltersState,
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

import { CombinedIssue } from "@/lib/types";

import { columns, getMultiFilterValue, getUniqueValues } from "./issue.utils";

export function useIssueTable(issues: CombinedIssue[]) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      author: false,
      percentDone: false,
      created: false,
      startDate: false,
      updated: false,
      lastUpdatedBy: false,
      dueStatus: false,
      // Virtual filter-only columns — never rendered
      excludeStatuses: false,
      triggeredByMember: false,
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
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
  const statusOptions = React.useMemo(
    () => getUniqueValues(issues, "status"),
    [issues],
  );
  const priorityOptions = React.useMemo(
    () => getUniqueValues(issues, "priority"),
    [issues],
  );
  const issueCategoriesOptions = React.useMemo(() => {
    const issueCategories = issues.map((story) => story.issueCategories);
    const individualCategories = issueCategories
      .filter(Boolean)
      .flatMap((category) => category.split("; ").map((item) => item.trim()))
      .filter(Boolean);
    return Array.from(new Set(individualCategories));
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

  const trackerFilterValue = getMultiFilterValue(
    table.getColumn("tracker")?.getFilterValue(),
  );
  const statusFilterValue = getMultiFilterValue(
    table.getColumn("status")?.getFilterValue(),
  );
  const priorityFilterValue = getMultiFilterValue(
    table.getColumn("priority")?.getFilterValue(),
  );
  const issueCategoriesFilterValue = getMultiFilterValue(
    table.getColumn("issueCategories")?.getFilterValue(),
  );

  /** Resets all column filters then applies the provided set of filter values. */
  const applyOverviewFilter = (filters: Record<string, unknown>) => () => {
    table.resetColumnFilters();
    for (const [col, val] of Object.entries(filters)) {
      table.getColumn(col)?.setFilterValue(val);
    }
  };

  /** Returns an `onSelectionChange` handler that sets a named column filter. */
  const setColumnFilter = (columnId: string) => (values: string[]) => {
    table
      .getColumn(columnId)
      ?.setFilterValue(values.length > 0 ? values : undefined);
  };

  return {
    table,
    trackerOptions,
    statusOptions,
    priorityOptions,
    issueCategoriesOptions,
    trackerFilterValue,
    statusFilterValue,
    priorityFilterValue,
    issueCategoriesFilterValue,
    applyOverviewFilter,
    columnFilters,
    setColumnFilter,
  };
}

export type UseIssueTableReturn = ReturnType<typeof useIssueTable>;
