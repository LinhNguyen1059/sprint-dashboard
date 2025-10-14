"use client";

import Link from "next/link";
import Image from "next/image";
import { Bug, Clock, Loader } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Metrics {
  name: string;
  slug: string;
  totalFeatures: number;
  averageFeatureProgress: number;
  totalDevelopmentBugs: number;
  totalPostReleaseBugs: number;
  totalSpentTime: number;
  isInprogress: boolean;
  percentOnTime: number;
  totalMembers: number;
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
      {metrics.map((metric) => (
        <Link
          key={metric.slug}
          href={`/${slug}/${metric.slug}`}
          className="block"
        >
          <Card className="h-full shadow-none gap-0 hover:shadow-sm py-4">
            <CardHeader className="pb-2 px-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{metric.name}</CardTitle>
                {metric.isInprogress ? (
                  <Badge
                    variant="outline"
                    className="text-(--chart-2) border-(--chart-2)/10 px-1.5"
                  >
                    <Loader />
                    In Progress
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-1.5",
                      metric.percentOnTime >= 90
                        ? "text-green-500 border-green-100"
                        : "text-orange-500 border-orange-100"
                    )}
                  >
                    {metric.percentOnTime}% Features On Time
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4">
              <div className="flex flex-col gap-3">
                <div>
                  <div className="font-medium">
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
                  <div className="font-medium mb-1">Bugs</div>
                  <div className="flex flex-wrap gap-1">
                    <Badge
                      variant="secondary"
                      className="text-(--chart-5) bg-(--chart-5)/10"
                    >
                      <Bug className="h-4 w-4" />
                      {metric.totalDevelopmentBugs}
                      <span>Development</span>
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-(--chart-1) bg-(--chart-1)/10"
                    >
                      <Bug className="h-4 w-4" />
                      {metric.totalPostReleaseBugs}
                      <span>Post-Release</span>
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="font-medium">Spent time</div>
                  <div className="flex items-center gap-1 font-medium text-green-500">
                    <Clock className="h-4 w-4" />
                    {metric.totalSpentTime} hrs
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex -space-x-2">
                    <Image src="/male.png" alt="Male" width={32} height={32} />
                    <Image
                      src="/female.png"
                      alt="Male"
                      width={32}
                      height={32}
                    />
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs">+{metric.totalMembers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
