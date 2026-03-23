"use client";

import { Fragment } from "react";
import { Check, ChevronRight } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAppStore } from "@/stores/appStore";

export function SidebarProjects() {
  const { projects } = useAppStore();

  if (!projects.length) return null;

  return (
    <Fragment>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroupLabel
            asChild
            className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <CollapsibleTrigger>
              Projects
              <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu className="no-scrollbar max-h-[30vh] overflow-y-auto">
                {projects.map((project, index) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton>
                      <div
                        data-active={index < 2}
                        className="group/calendar-item flex aspect-square size-4 shrink-0 items-center justify-center rounded-xs border border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary"
                      >
                        <Check className="hidden size-3 group-data-[active=true]/calendar-item:block" />
                      </div>
                      <div className="flex-1 truncate">{project.name}</div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>
      <SidebarSeparator className="mx-0" />
    </Fragment>
  );
}
