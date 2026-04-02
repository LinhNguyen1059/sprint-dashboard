"use client";

import { Fragment } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

import { useDashboardStore } from "@/stores/dashboardStore";
import { ApiProjectResponse } from "@/lib/types";

function LoadingSkeleton() {
  const { projects, isProjectLoading } = useDashboardStore();

  if (!isProjectLoading && projects.length === 0) {
    return (
      <SidebarMenuItem className="p-2 text-center text-sm text-sidebar-foreground">
        No projects found
      </SidebarMenuItem>
    );
  }

  if (!isProjectLoading || projects.length > 0) return null;

  return Array.from({ length: 5 }).map((_, index) => (
    <SidebarMenuItem key={index} className="p-2 flex gap-3">
      <Skeleton
        className="rounded-sm bg-gray-300 w-4 h-4"
        data-sidebar="project-skeleton"
      />
      <Skeleton
        className="size-4 rounded-md flex-1 bg-gray-300"
        data-sidebar="project-skeleton"
      />
    </SidebarMenuItem>
  ));
}

export function SidebarProject() {
  const {
    projects,
    filter: { projectIds },
    setFilterStates,
  } = useDashboardStore();

  const anchor = useComboboxAnchor();

  const selectedProjects = projects.filter((p) => projectIds.includes(p.id));

  const onValueChange = (values: ApiProjectResponse[]) => {
    const newProjectIds = values.map((v) => v.id);
    setFilterStates("projectIds", newProjectIds);
  };

  return (
    <Fragment>
      <SidebarGroup>
        <SidebarGroupLabel className="w-full text-sm text-sidebar-foreground h-7 mb-2 gap-3">
          Projects {projectIds.length > 0 ? `(${projectIds.length})` : ""}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <Combobox
              multiple
              autoHighlight
              items={projects}
              onValueChange={onValueChange}
              virtualized
              value={selectedProjects}
            >
              <ComboboxChips ref={anchor} className="gap-1 bg-background">
                <ComboboxValue>
                  {(values) => (
                    <Fragment>
                      {values.map((value: ApiProjectResponse) => (
                        <ComboboxChip
                          key={value.id}
                          className="h-auto whitespace-pre-wrap p-1 bg-primary/10 data-[state=on]:bg-primary/20 text-primary text-xs"
                          removeClassName="w-6 h-6"
                        >
                          {value.name}
                        </ComboboxChip>
                      ))}
                      <ComboboxChipsInput placeholder="Pick projects" />
                    </Fragment>
                  )}
                </ComboboxValue>
              </ComboboxChips>
              <ComboboxContent anchor={anchor}>
                <ComboboxEmpty render={<LoadingSkeleton />} />
                <ComboboxList>
                  {(item: ApiProjectResponse) => (
                    <ComboboxItem key={item.id} value={item}>
                      {item.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarSeparator className="mx-0" />
    </Fragment>
  );
}
