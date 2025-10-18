"use client";

import React from "react";

import { useDashboard } from "@/components/DashboardLayout";
import { MembersTable } from "@/components/Member/MembersTable";

const MembersPage: React.FC = () => {
  const { members } = useDashboard();

  if (members.length === 0) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Members Board</h1>
          <p className="text-muted-foreground">
            You don&apos;t have any members yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Members Board</h1>
        <p className="text-muted-foreground">List of your team members</p>
      </div>

      <MembersTable data={members} />
    </div>
  );
};

export default MembersPage;
