"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutDashboardIcon } from "lucide-react";

import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { SiteHeader } from "./SiteHeader";
import { SidebarProjects } from "./SidebarProjects";
import { SidebarDateRange } from "./SidebarDateRange";

function Sidebar({ ...props }: React.ComponentProps<typeof SidebarUI>) {
  return (
    <SidebarUI collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" className="flex items-center gap-2">
              <LayoutDashboardIcon className="!size-5" />
              <span className="text-base font-semibold">Dashboard</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="custom-scrollbar">
        <SidebarProjects />
        <SidebarDateRange />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </SidebarUI>
  );
}

export function AppSidebar({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <Sidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="@container/main flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
