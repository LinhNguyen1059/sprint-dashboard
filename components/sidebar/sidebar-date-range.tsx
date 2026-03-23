"use client";

import { useMemo, useState } from "react";
import { type DateRange } from "react-day-picker";

import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { Calendar } from "@/components/ui/calendar";

import { useDashboardStore } from "@/stores/dashboardStore";

export function SidebarDateRange() {
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

  if (!projects.length) return null;

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <Calendar
          className="w-full"
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={1}
          disabled={{ after: new Date() }}
          endMonth={new Date()}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
