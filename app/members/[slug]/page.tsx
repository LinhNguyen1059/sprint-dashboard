"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import { useDashboard } from "@/components/DashboardLayout";
import { IssueTable } from "@/components/Issue";
import { usePageTitle } from "@/hooks/use-page-title";

export default function FeatureDetail() {
  const params = useParams();
  const { slug } = params;

  const { members } = useDashboard();

  const memberData = useMemo(() => {
    if (!slug || members.length === 0) {
      return undefined;
    }
    return members.find((p) => p.slug === slug);
  }, [members, slug]);

  usePageTitle(memberData ? memberData.name : "Member");

  if (!memberData?.issues || memberData?.issues?.length === 0) {
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
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{memberData?.name}</h1>
        </div>
      </div>

      <IssueTable data={memberData} issues={memberData?.issues} />
    </div>
  );
}
