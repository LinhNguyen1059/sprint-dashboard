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
import { useDashboard } from "../DashboardLayout";
import { isRouteActive } from "@/lib/utils";

export function NavSolutions() {
  const path = usePathname();
  const { solutions } = useDashboard();
  const params = useParams();
  const { slug } = params;

  const isSolutionRoute = isRouteActive("/solutions", path);

  if (!solutions.length) return null;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Solutions</SidebarGroupLabel>
      <SidebarMenu>
        {solutions.map((item) => {
          const isActive = slug === item.slug && isSolutionRoute;

          return (
            <SidebarMenuItem key={item.slug}>
              <SidebarMenuButton asChild>
                <Link href={`/solutions/${item.slug}`}>
                  {isActive && <ChevronRight />}
                  <span className={isActive ? "font-medium" : ""}>
                    {item.name}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
