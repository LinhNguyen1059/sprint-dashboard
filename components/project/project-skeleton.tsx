"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ProjectCardSkeleton() {
  return (
    <Card className="h-full shadow-none gap-0 py-4">
      <CardHeader className="pb-4 px-4">
        {/* Title */}
        <Skeleton className="h-6 w-2/3" />
        {/* Description */}
        <Skeleton className="h-4 w-1/2 mt-1" />
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex flex-col gap-3">
          {/* Features + progress */}
          <div>
            <Skeleton className="h-5 w-1/3 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 flex-1" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>

          {/* Critical Bugs */}
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <div className="flex gap-1">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>

          {/* Spent time */}
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Teams */}
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 lg:px-6 px-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Projects Board</h1>
        <p className="text-muted-foreground"> </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
