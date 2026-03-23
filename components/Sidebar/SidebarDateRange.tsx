"use client";

import { useState } from "react";
import { type DateRange } from "react-day-picker";

import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

import { Calendar } from "@/components/ui/calendar";
import { useAppStore } from "@/stores/appStore";

export function SidebarDateRange() {
  const { projects } = useAppStore();

  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

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
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
