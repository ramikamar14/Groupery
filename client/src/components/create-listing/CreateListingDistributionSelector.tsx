import { MapPin, Truck, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export type CreateDistributionValue = "pickup" | "delivery" | "digital";

const OPTIONS: {
  value: CreateDistributionValue;
  label: string;
  icon: typeof MapPin;
  description: string;
}[] = [
  { value: "pickup", label: "Pickup", icon: MapPin, description: "Members collect in person" },
  { value: "delivery", label: "Delivery", icon: Truck, description: "Ship to each member" },
  { value: "digital", label: "Digital", icon: Monitor, description: "Download or access code" },
];

export function CreateListingDistributionSelector({
  value,
  onChange,
  labels,
}: {
  value: CreateDistributionValue;
  onChange: (v: CreateDistributionValue) => void;
  labels?: Partial<Record<CreateDistributionValue, { label: string; description: string }>>;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isSelected = value === opt.value;
        const L = labels?.[opt.value];
        const label = L?.label ?? opt.label;
        const desc = L?.description ?? opt.description;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 text-center",
              isSelected
                ? "border-accent bg-accent/10 text-accent shadow-sm"
                : "border-border bg-card hover:border-accent/40 hover:bg-accent/5 text-muted-foreground"
            )}
            data-testid={`button-distribution-${opt.value}`}
          >
            <Icon className={cn("w-5 h-5", isSelected ? "text-accent" : "text-muted-foreground")} />
            <span className={cn("text-sm font-semibold", isSelected ? "text-accent" : "text-foreground")}>{label}</span>
            <span className={cn("text-xs leading-snug", isSelected ? "text-accent/85" : "text-muted-foreground")}>
              {desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}
