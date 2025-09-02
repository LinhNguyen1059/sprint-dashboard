import React from "react";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Bug,
  FileText,
  GitBranch,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import Link from "next/link";
import { StatusBadge } from "./StoryTable";
import {
  MetricCardProps,
  MetricsCardsProps,
  ProcessedCSVRow,
  MetricCardColor,
} from "@/lib/types";

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  trendValue,
  dataTable,
}) => {
  const [open, setOpen] = React.useState<boolean>(false);

  const colorClasses: Record<MetricCardColor, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    red: "bg-red-50 text-red-600 border-red-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow py-0">
        <CardContent className="p-4">
          <div className="">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`flex-shrink-0 p-3 rounded-lg ${colorClasses[color]}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {title}
                </p>
              </div>
              {trend && (
                <Badge
                  variant={trend === "up" ? "default" : "destructive"}
                  className="text-xs"
                >
                  {trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {trendValue}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex-1">
                <p className="text-2xl font-semibold text-foreground">
                  {value}
                </p>
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
              {dataTable && (
                <ArrowUpRight
                  onClick={() => setOpen(true)}
                  className="cursor-pointer"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {dataTable && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-5xl">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <Table rootClassName="max-h-[500px] overflow-auto">
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataTable.map((item: ProcessedCSVRow) => (
                  <TableRow
                    className="hover:bg-muted/50 cursor-pointer"
                    key={item["#"]}
                  >
                    <TableCell className="w-12">
                      <Link
                        href={`https://bugtracker.i3international.com/issues/${item["#"]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium"
                      >
                        #{item["#"]}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div
                        className="text-sm text-muted-foreground truncate max-w-[200px]"
                        title={item.Subject}
                      >
                        {item.Subject}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.Status} />
                    </TableCell>
                    <TableCell>{item.Author}</TableCell>
                    <TableCell>{item.Assignee}</TableCell>
                    <TableCell>{item.Priority}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

const MetricsCards: React.FC<MetricsCardsProps> = ({ sprintData }) => {
  if (!sprintData) return null;

  const { metrics } = sprintData;

  return (
    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Completion Metrics */}
      <MetricCard
        title="Issues Completed"
        value={metrics.closed}
        subtitle={`${metrics.completionRate}% completion rate`}
        icon={CheckCircle}
        color="green"
        trend="up"
        trendValue={`${metrics.closed}/${metrics.total}`}
      />

      <MetricCard
        title="In Progress"
        value={metrics.inProgressCount}
        subtitle={`${((metrics.inProgressCount / metrics.total) * 100).toFixed(
          1
        )}% of total`}
        icon={Clock}
        color="orange"
        dataTable={metrics.inProgress}
      />

      <MetricCard
        title="Time Efficiency"
        value={`${metrics.timeEfficiency}%`}
        subtitle={`${metrics.totalSpentTime}h of ${metrics.totalEstimatedTime}h`}
        icon={TrendingUp}
        color={parseFloat(metrics.timeEfficiency) > 100 ? "red" : "blue"}
        trend={parseFloat(metrics.timeEfficiency) > 100 ? "down" : "up"}
        trendValue={
          parseFloat(metrics.timeEfficiency) > 100 ? "Over budget" : "On track"
        }
      />

      <MetricCard
        title="High Priority Issues"
        value={metrics.highPriorityCount + metrics.urgentPriorityCount}
        subtitle={`${metrics.urgentPriorityCount} urgent, ${metrics.highPriorityCount} high`}
        icon={AlertTriangle}
        color="red"
      />

      {/* Issue Type Breakdown */}
      <MetricCard
        title="Bugs Reported"
        value={metrics.bugCount}
        subtitle={`${((metrics.bugCount / metrics.total) * 100).toFixed(
          1
        )}% of all issues`}
        icon={Bug}
        color="red"
      />

      <MetricCard
        title="Tasks Completed"
        value={metrics.taskCount}
        subtitle={`${((metrics.taskCount / metrics.total) * 100).toFixed(
          1
        )}% of all issues`}
        icon={FileText}
        color="blue"
      />

      <MetricCard
        title="Stories Delivered"
        value={metrics.storyCount}
        subtitle={`${((metrics.storyCount / metrics.total) * 100).toFixed(
          1
        )}% of all issues`}
        icon={GitBranch}
        color="purple"
      />

      <MetricCard
        title="Pending Issues"
        value={metrics.pendingCount}
        subtitle={`${((metrics.pendingCount / metrics.total) * 100).toFixed(
          1
        )}% need attention`}
        icon={Clock}
        color="gray"
        dataTable={metrics.pending}
      />
    </div>
  );
};

export default MetricsCards;
