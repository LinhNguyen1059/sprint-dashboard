"use client";

import Charts from "@/components/Charts";
import CSVUpload from "@/components/CSVUpload";
import DashboardLayout from "@/components/DashboardLayout";
import MetricsCards from "@/components/MetricsCards";
import StoryTable from "@/components/StoryTable";
import TeamPerformance from "@/components/TeamPerformance";
import { parseCSV, processSprintData } from "@/lib/dataProcessing";
import { SprintData } from "@/lib/types";
import { useState } from "react";

export default function Home() {
  const [sprintData, setSprintData] = useState<SprintData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("");

  const handleFileUpload = async (file: File | null): Promise<void> => {
    if (!file) {
      setSprintData(null);
      setError(null);
      return;
    }

    const proName = file.name.slice(0, -4);

    setLoading(true);
    setError(null);
    setProjectName(proName);

    document.title = `${proName} | Sprint Dashboard`;

    try {
      const csvData = await parseCSV(file);
      const processedData = processSprintData(csvData);
      setSprintData(processedData);
    } catch (err) {
      console.error("Error processing CSV:", err);
      setError(
        "Error processing CSV file. Please check the file format and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sprintData={sprintData} projectName={projectName}>
      {!sprintData ? (
        <div className="space-y-4">
          <CSVUpload onFileUpload={handleFileUpload} />
          {loading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent mr-2"></div>
                Processing CSV file...
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}
        </div>
      ) : (
        <>
          <MetricsCards sprintData={sprintData} />
          <Charts sprintData={sprintData} />
          <TeamPerformance sprintData={sprintData} />
          <StoryTable sprintData={sprintData} />
        </>
      )}
    </DashboardLayout>
  );
}
