import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TooltipItem,
} from "chart.js";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import { getChartColors } from "@/lib/dataProcessing";
import {
  ChartContainerProps,
  StatusChartProps,
  PriorityChartProps,
  TrackerChartProps,
  ModuleProgressChartProps,
  ChartsProps,
  ColorMapping,
} from "@/lib/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  children,
  className = "lg:col-span-6",
}) => (
  <div
    className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
  >
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

const StatusChart: React.FC<StatusChartProps> = ({ data }) => {
  const statusEntries = Object.entries(data);
  const colors = getChartColors(statusEntries.length);

  const chartData = {
    labels: statusEntries.map(([status]) => status),
    datasets: [
      {
        data: statusEntries.map(([, count]) => count),
        backgroundColor: colors,
        borderColor: colors.map((color) => color),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"doughnut">) {
            const total = (context.dataset.data as number[]).reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

const PriorityChart: React.FC<PriorityChartProps> = ({ data }) => {
  const priorityEntries = Object.entries(data);
  const colors: ColorMapping = {
    Immediate: "#fed8e0",
    Urgent: "#ffe8cf",
    High: "#fff4cd",
    Normal: "#d6ffb8",
  };

  const chartData = {
    labels: priorityEntries.map(([priority]) => priority),
    datasets: [
      {
        label: "Issue Count",
        data: priorityEntries.map(([, count]) => count),
        backgroundColor: priorityEntries.map(
          ([priority]) => colors[priority] || "#e5e7eb"
        ),
        borderColor: priorityEntries.map(
          ([priority]) => colors[priority] || "#e5e7eb"
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"bar">) {
            return `${context.label}: ${context.parsed.y} issues`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
};

const TrackerChart: React.FC<TrackerChartProps> = ({ data }) => {
  const trackerEntries = Object.entries(data);
  const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"];

  const chartData = {
    labels: trackerEntries.map(([tracker]) =>
      tracker === "Task_Scr" ? "Tasks" : tracker
    ),
    datasets: [
      {
        data: trackerEntries.map(([, count]) => count),
        backgroundColor: colors.slice(0, trackerEntries.length),
        borderColor: colors.slice(0, trackerEntries.length),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"pie">) {
            const total = (context.dataset.data as number[]).reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Pie data={chartData} options={options} />
    </div>
  );
};

const ModuleProgressChart: React.FC<ModuleProgressChartProps> = ({ data }) => {
  const moduleEntries = Object.entries(data).filter(
    ([, count]) => (count as number) > 0
  );
  const colors = getChartColors(moduleEntries.length);

  const chartData = {
    labels: moduleEntries.map(([module]) => module),
    datasets: [
      {
        label: "Issues",
        data: moduleEntries.map(([, count]) => count as number),
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"bar">) {
            return `${context.label}: ${context.parsed.x} issues`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="h-80">
      <Bar data={chartData} options={options} />
    </div>
  );
};

const Charts: React.FC<ChartsProps> = ({ sprintData }) => {
  if (!sprintData) return null;

  const { charts } = sprintData;

  return (
    <>
      <ChartContainer
        title="Issue Status Distribution"
        className="lg:col-span-6"
      >
        <StatusChart data={charts.status} />
      </ChartContainer>

      <ChartContainer title="Priority Breakdown" className="lg:col-span-6">
        <PriorityChart data={charts.priority} />
      </ChartContainer>

      <ChartContainer title="Issue Types" className="lg:col-span-6">
        <TrackerChart data={charts.tracker} />
      </ChartContainer>

      <ChartContainer title="Module Progress" className="lg:col-span-6">
        <ModuleProgressChart data={charts.modules} />
      </ChartContainer>
    </>
  );
};

export default Charts;
