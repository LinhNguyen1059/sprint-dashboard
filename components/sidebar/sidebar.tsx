"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";

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

import { SiteHeader } from "./sidebar-header";
import { SidebarProject } from "./sidebar-project";
import { SidebarDateRange } from "./sidebar-date-range";
import { SidebarSprint } from "./sidebar-sprint";
import { SidebarLogic } from "./sidebar.logic";
import { SidebarApply } from "./sidebar-apply";
import { SidebarLink } from "./sidebar-link";

function AppSidebar({ ...props }: React.ComponentProps<typeof SidebarUI>) {
  return (
    <SidebarUI collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={20} height={20} />
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="custom-scrollbar">
        <SidebarLink />
        <SidebarProject />
        <SidebarSprint />
        <SidebarDateRange />
      </SidebarContent>
      <SidebarFooter>
        <SidebarApply />
      </SidebarFooter>
    </SidebarUI>
  );
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <SidebarLogic />
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="@container/main flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
