"use client";

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

export default function MemberPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { memberData, handleExport } = useMemberData(slug as string);

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
  } = useIssueTable(memberData?.issues ?? []);

  usePageTitle(memberData?.name ?? "Member");

  const completionRateClick = applyOverviewFilter({
    tracker: ["Tasks", "Task_Scr", "Suggestion", "Bug"],
    status: ["Closed"],
    assigneeOrDoneBy: memberData?.name,
  });
  const inProgressClick = applyOverviewFilter({
    tracker: ["Tasks", "Task_Scr", "Suggestion", "Bug"],
    status: ["Waiting", "Confirmed", "In Progress"],
    assigneeOrDoneBy: memberData?.name,
  });
  const overdueClick = applyOverviewFilter({
    tracker: ["Tasks", "Task_Scr"],
    dueStatus: FeatureStatus.LATE,
  });
  const totalCreatedBugsClick = applyOverviewFilter({
    tracker: ["Bug"],
    priority: ["High", "Urgent", "Immediate"],
    excludeIssueCategories: excludedIssueCategories,
  });
  const totalFixedBugsClick = applyOverviewFilter({
    tracker: ["Bug"],
    status: ["Closed"],
    assigneeOrDoneBy: memberData?.name,
    excludeIssueCategories: excludedIssueCategories,
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
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown /> Export CSV
          </Button>
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
