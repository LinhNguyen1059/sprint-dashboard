"use client";

import React from "react";
import { Target } from "lucide-react";

import CSVUpload from "@/components/CSVUpload";

export default function Home() {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to Sprint Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            Upload your CSVs file to start analyzing your team&apos;s sprint
            progress
          </p>

          <CSVUpload />
        </div>
      </div>
    </div>
  );
}
