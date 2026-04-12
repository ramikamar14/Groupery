import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { StatusFilter } from "./group-utils";

const ORDER: StatusFilter[] = ["all", "active", "completed", "expired"];

export function StatusPills({
  value,
  onChange,
  counts,
}: {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
  counts?: Partial<Record<StatusFilter, number>>;
}) {
  const { t } = useTranslation();
  const statusLabels: Record<StatusFilter, string> = {
    all: t("myGroups.all"),
    active: t("myGroups.active"),
    completed: t("myGroups.completed"),
    expired: t("myGroups.expired"),
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {ORDER.map((s) => {
        const c = counts?.[s];
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium border transition-all inline-flex items-center gap-1.5",
              value === s
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            )}
          >
            {statusLabels[s]}
            {c !== undefined && (
              <span
                className={cn(
                  "text-[11px] tabular-nums rounded-full px-1.5 py-0 min-w-[1.25rem] text-center",
                  value === s ? "bg-primary-foreground/20" : "bg-muted"
                )}
              >
                {c}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
