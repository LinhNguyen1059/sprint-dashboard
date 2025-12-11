import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProjectSheetContent } from "./ProjectSheetContent";
import { useDocs } from "@/hooks/use-docs";
import { useDashboard } from "./DashboardLayout";

export function ProjectSheet() {
  const { getDocs } = useDocs();
  const { openSheet, setOpenSheet } = useDashboard();

  useEffect(() => {
    getDocs();
  }, []);

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetTrigger asChild>
        <Button>Choose projects</Button>
      </SheetTrigger>
      <SheetContent
        aria-describedby={undefined}
        className="gap-0 w-1/2 !max-w-full"
      >
        <ProjectSheetContent />
      </SheetContent>
    </Sheet>
  );
}
