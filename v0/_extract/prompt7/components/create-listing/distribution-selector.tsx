"use client"

import { MapPin, Truck, Wifi } from "lucide-react"

export type DistributionType = "Pickup" | "Delivery" | "Digital"

const OPTIONS: { value: DistributionType; label: string; icon: React.ElementType; description: string }[] = [
  { value: "Pickup", label: "Pickup", icon: MapPin, description: "Members collect in person" },
  { value: "Delivery", label: "Delivery", icon: Truck, description: "Ship to each member" },
  { value: "Digital", label: "Digital", icon: Wifi, description: "Download or access code" },
]

interface DistributionSelectorProps {
  value: DistributionType
  onChange: (value: DistributionType) => void
}

export function DistributionSelector({ value, onChange }: DistributionSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon
        const isSelected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 text-center ${
              isSelected
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-card hover:border-accent/50 hover:bg-accent/5 text-muted-foreground"
            }`}
          >
            <Icon className={`w-5 h-5 ${isSelected ? "text-accent" : "text-muted-foreground"}`} />
            <span className={`text-sm font-semibold ${isSelected ? "text-accent" : "text-foreground"}`}>
              {opt.label}
            </span>
            <span className={`text-xs leading-snug ${isSelected ? "text-accent/80" : "text-muted-foreground"}`}>
              {opt.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}
