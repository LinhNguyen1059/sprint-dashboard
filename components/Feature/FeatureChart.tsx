"use client";

import { useMemo } from "react";
import { Pie, PieChart } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Feature, FeatureStatus } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { List } from "lucide-react";

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
    <div className="grid flex-1 scroll-mt-20 items-stretch gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      <Card className="flex flex-col shadow-none">
        <CardHeader className="items-center pb-0">
          <CardTitle>Project Status</CardTitle>
          <CardAction>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  <List className="h-4 w-4 mr-1" />
                  View legend
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="grid gap-2">
                <LegendItem
                  label={dueStatusConfig.inprogress.label}
                  color={dueStatusConfig.inprogress.color}
                />
                <LegendItem
                  label={dueStatusConfig.ontime.label}
                  color={dueStatusConfig.ontime.color}
                />
                <LegendItem
                  label={dueStatusConfig.late.label}
                  color={dueStatusConfig.late.color}
                />
              </PopoverContent>
            </Popover>
          </CardAction>
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
              <Pie data={dueStatusData} label dataKey="value" />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col shadow-none">
        <CardHeader className="items-center pb-0">
          <CardTitle>Time spent</CardTitle>
          <CardAction>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  <List className="h-4 w-4 mr-1" />
                  View legend
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="grid gap-2 max-h-60 overflow-y-auto"
              >
                {Object.entries(dynamicTimeSpentConfig).map(([key, config]) => (
                  <LegendItem
                    key={key}
                    label={config.label}
                    color={config.color}
                  />
                ))}
              </PopoverContent>
            </Popover>
          </CardAction>
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
              <Pie data={timeSpentData} label dataKey="value" />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col shadow-none">
        <CardHeader className="items-center pb-0">
          <CardTitle>Bugs</CardTitle>
          <CardAction>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  <List className="h-4 w-4 mr-1" />
                  View legend
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="grid gap-2">
                <LegendItem
                  label={bugConfig.development.label}
                  color={bugConfig.development.color}
                />
                <LegendItem
                  label={bugConfig.ncr.label}
                  color={bugConfig.ncr.color}
                />
              </PopoverContent>
            </Popover>
          </CardAction>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer config={bugConfig} className="mx-auto max-h-[250px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie data={bugsData} label dataKey="value" />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
