"use client";

import React from "react";
import { Target } from "lucide-react";

import CSVUpload from "@/components/CSVUpload";
import { ProjectSheet } from "@/components/ProjectSheet";

export default function Home() {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to OKR Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            Upload/Choose your CSVs file to start analyzing your progress
          </p>

          <ProjectSheet />

          <div
            data-slot="field-separator"
            data-content="true"
            className="relative my-6 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2"
          >
            <div
              data-orientation="horizontal"
              role="none"
              data-slot="separator"
              className="bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px absolute inset-0 top-1/2"
            ></div>
            <span
              className="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
              data-slot="field-separator-content"
            >
              Or continue with
            </span>
          </div>

          <CSVUpload />
        </div>
      </div>
    </div>
  );
}
