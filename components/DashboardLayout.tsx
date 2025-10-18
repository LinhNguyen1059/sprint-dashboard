"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  CombinedIssue,
  DashboardLayoutProps,
  Project,
  Solution,
  Member,
} from "@/lib/types";
import { AppSidebar } from "./Sidebar/AppSidebar";
import { useMounted } from "@/hooks/use-mount";

interface DashboardContextType {
  data: CombinedIssue[];
  setData: React.Dispatch<React.SetStateAction<CombinedIssue[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  solutions: Solution[];
  setSolutions: React.Dispatch<React.SetStateAction<Solution[]>>;
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
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
  const [solutions, setSolutions] = React.useState<Solution[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);

  const mounted = useMounted();

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

  if (!mounted) {
    return null;
  }

  return (
    <DashboardContext.Provider
      value={{
        data,
        setData,
        projects,
        setProjects,
        solutions,
        setSolutions,
        members,
        setMembers,
      }}
    >
      <main className="mx-auto">
        {useSidebar ? <AppSidebar>{children}</AppSidebar> : children}
      </main>
    </DashboardContext.Provider>
  );
};

export default DashboardLayout;
export { useDashboard };
