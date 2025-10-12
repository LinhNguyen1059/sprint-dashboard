"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { CombinedIssue, DashboardLayoutProps, Project } from "@/lib/types";
import { AppSidebar } from "./Sidebar/AppSidebar";

interface DashboardContextType {
  data: CombinedIssue[];
  setData: React.Dispatch<React.SetStateAction<CombinedIssue[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  solutions: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setSolutions: React.Dispatch<React.SetStateAction<any[]>>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error(
      "DashboardLayout components must be used within a DashboardLayout"
    );
  }
  return context;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [data, setData] = React.useState<CombinedIssue[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [solutions, setSolutions] = React.useState<any[]>([]);

  const path = usePathname();
  const router = useRouter();

  const useSidebar = useMemo(() => {
    return path !== "/" && data.length > 0;
  }, [path, data.length]);

  useEffect(() => {
    if (data.length === 0) {
      router.replace("/");
    }
  }, [data]);

  return (
    <DashboardContext.Provider
      value={{ data, setData, projects, setProjects, solutions, setSolutions }}
    >
      <main className="mx-auto">
        {useSidebar ? <AppSidebar>{children}</AppSidebar> : children}
      </main>
    </DashboardContext.Provider>
  );
};

export default DashboardLayout;
export { useDashboard };
