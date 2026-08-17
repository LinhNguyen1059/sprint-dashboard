"use client";

import {
  Activity,
  AlertTriangle,
  Bug,
  BugOff,
  Calculator,
  Clock,
  Play,
  ShieldAlert,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, type DevScoreOverview } from "@/lib/utils";
import { useMemberData } from "@/hooks/use-member-data";

export interface MemberIssueOverviewActions {
  completionRateClick?: () => void;
  inProgressClick?: () => void;
  overdueClick?: () => void;
  totalCreatedBugsClick?: () => void;
  totalFixedBugsClick?: () => void;
  totalFoundBugsClick?: () => void;
  totalConfirmedBugsClick?: () => void;
}

interface MemberIssueOverviewProps {
  actions: MemberIssueOverviewActions;
  pointOverview?: DevScoreOverview;
}

export function MemberIssueOverview({
  actions,
  pointOverview,
}: MemberIssueOverviewProps) {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { isTesterMember, memberData } = useMemberData(slug as string);

  if (pointOverview) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className={cn("shadow-none py-4 gap-4")}>
          <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Total Earned Point
            </CardTitle>
            <Trophy className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-2xl font-bold">
              {pointOverview.totalEarnedPoint}
            </div>
          </CardContent>
        </Card>

        <Card className={cn("shadow-none py-4 gap-4")}>
          <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Critical Bugs</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-2xl font-bold text-red-500">
              {pointOverview.criticalBugs}
            </div>
          </CardContent>
        </Card>

        <Card className={cn("shadow-none py-4 gap-4")}>
          <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">High Bugs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-2xl font-bold text-orange-500">
              {pointOverview.highBugs}
            </div>
          </CardContent>
        </Card>

        <Card className={cn("shadow-none py-4 gap-4")}>
          <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Bug Density</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-2xl font-bold">{pointOverview.bugDensity}</div>
          </CardContent>
        </Card>

        <Card className={cn("shadow-none py-4 gap-4")}>
          <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-lime-600" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-2xl font-bold">
              {pointOverview.qualityScore}
            </div>
          </CardContent>
        </Card>

        <Card className={cn("shadow-none py-4 gap-4")}>
          <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Max Team Point
            </CardTitle>
            <Calculator className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-2xl font-bold">
              {pointOverview.maxTeamPoint}
            </div>
          </CardContent>
        </Card>

        <Card className={cn("shadow-none py-4 gap-4")}>
          <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Delivery Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-2xl font-bold">
              {pointOverview.deliveryScore}
            </div>
          </CardContent>
        </Card>

        <Card className={cn("shadow-none py-4 gap-4")}>
          <CardHeader className="pb-0 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Total Score</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="text-2xl font-bold">{pointOverview.totalScore}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <div className="text-2xl font-bold">{memberData?.completion}%</div>
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
          <div className="text-2xl font-bold">{memberData?.inprogress}%</div>
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
            {memberData?.overdueTasks}
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
                {memberData?.totalFoundBugs}
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
                {memberData?.totalConfirmedBugs}
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
                {memberData?.totalCreatedBugs}
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
                {memberData?.totalFixedBugs}
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
          <div className="text-2xl font-bold">{memberData?.totalSpentTime}</div>
        </CardContent>
      </Card>
    </div>
  );
}
