"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";
import { FolderKanban, User } from "lucide-react";

const routes = [
  {
    title: "Projects",
    url: "/",
    subRoutes: ["/project"],
    icon: FolderKanban,
  },
  {
    title: "Members",
    url: "/member",
    subRoutes: ["/member"],
    icon: User,
  },
];

function isRouteActive({
  route,
  subRoutes,
  pathname,
}: {
  route: string;
  subRoutes: string[];
  pathname: string;
}) {
  if (route === pathname) return true;

  if (subRoutes) {
    return subRoutes.some((subRoute) => {
      if (subRoute === pathname) return true;

      if (pathname.startsWith(subRoute)) {
        const nextChar = pathname[subRoute.length];
        return nextChar === "/" || nextChar === undefined;
      }

      return false;
    });
  }

  if (pathname.startsWith(route)) {
    const nextChar = pathname[route.length];
    return nextChar === "/" || nextChar === undefined;
  }

  return false;
}

export function SidebarLink() {
  const pathname = usePathname();

  return (
    <SidebarGroup className="sticky top-0 z-10 bg-sidebar">
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {routes.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                className={cn(
                  isRouteActive({
                    route: item.url,
                    subRoutes: item.subRoutes,
                    pathname,
                  })
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                    : "",
                )}
                asChild
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
