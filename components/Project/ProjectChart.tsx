"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Project, Feature, FeatureStatus } from "@/lib/types";
import { useDashboard } from "../DashboardLayout";

// Progress chart configuration
const progressConfig = {
  done: {
    key: "done",
    label: "Done",
    color: "var(--chart-12)",
  },
  inProgress: {
    key: "inProgress",
    label: "In Progress",
    color: "var(--chart-13)",
  },
  waiting: {
    key: "waiting",
    label: "Waiting",
    color: "var(--chart-14)",
  },
};

const bugConfig = {
  development: {
    key: "development",
    label: "Development",
    color: "var(--chart-1)",
  },
  ncr: {
    key: "ncr",
    label: "NCR",
    color: "var(--chart-2)",
  },
};

// Status chart configuration
const dueStatusConfig = {
  inprogress: {
    key: "inprogress",
    label: "In Progress",
    color: "var(--chart-9)",
  },
  ontime: {
    key: "ontime",
    label: "On Time",
    color: "var(--chart-7)",
  },
  late: {
    key: "late",
    label: "Late",
    color: "var(--chart-11)",
  },
};

// Time spent chart configuration
const timeSpentConfig = {
  feature: {
    label: "Feature",
  },
  // Colors will be dynamically assigned
};

// Generate distinct colors for features
const generateFeatureColor = (index: number) => {
  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
    "var(--chart-7)",
    "var(--chart-8)",
    "var(--chart-9)",
    "var(--chart-10)",
    "var(--chart-11)",
    "var(--chart-12)",
    "var(--chart-13)",
    "var(--chart-14)",
    "var(--chart-15)",
    "var(--chart-16)",
    "var(--chart-17)",
    "var(--chart-18)",
    "var(--chart-19)",
    "var(--chart-20)",
    "var(--chart-21)",
    "var(--chart-22)",
    "var(--chart-23)",
    "var(--chart-24)",
    "var(--chart-25)",
    "var(--chart-26)",
    "var(--chart-27)",
    "var(--chart-28)",
    "var(--chart-29)",
    "var(--chart-30)",
  ];
  return colors[index % colors.length];
};

// Generate dynamic config for time spent chart based on feature subjects
const generateTimeSpentConfig = (features: Feature[]) => {
  const featuresWithTime = features.filter(
    (feature) => feature.totalSpentTime > 0
  );

  const config: Record<string, { label: string; color: string }> = {};

  featuresWithTime.forEach((feature, index) => {
    const key = feature.subject;
    config[key] = {
      label: feature.subject,
      color: generateFeatureColor(index),
    };
  });

  return config;
};

