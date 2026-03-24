"use client";

import { Fragment, useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { VirtualizedScrollArea } from "@/components/ui/virtualized-scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

import { useDashboardStore, useStoreHydrated } from "@/stores/dashboardStore";
import { apiFetch } from "@/lib/api-client";
import { Sprint } from "@/lib/types";

const ITEM_HEIGHT = 32;
const MAX_LIST_HEIGHT = 240;

function LoadingSkeleton() {
  const { isSprintLoading } = useDashboardStore();

  if (!isSprintLoading) return null;

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

function SprintList({ searchText }: { searchText: string }) {
  const hydrated = useStoreHydrated();
  const { sprints, filter, isSprintLoading, toggleSprintInFilter } =
    useDashboardStore();

  const filtered = searchText
    ? sprints.filter((p) =>
        p.name.toLowerCase().includes(searchText.toLowerCase()),
      )
    : sprints;

  if (!filtered.length || isSprintLoading || !hydrated) return null;

  const listHeight = Math.min(filtered.length * ITEM_HEIGHT, MAX_LIST_HEIGHT);

  return (
    <VirtualizedScrollArea
      items={filtered}
      listHeight={listHeight}
      estimateSize={() => ITEM_HEIGHT}
      getItemKey={(index) => filtered[index].id}
      renderItem={(sprint, index) => (
        <SidebarMenuItem>
          <FieldLabel className="p-2 !border-0 !rounded-none">
            <Field orientation="horizontal" className="!p-0 overflow-hidden">
              <Checkbox
                id={`sprint-checkbox-${sprint.id}`}
                name={`sprint-checkbox-${sprint.id}`}
                checked={filter.sprintIds?.includes(sprint.id) || false}
                onCheckedChange={(value: boolean) => {
                  toggleSprintInFilter(sprint.id, value);
                }}
              />
              <Label
                htmlFor={`sprint-checkbox-${sprint.id}`}
                className="flex-1 truncate block"
              >
                {sprint.name}
              </Label>
            </Field>
          </FieldLabel>
        </SidebarMenuItem>
      )}
    />
  );
}

export function SidebarSprint() {
  const {
    filter: { projectIds },
    setStates,
  } = useDashboardStore();

  const singleProjectId = projectIds.length === 1 ? projectIds[0] : null;

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
  }, [singleProjectId]);

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    } else {
      setSearchText("");
    }
  }, [searchOpen]);

  if (!singleProjectId) return null;

  return (
    <Fragment>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        {searchOpen ? (
          <div className="flex items-center gap-1 px-2 h-7 mb-2">
            <InputGroup className="h-7">
              <InputGroupInput
                placeholder="Search sprints..."
                ref={inputRef}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="py-0 h-7"
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
            </InputGroup>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0"
              onClick={() => setSearchOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <SidebarGroupLabel className="w-full text-sm text-sidebar-foreground h-7 mb-2 gap-3">
            Sprints
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto size-6 shrink-0"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-4" />
            </Button>
          </SidebarGroupLabel>
        )}
        <SidebarGroupContent>
          <SidebarMenu>
            <LoadingSkeleton />
            <SprintList searchText={searchText} />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarSeparator className="mx-0" />
    </Fragment>
  );
}
