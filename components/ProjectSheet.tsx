import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProjectSheetContent } from "./ProjectSheetContent";

export function ProjectSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Choose projects</Button>
      </SheetTrigger>
      <SheetContent>
        <ProjectSheetContent />
      </SheetContent>
    </Sheet>
  );
}
