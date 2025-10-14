"use client";

import { useMemo } from "react";
import { LabelList, Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { Feature, FeatureStatus } from "@/lib/types";

const bugConfig = {
  development: {
    key: "development",
    label: "Development",
    color: "var(--chart-1)"
  },
  ncr: {
    key: "ncr",
    label: "Post-Release",
    color: "var(--chart-5)"
  }
};

// Status chart configuration
const dueStatusConfig = {
  inprogress: {
    key: "inprogress",
    label: "In Progress",
    color: "var(--chart-9)"
  },
  ontime: {
    key: "ontime",
    label: "On Time",
    color: "var(--chart-7)"
  },
  late: {
    key: "late",
    label: "Late",
    color: "var(--chart-11)"
  }
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
    "var(--chart-30)"
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
      color: generateFeatureColor(index)
    };
  });

  return config;
};

// Legend item component for popover
const LegendItem = ({ label, color }: { label: string; color: string }) => (
  <div className="flex items-center gap-2">
    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-sm">{label}</span>
  </div>
);

export function FeatureChart({ data: features }: { data: Feature[] }) {
  // Status chart data
  const dueStatusData = useMemo(() => {
    if (!features || features.length === 0) {
      return [
        {
          name: dueStatusConfig.inprogress.key,
          value: 0,
          percent: 0,
          fill: dueStatusConfig.inprogress.color
        },
        {
          name: dueStatusConfig.ontime.key,
          value: 0,
          percent: 0,
          fill: dueStatusConfig.ontime.color
        },
        {
          name: dueStatusConfig.late.key,
          value: 0,
          percent: 0,
          fill: dueStatusConfig.late.color
        }
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
        percent: (inProgressCount / features.length) * 100,
        fill: dueStatusConfig.inprogress.color
      },
      {
        name: dueStatusConfig.ontime.key,
        value: onTimeCount,
        percent: (onTimeCount / features.length) * 100,
        fill: dueStatusConfig.ontime.color
      },
      {
        name: dueStatusConfig.late.key,
        value: lateCount,
        percent: (lateCount / features.length) * 100,
        fill: dueStatusConfig.late.color
      }
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

    const totalSpentTime = featuresWithTime.reduce(
      (acc, feature) => acc + feature.totalSpentTime,
      0
    );

    return featuresWithTime.map((feature, index) => ({
      name: feature.subject,
      value: feature.totalSpentTime,
      percent: (feature.totalSpentTime / totalSpentTime) * 100,
      fill: generateFeatureColor(index)
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
          percent: 0,
          fill: bugConfig.development.color
        },
        {
          name: bugConfig.ncr.key,
          value: 0,
          percent: 0,
          fill: bugConfig.ncr.color
        }
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

    const total = totalDevelopmentBugs + totalNcrBugs;

    return [
      {
        name: bugConfig.development.key,
        value: totalDevelopmentBugs,
        percent: (totalDevelopmentBugs / total) * 100,
        fill: bugConfig.development.color
      },
      {
        name: bugConfig.ncr.key,
        value: totalNcrBugs,
        percent: (totalNcrBugs / total) * 100,
        fill: bugConfig.ncr.color
      }
    ];
  }, [features]);

  return (
    <div className="grid flex-1 scroll-mt-20 items-stretch gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      <Card className="flex flex-col shadow-none py-4">
        <CardHeader className="items-center pb-0 px-4">
          <CardTitle>Project Status</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0 px-4">
          <ChartContainer
            config={dueStatusConfig}
            className="mx-auto max-h-[250px] w-full"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={dueStatusData}
                label={({ name }: { name: keyof typeof dueStatusConfig }) =>
                  dueStatusConfig[name].label
                }
                dataKey="value"
              >
                <LabelList
                  dataKey="percent"
                  className="fill-background"
                  stroke="none"
                  fontSize={12}
                  formatter={(percent: number) =>
                    percent > 0 ? `${percent.toFixed(2)}%` : ""
                  }
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col shadow-none py-4">
        <CardHeader className="items-center pb-0 px-4">
          <CardTitle>Time spent</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0 px-4">
          <ChartContainer
            config={dynamicTimeSpentConfig}
            className="mx-auto max-h-[250px] w-full"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={timeSpentData}
                label={({
                  name
                }: {
                  name: keyof typeof dynamicTimeSpentConfig;
                }) => dynamicTimeSpentConfig[name].label}
                dataKey="value"
              >
                <LabelList
                  dataKey="percent"
                  className="fill-background"
                  stroke="none"
                  fontSize={12}
                  formatter={(percent: number) =>
                    percent > 0 ? `${percent.toFixed(2)}%` : ""
                  }
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col shadow-none py-4">
        <CardHeader className="items-center pb-0 px-4">
          <CardTitle>Bugs</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0 px-4">
          <ChartContainer
            config={bugConfig}
            className="mx-auto max-h-[250px] w-full"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={bugsData}
                label={({ name }: { name: keyof typeof bugConfig }) =>
                  bugConfig[name].label
                }
                dataKey="value"
              >
                <LabelList
                  dataKey="percent"
                  className="fill-background"
                  stroke="none"
                  fontSize={12}
                  formatter={(percent: number) =>
                    percent > 0 ? `${percent.toFixed(2)}%` : ""
                  }
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