export function ProjectChart() {
  const { projects } = useDashboard();
  const params = useParams();
  const { slug } = params;

  const features = useMemo(() => {
    if (projects.length === 0 || !slug) {
      return [];
    }

    const project = projects.find((p) => p.projectSlug === slug) as Project;

    if (!project || !project.features || project.features.length === 0) {
      return [];
    }

    return project.features;
  }, [projects, slug]);

  // Progress chart data based on percentDone
  const progressData = useMemo(() => {
    if (!features || features.length === 0) {
      return [
        {
          name: progressConfig.done.key,
          value: 0,
          fill: progressConfig.done.color,
        },
        {
          name: progressConfig.inProgress.key,
          value: 0,
          fill: progressConfig.inProgress.color,
        },
        {
          name: progressConfig.waiting.key,
          value: 0,
          fill: progressConfig.waiting.color,
        },
      ];
    }

    const completed = features.filter(
      (feature) => feature.percentDone === 100
    ).length;

    const inProgress = features.filter(
      (feature) => feature.percentDone > 0 && feature.percentDone < 100
    ).length;

    const notStarted = features.filter(
      (feature) => feature.percentDone === 0
    ).length;

    return [
      {
        name: progressConfig.done.key,
        value: completed,
        fill: progressConfig.done.color,
      },
      {
        name: progressConfig.inProgress.key,
        value: inProgress,
        fill: progressConfig.inProgress.color,
      },
      {
        name: progressConfig.waiting.key,
        value: notStarted,
        fill: progressConfig.waiting.color,
      },
    ];
  }, [features]);

  // Status chart data
  const dueStatusData = useMemo(() => {
    if (!features || features.length === 0) {
      return [
        {
          name: dueStatusConfig.inprogress.key,
          value: 0,
          fill: dueStatusConfig.inprogress.color,
        },
        {
          name: dueStatusConfig.ontime.key,
          value: 0,
          fill: dueStatusConfig.ontime.color,
        },
        {
          name: dueStatusConfig.late.key,
          value: 0,
          fill: dueStatusConfig.late.color,
        },
      ];
    }

    const inProgressCount = features.filter(
      (feature) => feature.dueStatus === FeatureStatus.INPROGRESS
    ).length;

    const onTimeCount = features.filter(
      (feature) => feature.dueStatus === FeatureStatus.ONTIME
    ).length;

    const lateCount = features.filter(
      (feature) => feature.dueStatus === FeatureStatus.LATE
    ).length;

    return [
      {
        name: dueStatusConfig.inprogress.key,
        value: inProgressCount,
        fill: dueStatusConfig.inprogress.color,
      },
      {
        name: dueStatusConfig.ontime.key,
        value: onTimeCount,
        fill: dueStatusConfig.ontime.color,
      },
      {
        name: dueStatusConfig.late.key,
        value: lateCount,
        fill: dueStatusConfig.late.color,
      },
    ];
  }, [features]);

  // Time spent chart data
  const timeSpentData = useMemo(() => {
    if (!features || features.length === 0) {
      return [];
    }

    const featuresWithTime = features.filter(
      (feature) => feature.totalSpentTime > 0
    );

    return featuresWithTime.map((feature, index) => ({
      name: feature.subject,
      value: feature.totalSpentTime,
      fill: generateFeatureColor(index),
    }));
  }, [features]);

  // Generate dynamic time spent config
  const dynamicTimeSpentConfig = useMemo(() => {
    return generateTimeSpentConfig(features);
  }, [features]);

  // Bugs chart data
  const bugsData = useMemo(() => {
    if (!features || features.length === 0) {
      return [
        {
          name: bugConfig.development.key,
          value: 0,
          fill: bugConfig.development.color,
        },
        { name: bugConfig.ncr.key, value: 0, fill: bugConfig.ncr.color },
      ];
    }

    // Calculate total development bugs (urgent + high + normal)
    const totalDevelopmentBugs = features.reduce((sum, feature) => {
      return sum + feature.urgentBugs + feature.highBugs + feature.normalBugs;
    }, 0);

    // Calculate total NCR bugs
    const totalNcrBugs = features.reduce((sum, feature) => {
      return sum + feature.ncrBugs;
    }, 0);

    return [
      {
        name: bugConfig.development.key,
        value: totalDevelopmentBugs,
        fill: bugConfig.development.color,
      },
      {
        name: bugConfig.ncr.key,
        value: totalNcrBugs,
        fill: bugConfig.ncr.color,
      },
    ];
  }, [features]);

  return (
    <div className="grid flex-1 scroll-mt-20 items-stretch gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
      <Card className="flex flex-col shadow-none">
        <CardHeader className="items-center pb-0">
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={progressConfig}
            className="mx-auto max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie data={progressData} dataKey="value" />
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col shadow-none">
        <CardHeader className="items-center pb-0">
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={dueStatusConfig}
            className="mx-auto max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie data={dueStatusData} dataKey="value" />
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col shadow-none">
        <CardHeader className="items-center pb-0">
          <CardTitle>Time spent</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={dynamicTimeSpentConfig}
            className="mx-auto max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie data={timeSpentData} dataKey="value" />
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col shadow-none">
        <CardHeader className="items-center pb-0">
          <CardTitle>Bugs</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer config={bugConfig} className="mx-auto max-h-[250px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie data={bugsData} dataKey="value" />
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
