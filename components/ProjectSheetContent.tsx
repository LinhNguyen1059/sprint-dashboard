import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDashboard } from "./DashboardLayout";
import { useDocs } from "@/hooks/use-docs";
import { DocsTable } from "./DocsTable";
import { ArrowRight, Search, Trash2, X } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

export function ProjectSheetContent() {
  const { docs, isAuthenticated } = useDashboard();
  const { downloading, deleting, downloadDocs, deleteDocs } = useDocs();

  const [search, setSearch] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const onAdd = () => {
    downloadDocs(docs.filter((doc) => selectedIds.includes(doc.id)));
  };

  const onDelete = async () => {
    await deleteDocs(docs.filter((doc) => selectedIds.includes(doc.id)));
    setSelectedIds([]);
  };

  const onRowSelectionChange = (rowSelection: { [key: string]: boolean }) => {
    const selected = Object.keys(rowSelection).filter((id) => rowSelection[id]);
    setSelectedIds(selected);
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>Project files</SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto flex flex-col custom-scrollbar">
        <div className="px-4">
          <div className="flex items-center gap-2 justify-between w-full pt-1 mb-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
              {search.length > 0 && (
                <div
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1.5 cursor-pointer p-1 rounded-sm transition-colors duration-75 hover:bg-gray-100"
                >
                  <X size={16} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {selectedIds.length > 0 && (
                <>
                  <div className="text-sm">
                    {selectedIds.length} items selected
                  </div>
                  <Separator orientation="vertical" className="!h-4" />
                  {isAuthenticated && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={onDelete}
                      disabled={downloading || deleting}
                    >
                      {deleting ? "Deleting..." : "Delete"} <Trash2 />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={onAdd}
                    disabled={downloading || downloading}
                  >
                    {downloading ? "Downloading..." : "Continue"} <ArrowRight />
                  </Button>
                </>
              )}
            </div>
          </div>
          <DocsTable
            data={docs}
            onRowSelectionChange={onRowSelectionChange}
            search={search}
          />
        </div>
      </div>
    </>
  );
}
