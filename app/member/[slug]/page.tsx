"use client";

import { useParams } from "next/navigation";
import { FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IssueTable } from "@/components/issue";
import { usePageTitle } from "@/hooks/use-page-title";
import { useMemberData } from "@/hooks/use-member-data";

export default function MemberPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { memberData, overviewData, handleExport } = useMemberData(
    slug as string,
  );

  usePageTitle(memberData?.name ?? "Member");

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
      <div className="space-y-2">
        <div className="flex items-center gap-2 w-full justify-between">
          <h1 className="text-2xl font-bold">{memberData.name}</h1>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown /> Export CSV
          </Button>
        </div>
      </div>

      <IssueTable
        overview={overviewData}
        issues={memberData.issues}
        memberName={memberData.name}
      />
    </div>
  );
}
