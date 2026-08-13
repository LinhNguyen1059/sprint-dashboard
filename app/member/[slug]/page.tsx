"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FileDown } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { IssueTable, useIssueTable } from "@/components/issue";
import { MemberIssueOverview } from "@/components/member";
import { usePageTitle } from "@/hooks/use-page-title";
import { useMemberData } from "@/hooks/use-member-data";
import { excludedIssueCategories } from "@/lib/utils";
import { FeatureStatus } from "@/lib/types";

const POINT_ENTRY_TRACKERS = new Set([
  "Task",
  "Tasks",
  "Task_Src",
  "Task_Scr",
  "Suggestion",
]);

export default function MemberPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const memberSlug = slug as string;

  const {
    memberData,
    handleExport,
    isExporting,
    pointMode,
    setPointMode,
    committedPoints,
    setCommittedPoint,
  } = useMemberData(memberSlug);

  const pointEntryIssues = useMemo(() => {
    const issues = memberData?.issues ?? [];
    if (!pointMode) return issues;
    return issues.filter((issue) => POINT_ENTRY_TRACKERS.has(issue.tracker));
  }, [memberData?.issues, pointMode]);

  const handleCommittedPointChange = useCallback(
    (issueUuid: string, value: number | undefined) => {
      setCommittedPoint(memberSlug, issueUuid, value);
    },
    [memberSlug, setCommittedPoint],
  );

  const {
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
  } = useIssueTable(pointEntryIssues ?? [], {
    pointEntryMode: pointMode,
    committedPointsByIssueUuid: committedPoints,
    onCommittedPointChange: handleCommittedPointChange,
  });

  usePageTitle(memberData?.name ?? "Member");

  const completionRateClick = applyOverviewFilter({
    tracker: ["Tasks", "Task_Scr", "Suggestion", "Bug"],
    status: ["Closed", "Resolved", "Rejected"],
    user: memberData?.name,
  });
  const inProgressClick = applyOverviewFilter({
    tracker: ["Tasks", "Task_Scr", "Suggestion", "Bug"],
    status: ["Waiting", "Confirmed", "In Progress", "Feedback", "Reopened"],
    user: memberData?.name,
  });
  const overdueClick = applyOverviewFilter({
    tracker: ["Tasks", "Task_Scr"],
    dueStatus: FeatureStatus.LATE,
  });
  const totalCreatedBugsClick = applyOverviewFilter({
    tracker: ["Bug"],
    priority: ["High", "Urgent", "Immediate"],
    excludeIssueCategories: excludedIssueCategories,
    excludeStatuses: ["Rejected"],
    triggeredByMember: memberData?.name,
  });
  const totalFixedBugsClick = applyOverviewFilter({
    tracker: ["Bug"],
    status: ["Closed"],
    user: memberData?.name,
  });
  const totalFoundBugsClick = applyOverviewFilter({
    tracker: ["Bug"],
    author: memberData?.name,
  });
  const totalConfirmedBugsClick = applyOverviewFilter({
    tracker: ["Bug"],
    doneBy: memberData?.name,
  });

  if (!memberData?.issues?.length) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Member Board</h1>
          <p className="text-muted-foreground">Not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/member">Members</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{memberData?.name ?? "Member"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-2">
        <div className="flex items-center gap-2 w-full justify-between">
          <h1 className="text-2xl font-bold">{memberData.name}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant={pointMode ? "secondary" : "outline"}
              size="sm"
              onClick={() => setPointMode(memberSlug, !pointMode)}
            >
              {pointMode ? "Hide points" : "Add point"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
            >
              <FileDown /> {isExporting ? "Exporting…" : "Export"}
            </Button>
          </div>
        </div>
      </div>

      <MemberIssueOverview
        actions={{
          completionRateClick,
          inProgressClick,
          overdueClick,
          totalCreatedBugsClick,
          totalFixedBugsClick,
          totalFoundBugsClick,
          totalConfirmedBugsClick,
        }}
      />

      <IssueTable
        table={table}
        trackerOptions={trackerOptions}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        issueCategoriesOptions={issueCategoriesOptions}
        trackerFilterValue={trackerFilterValue}
        statusFilterValue={statusFilterValue}
        priorityFilterValue={priorityFilterValue}
        issueCategoriesFilterValue={issueCategoriesFilterValue}
        applyOverviewFilter={applyOverviewFilter}
        columnFilters={columnFilters}
        setColumnFilter={setColumnFilter}
      />
    </div>
  );
}
