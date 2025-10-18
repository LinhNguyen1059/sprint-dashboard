import React, { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { useDashboard } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  parseMultipleCSVFileObjects,
  calculateProjects,
  calculateSolutions,
  calculateMembers,
} from "@/lib/csvParser";
import { TEAMS } from "@/lib/teams";

const CSVUpload: React.FC = () => {
  const router = useRouter();
  const { setData, setProjects, setSolutions, setMembers } = useDashboard();

  const [loading, setLoading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const csvFiles = Array.from(files).filter(
        (file) => file.type === "text/csv" || file.name.endsWith(".csv")
      );

      if (csvFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...csvFiles]);
      }

      const nonCsvFiles = Array.from(files).filter(
        (file) => !(file.type === "text/csv" || file.name.endsWith(".csv"))
      );

      if (nonCsvFiles.length > 0) {
        alert("Some files were not CSV files and were ignored.");
      }
    }
  }, []);

  const handleSelectFile = (): void => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.multiple = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input.onchange = handleFileInput as any;
    input.click();
  };

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const fileArray = Array.from(files);
        setUploadedFiles((prev) => [...prev, ...fileArray]);
      }
    },
    []
  );

  const removeFile = (index: number): void => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const removeAllFiles = (): void => {
    setUploadedFiles([]);
  };

  const handleUpload = async () => {
    setLoading(true);
    try {
      // Parse all uploaded files into a single combined array
      const combinedIssues = await parseMultipleCSVFileObjects(uploadedFiles);
      setData(combinedIssues);

      // Calculate projects from the combined data
      const projects = calculateProjects(combinedIssues);
      setProjects(projects);

      // Calculate solutions from the combined data
      const solutions = calculateSolutions(combinedIssues);
      setSolutions(solutions);

      // Calculate members from the combined data and teams
      const members = calculateMembers(combinedIssues, TEAMS);
      setMembers(members);

      router.push("/projects");
    } catch (error) {
      console.error("Error parsing CSV files:", error);
      alert("Error parsing CSV files. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="w-full max-w-2xl mx-auto">
        {uploadedFiles.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-primary-500 bg-primary-50"
                : "border-gray-300 hover:border-primary-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleSelectFile}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Sprint Data CSV
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your CSV files here, or click to select
            </p>
            <label className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
                multiple
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">CSV files only</p>
          </div>
        ) : (
          <div className="border rounded-lg p-6 bg-green-50 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-green-900">
                Uploaded Files ({uploadedFiles.length})
              </h3>
              <button
                onClick={removeAllFiles}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200"
                >
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <h4 className="text-md font-medium text-green-900">
                        {file.name}
                      </h4>
                      <p className="text-sm text-green-700">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {uploadedFiles.length > 0 && (
        <div className="flex justify-end mt-4">
          <Button onClick={handleUpload} disabled={loading}>
            {loading ? "Processing..." : "Upload and Process"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CSVUpload;
