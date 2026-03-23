import { Fragment } from "react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/stores/appStore";
import { ApiProjectResponse } from "@/lib/types";

export function SelectProject() {
  const anchor = useComboboxAnchor();
  const { projects } = useAppStore();

  const handleComboboxChange = (values: ApiProjectResponse[]) => {
    console.log("Selected values:", values);
  };

  return (
    <div className="gap-2 flex flex-col">
      <Label>Select Project</Label>
      <Combobox
        multiple
        autoHighlight
        items={projects}
        onValueChange={handleComboboxChange}
        virtualized
      >
        <ComboboxChips ref={anchor} className="w-full">
          <ComboboxValue>
            {(values) => (
              <Fragment>
                {values.map((value: ApiProjectResponse) => (
                  <ComboboxChip key={value.id}>{value.name}</ComboboxChip>
                ))}
                <ComboboxChipsInput placeholder="Please select at least a project" />
              </Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item: ApiProjectResponse) => (
              <ComboboxItem key={item.id} value={item}>
                {item.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
