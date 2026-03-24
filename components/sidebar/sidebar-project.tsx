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

const ITEM_HEIGHT = 32;
const MAX_LIST_HEIGHT = 240;

function LoadingSkeleton() {
  const { projects, isProjectLoading } = useDashboardStore();

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

function ProjectList({ searchText }: { searchText: string }) {
  const hydrated = useStoreHydrated();
  const { projects, filter, toggleProjectInFilter } = useDashboardStore();

  const filtered = searchText
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(searchText.toLowerCase()),
      )
    : projects;

  if (!filtered.length || !hydrated) return null;

  const listHeight = Math.min(filtered.length * ITEM_HEIGHT, MAX_LIST_HEIGHT);

  return (
    <VirtualizedScrollArea
      items={filtered}
      listHeight={listHeight}
      estimateSize={() => ITEM_HEIGHT}
      getItemKey={(index) => filtered[index].id}
      renderItem={(project, index) => (
        <SidebarMenuItem>
          <FieldLabel className="p-2 !border-0 !rounded-none">
            <Field orientation="horizontal" className="!p-0 overflow-hidden">
              <Checkbox
                id={`project-checkbox-${project.id}`}
                name={`project-checkbox-${project.id}`}
                checked={filter.projectIds.includes(project.id)}
                onCheckedChange={(value: boolean) => {
                  toggleProjectInFilter(project.id, value);
                }}
              />
              <Label
                htmlFor={`project-checkbox-${project.id}`}
                className="flex-1 truncate block"
              >
                {project.name}
              </Label>
            </Field>
          </FieldLabel>
        </SidebarMenuItem>
      )}
    />
  );
}

export function SidebarProject() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    } else {
      setSearchText("");
    }
  }, [searchOpen]);

  return (
    <Fragment>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        {searchOpen ? (
          <div className="flex items-center gap-1 px-2 h-7 mb-2">
            <InputGroup className="h-7">
              <InputGroupInput
                placeholder="Search projects..."
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
            Projects
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
            <ProjectList searchText={searchText} />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarSeparator className="mx-0" />
    </Fragment>
  );
}
