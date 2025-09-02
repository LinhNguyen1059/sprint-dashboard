import React, { useState } from "react";
import { User, Award, Clock, Target, TrendingUp } from "lucide-react";
import { formatTime } from "@/lib/dataProcessing";
import {
  TeamMemberCardProps,
  TeamSummaryProps,
  TeamPerformanceProps,
  TeamSortOption,
} from "@/lib/types";

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, rank }) => {
  const getBadgeColor = (rank: number | null): string => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (rank === 2) return "bg-gray-100 text-gray-800 border-gray-200";
    if (rank === 3) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getCompletionColor = (rate: string): string => {
    const numRate = parseFloat(rate);
    if (numRate >= 80) return "text-green-600 bg-green-100";
    if (numRate >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="ml-3">
            <h4 className="text-lg font-semibold text-gray-900">
              {member.name === "Unassigned" ? "Unassigned Issues" : member.name}
            </h4>
            <p className="text-sm text-gray-600">
              {member.total} total issue{member.total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {rank !== null && rank <= 3 && (
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(
              rank
            )}`}
          >
            <Award className="inline h-3 w-3 mr-1" />#{rank}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Completion Rate */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Completion Rate
            </span>
            <span
              className={`text-sm font-semibold px-2 py-1 rounded ${getCompletionColor(
                member.completionRate
              )}`}
            >
              {member.completionRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                parseFloat(member.completionRate) >= 80
                  ? "bg-green-500"
                  : parseFloat(member.completionRate) >= 60
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{
                width: `${Math.min(parseFloat(member.completionRate), 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Issue Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {member.closed}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {member.inProgress}
            </div>
            <div className="text-xs text-gray-600">In Progress</div>
          </div>
        </div>

        {/* Time Tracking */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Time Spent:</span>
            <span className="font-semibold">
              {formatTime(member.totalSpentTime)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Estimated:</span>
            <span className="font-semibold">
              {formatTime(member.totalEstimatedTime)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Efficiency:</span>
            <span
              className={`font-semibold ${
                parseFloat(member.efficiency) > 100
                  ? "text-red-600"
                  : parseFloat(member.efficiency) > 80
                  ? "text-green-600"
                  : "text-yellow-600"
              }`}
            >
              {member.efficiency}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamSummary: React.FC<TeamSummaryProps> = ({ teamData }) => {
  const totalCompleted = teamData.reduce(
    (sum, member) => sum + member.closed,
    0
  );
  const totalInProgress = teamData.reduce(
    (sum, member) => sum + member.inProgress,
    0
  );
  const totalSpentTime = teamData.reduce(
    (sum, member) => sum + member.totalSpentTime,
    0
  );
  const totalEstimatedTime = teamData.reduce(
    (sum, member) => sum + member.totalEstimatedTime,
    0
  );
  const avgCompletionRate = (
    teamData.reduce(
      (sum, member) => sum + parseFloat(member.completionRate),
      0
    ) / teamData.length
  ).toFixed(1);
  const teamEfficiency =
    totalEstimatedTime > 0
      ? ((totalSpentTime / totalEstimatedTime) * 100).toFixed(1)
      : "0";

  return (
    <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
        Team Performance Summary
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {teamData.length}
          </div>
          <div className="text-sm text-gray-600">Team Members</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {totalCompleted}
          </div>
          <div className="text-sm text-gray-600">Total Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">
            {avgCompletionRate}%
          </div>
          <div className="text-sm text-gray-600">Avg Completion</div>
        </div>
        <div className="text-center">
          <div
            className={`text-2xl font-bold ${
              parseFloat(teamEfficiency) > 100
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {teamEfficiency}%
          </div>
          <div className="text-sm text-gray-600">Team Efficiency</div>
        </div>
      </div>
    </div>
  );
};

const TeamPerformance: React.FC<TeamPerformanceProps> = ({ sprintData }) => {
  const [sortBy, setSortBy] = useState<TeamSortOption>("closed"); // closed, completionRate, totalSpentTime

  if (!sprintData) return null;

  const { team } = sprintData;

  // Filter out unassigned for main team view
  const assignedTeam = team.filter((member) => member.name !== "Unassigned");
  const unassignedIssues = team.find((member) => member.name === "Unassigned");

  const sortedTeam = [...assignedTeam].sort((a, b) => {
    if (sortBy === "completionRate") {
      return parseFloat(b.completionRate) - parseFloat(a.completionRate);
    }
    if (sortBy === "totalSpentTime") {
      return b.totalSpentTime - a.totalSpentTime;
    }
    return b.closed - a.closed; // default: closed issues
  });

  return (
    <div className="lg:col-span-12 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Team Performance
          </h2>
          <select
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSortBy(e.target.value as TeamSortOption)
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="closed">Sort by Completed Issues</option>
            <option value="completionRate">Sort by Completion Rate</option>
            <option value="totalSpentTime">Sort by Time Spent</option>
          </select>
        </div>

        <TeamSummary teamData={assignedTeam} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedTeam.map((member, index) => (
          <TeamMemberCard key={member.name} member={member} rank={index + 1} />
        ))}

        {unassignedIssues && unassignedIssues.total > 0 && (
          <TeamMemberCard member={unassignedIssues} rank={null} />
        )}
      </div>
    </div>
  );
};

export default TeamPerformance;
