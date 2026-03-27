"use client";

import { Bug, BugOff, Clock, Play, TrendingUp } from "lucide-react";
import { useParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMemberData } from "@/hooks/use-member-data";

export interface IssueOverviewData {
  completion: number;
  inprogress: number;
  overdueTasks: number;
  totalCreatedBugs: number;
  totalFixedBugs: number;
  totalSpentTime: number;
  totalFoundBugs: number;
  totalConfirmedBugs: number;
}

export interface IssueOverviewActions {
  completionRateClick?: () => void;
  inProgressClick?: () => void;
  overdueClick?: () => void;
  totalCreatedBugsClick?: () => void;
  totalFixedBugsClick?: () => void;
  totalFoundBugsClick?: () => void;
  totalConfirmedBugsClick?: () => void;
}

interface IssueOverviewProps {
  actions: IssueOverviewActions;
}

export function IssueOverview({ actions }: IssueOverviewProps) {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { isTesterMember, overviewData } = useMemberData(slug as string);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Card
        className={cn(
          "shadow-none py-4 gap-4",
          !!actions?.completionRateClick && "hover:cursor-pointer",
        )}
        onClick={actions?.completionRateClick}
      >
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold">{overviewData.completion}%</div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "shadow-none py-4 gap-4",
          !!actions?.inProgressClick && "hover:cursor-pointer",
        )}
        onClick={actions?.inProgressClick}
      >
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            In Progress Rate
          </CardTitle>
          <Play className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold">{overviewData.inprogress}%</div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "shadow-none py-4 gap-4",
          !!actions?.overdueClick && "hover:cursor-pointer",
        )}
        onClick={actions?.overdueClick}
      >
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Total Overdue Tasks
          </CardTitle>
          <Clock className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold text-red-500">
            {overviewData.overdueTasks}
          </div>
        </CardContent>
      </Card>

      {isTesterMember ? (
        <>
          <Card
            className={cn(
              "shadow-none py-4 gap-4",
              !!actions?.totalFoundBugsClick && "hover:cursor-pointer",
            )}
            onClick={actions?.totalFoundBugsClick}
          >
            <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Total Found Bugs
              </CardTitle>
              <Bug className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent className="px-4">
              <div className="text-2xl font-bold text-red-500">
                {overviewData.totalFoundBugs}
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "shadow-none py-4 gap-4",
              !!actions?.totalConfirmedBugsClick && "hover:cursor-pointer",
            )}
            onClick={actions?.totalConfirmedBugsClick}
          >
            <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Total Confirmed Bugs
              </CardTitle>
              <BugOff className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent className="px-4">
              <div className="text-2xl font-bold text-orange-500">
                {overviewData.totalConfirmedBugs}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card
            className={cn(
              "shadow-none py-4 gap-4",
              !!actions?.totalCreatedBugsClick && "hover:cursor-pointer",
            )}
            onClick={actions?.totalCreatedBugsClick}
          >
            <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Total Created Bugs
              </CardTitle>
              <Bug className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent className="px-4">
              <div className="text-2xl font-bold text-red-500">
                {overviewData.totalCreatedBugs}
              </div>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "shadow-none py-4 gap-4",
              !!actions?.totalFixedBugsClick && "hover:cursor-pointer",
            )}
            onClick={actions?.totalFixedBugsClick}
          >
            <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Total Fixed Bugs
              </CardTitle>
              <BugOff className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent className="px-4">
              <div className="text-2xl font-bold text-orange-500">
                {overviewData.totalFixedBugs}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card className={cn("shadow-none py-4 gap-4")}>
        <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Total Spent Time (hrs)
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-2xl font-bold">
            {overviewData.totalSpentTime}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
