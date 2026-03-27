"use client";

import React from "react";

import { DashboardLayoutProps } from "@/lib/types";
import { useMounted } from "@/hooks/use-mount";
import { useAppStore } from "@/stores/appStore";

import { Sidebar } from "./sidebar/sidebar";

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { authenticated } = useAppStore();

  const mounted = useMounted();

  if (!mounted) {
    return null;
  }

  return (
    <main className="mx-auto">
      {authenticated ? <Sidebar>{children}</Sidebar> : children}
    </main>
  );
};

export default DashboardLayout;
