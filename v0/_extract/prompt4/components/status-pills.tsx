"use client";

import { cn } from "@/lib/utils";
import { GroupStatus } from "./group-card";

interface StatusPillsProps {
  value: "all" | GroupStatus;
  onChange: (value: "all" | GroupStatus) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
    expired: number;
  };
}

const statuses: Array<{ value: "all" | GroupStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "expired", label: "Expired" },
];

export function StatusPills({ value, onChange, counts }: StatusPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => {
        const isActive = value === status.value;
        const count = counts[status.value];
        
        return (
          <button
            key={status.value}
            onClick={() => onChange(status.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
            )}
          >
            {status.label}
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full px-1.5 text-xs min-w-[1.25rem]",
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
