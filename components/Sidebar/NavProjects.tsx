"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { isRouteActive } from "@/lib/utils";
import { useDashboard } from "../DashboardLayout";

export function NavProjects() {
  const path = usePathname();
  const { projects } = useDashboard();
  const params = useParams();
  const { slug } = params;

  const isRouteProject = isRouteActive("/projects", path);

  if (!projects.length || !isRouteProject) return null;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.projectSlug}>
            <SidebarMenuButton asChild>
              <Link href={`/projects/${item.projectSlug}`}>
                {slug === item.projectSlug && <ChevronRight />}
                <span
                  className={slug === item.projectSlug ? "font-medium" : ""}
                >
                  {item.projectName}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
