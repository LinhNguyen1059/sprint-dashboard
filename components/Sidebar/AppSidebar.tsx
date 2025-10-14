"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboardIcon } from "lucide-react";

import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { cn, isRouteActive } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { NavProjects } from "./NavProjects";
import { SiteHeader } from "./SiteHeader";
import { NavSolutions } from "./NavSolutions";

function Sidebar({ ...props }: React.ComponentProps<typeof SidebarUI>) {
  const path = usePathname();

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
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {routes.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(
                      isRouteActive(item.url, path)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                        : ""
                    )}
                    asChild
                  >
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavProjects />
        <NavSolutions />
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
