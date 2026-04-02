"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";

import { handleUnauthorized } from "@/lib/api-client";

export function SiteHeader() {
  const router = useRouter();

  const handleLogout = () => {
    handleUnauthorized();
    router.push("/");
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 z-20 bg-background">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 justify-between">
        <SidebarTrigger className="-ml-1" />

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="size-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Log out</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
