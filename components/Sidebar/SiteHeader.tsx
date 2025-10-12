import { useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useDashboard } from "../DashboardLayout";
import Link from "next/link";

export function SiteHeader() {
  const path = usePathname();
  const params = useParams();
  const { slug, feature } = params;

  const { projects } = useDashboard();

  const route = useMemo(() => {
    return routes.find((route) => {
      if (route.url === path) return true;

      if (path.startsWith(route.url)) {
        const nextChar = path[route.url.length];
        return nextChar === "/" || nextChar === undefined;
      }

      return false;
    });
  }, [path]);

  const slugName = useMemo(() => {
    if (projects.length === 0 || !slug) {
      return null;
    }

    return projects.find((p) => p.projectSlug === slug)?.projectName;
  }, [projects, slug]);

  const featureName = useMemo(() => {
    if (projects.length === 0 || !feature || !slug) {
      return null;
    }

    const project = projects.find((p) => p.projectSlug === slug);

    return (
      project?.features.find((f) => f.slug === feature)?.subject || feature
    );
  }, [projects, feature, slug]);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 z-20 bg-background">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Link href={route?.url || "/"}>
          <h1
            className={cn(
              "text-base font-medium",
              slugName && "text-muted-foreground"
            )}
          >
            {route?.title || "Dashboard"}
          </h1>
        </Link>
        {slugName && (
          <>
            <ChevronRight size={14} />
            <Link href={`/projects/${slug}`}>
              <h1
                className={cn(
                  "text-base font-medium",
                  featureName && "text-muted-foreground"
                )}
              >
                {slugName}
              </h1>
            </Link>
          </>
        )}
        {featureName && (
          <>
            <ChevronRight size={14} />
            <h1 className="text-base font-medium">{featureName}</h1>
          </>
        )}
      </div>
    </header>
  );
}
