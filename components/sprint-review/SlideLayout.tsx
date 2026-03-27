"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SlideLayoutProps {
  children: React.ReactNode;
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  /** Name shown in the bottom progress dots tooltip */
  title?: string;
}

export function SlideLayout({
  children,
  current,
  total,
  onPrev,
  onNext,
  title,
}: SlideLayoutProps) {
  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") onNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onPrev]);

  return (
    <div className="relative flex flex-col min-h-[calc(100vh-var(--header-height))]">
      {/* Slide content */}
      <div className="flex-1 flex flex-col overflow-auto px-6 py-8 md:px-12 md:py-10">
        {children}
      </div>

      {/* Bottom navigation bar */}
      <div className="sticky bottom-0 z-10 flex items-center justify-between border-t bg-background px-6 py-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={current === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5" aria-label="Slide progress">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "block h-2 rounded-full transition-all",
                i === current ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {title && <span className="mr-2 font-medium">{title}</span>}
            {current + 1} / {total}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={current === total - 1}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Reusable section heading inside a slide */
export function SlideHeading({
  children,
  subtitle,
}: {
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 space-y-1">
      <h2 className="text-2xl font-bold tracking-tight">{children}</h2>
      {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
    </div>
  );
}

/** Stat card used across multiple slides */
export function StatCard({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 shadow-none flex flex-col gap-1",
        className,
      )}
    >
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-3xl font-bold">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}
