"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useDashboardStore } from "@/stores/dashboardStore";
import { Separator } from "@/components/ui/separator";

import { handleUnauthorized } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const router = useRouter();
  const params = useParams();
  const { slug } = params;

  const { getMemberBySlug } = useDashboardStore();

  const slugName = useMemo(() => {
    if (slug) {
      return getMemberBySlug(slug as string)?.name;
    }

    return null;
  }, [slug]);

  const handleLogout = () => {
    handleUnauthorized();
    router.push("/");
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 z-20 bg-background">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Link href="/">
          <h1
            className={cn(
              "text-base font-medium",
              slugName && "text-muted-foreground",
            )}
          >
            Dashboard
          </h1>
        </Link>
        {slugName && (
          <>
            <ChevronRight size={14} />
            <Link href={`/${slug}`}>
              <h1 className="text-base font-medium">{slugName}</h1>
            </Link>
          </>
        )}

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
