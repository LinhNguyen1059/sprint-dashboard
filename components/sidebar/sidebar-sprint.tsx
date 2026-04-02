"use client";

import { Fragment, useEffect } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
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
import { Skeleton } from "@/components/ui/skeleton";

import { useDashboardStore } from "@/stores/dashboardStore";
import { apiFetch } from "@/lib/api-client";
import { Sprint } from "@/lib/types";

function LoadingSkeleton() {
  const { isSprintLoading, sprints } = useDashboardStore();

  if (!isSprintLoading && sprints.length === 0) {
    return (
      <SidebarMenuItem className="p-2 text-center text-sm text-sidebar-foreground">
        No sprints found
      </SidebarMenuItem>
    );
  }

  if (!isSprintLoading) return null;

  return Array.from({ length: 5 }).map((_, index) => (
    <SidebarMenuItem key={index} className="p-2 flex gap-3">
      <Skeleton
        className="rounded-sm bg-gray-300 w-4 h-4"
        data-sidebar="sprint-skeleton"
      />
      <Skeleton
        className="size-4 rounded-md flex-1 bg-gray-300"
        data-sidebar="sprint-skeleton"
      />
    </SidebarMenuItem>
  ));
}

export function SidebarSprint() {
  const {
    sprints,
    filter: { projectIds, sprintIds },
    setStates,
    setFilterStates,
  } = useDashboardStore();

  const singleProjectId = projectIds.length === 1 ? projectIds[0] : null;
  const selectedSprints = sprints.filter(
    (s) => sprintIds && sprintIds.includes(s.id),
  );

  const anchor = useComboboxAnchor();

  const onValueChange = (values: Sprint[]) => {
    const newSprintIds = values.map((v) => v.id);
    setFilterStates("sprintIds", newSprintIds);
  };

  useEffect(() => {
    if (!singleProjectId) {
      setStates({ sprints: [] });
      return;
    }

    const controller = new AbortController();

    const fetchSprints = async () => {
      setStates({ isSprintLoading: true });
      try {
        const { data } = await apiFetch<{ sprints: Sprint[] }>(
          `/api/v1/sprints?project_id=${singleProjectId}`,
          { signal: controller.signal },
        );
        if (data) {
          setStates({ sprints: data.sprints });
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        console.error("Error fetching sprints:", error);
      } finally {
        setStates({ isSprintLoading: false });
      }
    };

    fetchSprints();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleProjectId]);

  if (!singleProjectId) return null;

  return (
    <Fragment>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="w-full text-sm text-sidebar-foreground h-7 mb-2 gap-3">
          Sprints{" "}
          {sprintIds && sprintIds.length > 0 ? `(${sprintIds.length})` : ""}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <Combobox
              multiple
              autoHighlight
              items={sprints}
              onValueChange={onValueChange}
              virtualized
              value={selectedSprints}
            >
              <ComboboxChips ref={anchor} className="gap-1 bg-background">
                <ComboboxValue>
                  {(values) => (
                    <Fragment>
                      {values.map((value: Sprint) => (
                        <ComboboxChip
                          key={value.id}
                          className="h-auto whitespace-pre-wrap p-1 bg-primary/10 data-[state=on]:bg-primary/20 text-primary text-xs"
                          removeClassName="w-6 h-6"
                        >
                          {value.name}
                        </ComboboxChip>
                      ))}
                      <ComboboxChipsInput placeholder="Pick sprints" />
                    </Fragment>
                  )}
                </ComboboxValue>
              </ComboboxChips>
              <ComboboxContent anchor={anchor}>
                <ComboboxEmpty render={<LoadingSkeleton />} />
                <ComboboxList>
                  {(item: Sprint) => (
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
