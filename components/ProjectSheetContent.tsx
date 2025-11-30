import { useCallback, useState } from "react";
import { CalendarClock, File } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDashboard } from "./DashboardLayout";
import { cn } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useDocs } from "@/hooks/use-docs";

export function ProjectSheetContent({ loading }: { loading: boolean }) {
  const { docs } = useDashboard();
  const { downloading, downloadDocs } = useDocs();

  const [selected, setSelected] = useState<string[]>([]);

  const onSelect = useCallback(
    (id: string) => {
      setSelected((prev) => {
        if (prev.includes(id)) {
          return prev.filter((docId) => docId !== id);
        } else {
          return [...prev, id];
        }
      });
    },
    [selected]
  );

  const onSelectAll = useCallback(() => {
    if (selected.length === docs.length) {
      setSelected([]);
    } else {
      setSelected(docs.map((doc) => doc.id));
    }
  }, [selected, docs, setSelected]);

  const onAdd = () => {
    downloadDocs(docs.filter((doc) => selected.includes(doc.id)));
  };

  const renderHeader = useCallback(() => {
    if (loading || docs.length === 0) {
      return null;
    }
    return (
      <div className="flex items-center gap-3 px-4">
        <Checkbox
          id="checkbox"
          checked={selected.length === docs.length}
          onCheckedChange={onSelectAll}
        />
        <Label htmlFor="checkbox">All projects</Label>
      </div>
    );
  }, [loading, docs, onSelectAll, selected]);

  const renderContent = useCallback(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 gap-4 px-4">
          <>
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <div
                  className="animate-pulse border border-gray-200 rounded-lg transition-all duration-200 overflow-hidden"
                  key={index}
                >
                  <div className="w-full aspect-video flex items-center justify-center bg-gray-200"></div>
                  <div className="py-2 px-1 border-t border-gray-200">
                    <div className="h-2 rounded bg-gray-200"></div>
                  </div>
                </div>
              ))}
          </>
        </div>
      );
    }

    if (docs.length > 0) {
      return (
        <div className="grid grid-cols-2 gap-4 px-4">
          <>
            {docs.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  "border border-gray-200 rounded-lg transition-all duration-200 hover:border-primary cursor-pointer overflow-hidden group",
                  selected.includes(doc.id) && "border-primary"
                )}
                onClick={() => onSelect(doc.id)}
              >
                <div
                  className={cn(
                    "w-full aspect-video flex items-center justify-center bg-gray-100 group-hover:bg-gray-200 transition-colors duration-200 rounded-t-lg",
                    selected.includes(doc.id) && "bg-gray-200"
                  )}
                >
                  <File size={50} />
                </div>
                <div className="py-2 px-1 border-t border-gray-200">
                  <p className="text-sm font-medium leading-none whitespace-nowrap text-ellipsis w-full overflow-hidden">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <CalendarClock size={14} />{" "}
                    {new Date(doc.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center w-full h-full">
        No files uploaded
      </div>
    );
  }, [loading, docs, selected, onSelect]);

  return (
    <>
      <SheetHeader>
        <SheetTitle>Project files</SheetTitle>
      </SheetHeader>
      {renderHeader()}
      <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
        {renderContent()}
      </div>
      <SheetFooter>
        {selected.length > 0 && (
          <Button type="submit" disabled={downloading} onClick={onAdd}>
            {downloading ? "Adding..." : "Add"}
          </Button>
        )}
      </SheetFooter>
    </>
  );
}
