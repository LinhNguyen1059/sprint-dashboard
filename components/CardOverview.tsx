"use client";

import Link from "next/link";
import { Bug, Clock, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Project } from "@/lib/types";

export interface Metrics extends Project {
  totalFeatures: number;
  averageFeatureProgress: number;
  totalPostReleaseBugs: number;
  totalSpentTime: number;
  totalCriticalBugs: number;
  isInprogress: boolean;
  percentOnTime: number;
}

interface Props {
  metrics: Metrics[];
  slug: string;
}

export default function CardOverview({ metrics, slug }: Props) {
  if (!metrics || metrics.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {metrics.map((metric) => {
        const maxAcceptableBugs = metric.totalDevs * 5;
        const quotaUsed = (metric.totalCriticalBugs / maxAcceptableBugs) * 100;
        const quotaHealth = 100 - quotaUsed;

        let color = "";
        if (quotaHealth >= 90) {
          color = "text-green-700 border-green-700/10";
        } else if (quotaHealth >= 70) {
          color = "text-orange-500 border-orange-500/10";
        } else {
          color = "text-red-500 border-red-500/10";
        }

        return (
          <Link
            key={metric.slug}
            href={`/${slug}/${metric.slug}`}
            className="block"
          >
            <Card className="h-full shadow-none gap-0 hover:shadow-sm py-4">
              <CardHeader className="pb-4 px-4">
                <CardTitle className="text-xl">{metric.name}</CardTitle>
                <CardDescription
                  className={cn(
                    "text-sm",
                    metric.isInprogress && "text-blue-500",
                    metric.percentOnTime >= 90
                      ? "text-green-700"
                      : "text-orange-500"
                  )}
                >
                  {metric.isInprogress
                    ? "In Progress"
                    : `${metric.percentOnTime}% Features On Time`}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="font-medium text-lg">
                      {metric.totalFeatures} Features
                    </div>

                    <div className="flex items-center gap-2">
                      <Progress
                        value={metric.averageFeatureProgress}
                        className="h-2 bg-primary/10"
                        progressClassName="bg-blue-500"
                      />
                      <span className="font-medium text-xs">
                        {metric.averageFeatureProgress}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1 flex items-center gap-1">
                      <Bug size={14} /> Critical Bugs
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className={color}>
                        {metric.totalCriticalBugs} / {maxAcceptableBugs}
                        <span>Pre-Release</span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-(--chart-1) border-(--chart-1)/10"
                      >
                        {metric.totalPostReleaseBugs}
                        <span>Post-Release</span>
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium flex items-center gap-1">
                      <Clock size={14} /> Spent time
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-700">
                      {Math.round(metric.totalSpentTime)} hrs
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1 flex items-center gap-1">
                      <Users size={14} /> Teams
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-blue-500 bg-blue-500/10"
                      >
                        <span>{metric.totalDevs} dev(s)</span>
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-pink-500 bg-pink-500/10"
                      >
                        <span>
                          {metric.totalMembers - metric.totalDevs} tester(s)
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
