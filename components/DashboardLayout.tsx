import React from "react";
import { Users, Target, Clock } from "lucide-react";
import { DashboardLayoutProps } from "@/lib/types";

// Keep the legacy interface for backward compatibility
export interface SprintData {
  team: string[];
  metrics: {
    totalSpentTime: number;
    completionRate: number;
    highPriorityCount: number;
    urgentPriorityCount: number;
  };
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sprintData,
  projectName,
}) => {
  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <main className="mx-auto sm:px-6 lg:px-8 py-8 container px-4">
        {!sprintData ? (
          // Upload State
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="">
                <Target className="mx-auto h-12 w-12 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to Sprint Dashboard
                </h2>
                <p className="text-gray-600 mb-6">
                  Upload your CSV file to start analyzing your team&apos;s
                  sprint progress
                </p>
                {children}
              </div>
            </div>
          </div>
        ) : (
          // Dashboard Content
          <div className="space-y-8">
            {projectName ? (
              <div className="text-2xl font-bold">{projectName}</div>
            ) : null}
            {/* Quick Stats Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Completion Rate
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {sprintData.metrics.completionRate}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Team Members
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {sprintData.team.length}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      Time Spent
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {sprintData.metrics.totalSpentTime}h
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold text-sm">!</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      High Priority
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {sprintData.metrics.highPriorityCount +
                        sprintData.metrics.urgentPriorityCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {children}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardLayout;
