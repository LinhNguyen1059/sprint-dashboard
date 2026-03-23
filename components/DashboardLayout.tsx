"use client";

import React from "react";

import { DashboardLayoutProps } from "@/lib/types";
import { AppSidebar } from "./Sidebar/AppSidebar";
import { useMounted } from "@/hooks/use-mount";
import { useAppStore } from "@/stores/appStore";

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { authenticated } = useAppStore();

  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <main className="mx-auto">
      {authenticated ? <AppSidebar>{children}</AppSidebar> : children}
    </main>
  );
};

export default DashboardLayout;
