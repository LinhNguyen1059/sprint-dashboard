"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";

import { handleUnauthorized } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const isMemberPage = pathname.startsWith("/member");

  const handleLogout = () => {
    handleUnauthorized();
    router.push("/");
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 z-20 bg-background">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 justify-between">
        <SidebarTrigger className="-ml-1" />

        <div className="flex items-center gap-4 flex-1 justify-center">
          <Link href="/">
            <h1
              className={cn(
                "text-base font-medium",
                isMemberPage && "text-muted-foreground",
              )}
            >
              Projects
            </h1>
          </Link>
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <Link href="/member">
            <h1
              className={cn(
                "text-base font-medium",
                !isMemberPage && "text-muted-foreground",
              )}
            >
              Members
            </h1>
          </Link>
        </div>

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
