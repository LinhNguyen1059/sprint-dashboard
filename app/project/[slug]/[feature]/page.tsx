"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { IssueTable, useIssueTable } from "@/components/issue";
import { flattenedIssues, getFeatureStatus } from "@/lib/utils";
import { usePageTitle } from "@/hooks/use-page-title";
import { useDashboardStore } from "@/stores/dashboardStore";
import { ProjectIssueOverview } from "@/components/project";
import { FeatureStatus } from "@/lib/types";

export default function FeatureDetail() {
  const params = useParams();
  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : (params.slug as string);
  const feature = Array.isArray(params.feature)
    ? params.feature[0]
    : (params.feature as string);

  const { getFeatureBySlug, getProjectBySlug } = useDashboardStore();

  const project = getProjectBySlug(slug);
  const featureData = useMemo(() => {
    if (!slug || !feature) {
      return undefined;
    }
    return getFeatureBySlug(slug, feature);
  }, [feature, getFeatureBySlug, slug, project]);

  const featureIssues = useMemo(() => {
    if (!featureData) {
      return [];
    }

    return flattenedIssues([featureData]);
  }, [featureData]);

  const featureStatus = useMemo(() => {
    if (!featureData) return null;
    return getFeatureStatus(featureData.dueStatus);
  }, [featureData]);

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
  } = useIssueTable(featureIssues ?? []);

  usePageTitle(featureData ? featureData.subject : "Feature Detail");

  const completionRateClick = applyOverviewFilter({
    tracker: ["Tasks", "Task_Scr", "Suggestion", "Bug"],
    status: ["Closed", "Resolved", "Rejected"],
  });
  const inProgressClick = applyOverviewFilter({
    tracker: ["Tasks", "Task_Scr", "Suggestion", "Bug"],
    status: ["Waiting", "Confirmed", "In Progress", "Feedback", "Reopened"],
  });
  const overdueClick = applyOverviewFilter({
    tracker: ["Tasks", "Task_Scr"],
    dueStatus: FeatureStatus.LATE,
  });
  const criticalBugsClick = applyOverviewFilter({
    tracker: ["Bug"],
    priority: ["Urgent", "Immediate"],
    excludeIssueCategories: ["Post-Release Issue"],
  });
  const highBugsClick = applyOverviewFilter({
    tracker: ["Bug"],
    priority: ["High"],
    excludeIssueCategories: ["Post-Release Issue"],
  });
  const postReleaseBugsClick = applyOverviewFilter({
    isPostReleaseBug: true,
  });

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Projects</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/project/${slug}`}>{project?.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{featureData?.subject}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{featureData?.subject}</h1>
          {featureStatus && (
            <Badge variant="outline" className={featureStatus.class}>
              {featureStatus.icon && <featureStatus.icon />}
              {featureStatus.text}
            </Badge>
          )}
        </div>
      </div>

      <ProjectIssueOverview
        feature={featureData}
        actions={{
          completionRateClick,
          inProgressClick,
          overdueClick,
          criticalBugsClick,
          highBugsClick,
          postReleaseBugsClick,
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
