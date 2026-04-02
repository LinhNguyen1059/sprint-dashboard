"use client";

import { useMemo } from "react";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";

import { useDashboardStore, useStoreHydrated } from "@/stores/dashboardStore";

export function SidebarDateRange() {
  const hydrated = useStoreHydrated();
  const {
    projects,
    filter: { startDate, endDate },
    setFilterStates,
  } = useDashboardStore();

  const date = useMemo(() => {
    if (startDate && endDate) {
      return { from: new Date(startDate), to: new Date(endDate) };
    }
    return undefined;
  }, [startDate, endDate]);

  const setDate = (date: DateRange | undefined) => {
    if (date?.from) {
      setFilterStates("startDate", date.from.toISOString());
    } else {
      setFilterStates("startDate", undefined);
    }

    if (date?.to) {
      setFilterStates("endDate", date.to.toISOString());
    } else {
      setFilterStates("endDate", undefined);
    }
  };

  if (!projects.length || !hydrated) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="w-full text-sm text-sidebar-foreground h-7 mb-0 gap-3 p-0">
        Date Range
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker-range"
                className="justify-start px-2.5 font-normal"
              >
                <CalendarIcon />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                className="w-full"
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                disabled={{ after: new Date() }}
                endMonth={new Date()}
              />
              {date?.from || date?.to ? (
                <div className="w-full p-2 text-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDate(undefined)}
                  >
                    <X className="size-4" />
                    Clear
                  </Button>
                </div>
              ) : null}
            </PopoverContent>
          </Popover>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
