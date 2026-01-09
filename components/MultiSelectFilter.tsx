"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface MultiSelectFilterProps {
  options: string[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  popoverWidth?: string;
}

export function MultiSelectFilter({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options",
  popoverWidth,
}: MultiSelectFilterProps) {
  const [open, setOpen] = React.useState(false);

  const toggleSelection = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter((v) => v !== value));
    } else {
      onSelectionChange([...selectedValues, value]);
    }
  };

  const clearSelections = () => {
    onSelectionChange([]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <span className="truncate">
            {selectedValues.length > 0
              ? `${selectedValues.length} ${
                  selectedValues.length === 1 ? "item" : "items"
                } selected`
              : placeholder}
          </span>
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`p-0 ${popoverWidth ? popoverWidth : "w-48"}`}
        align="start"
      >
        <div className="max-h-60 overflow-auto">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option);
            return (
              <div
                key={option}
                className="flex items-center gap-2 p-2 hover:bg-accent"
              >
                <Checkbox
                  id={`multi-select-${option}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleSelection(option)}
                />
                <label
                  htmlFor={`multi-select-${option}`}
                  className="flex-1 cursor-pointer text-sm"
                >
                  {option}
                </label>
              </div>
            );
          })}
        </div>
        {selectedValues.length > 0 && (
          <div className="border-t p-2 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full"
              onClick={clearSelections}
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
