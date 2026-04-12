"use client"

import { Cpu, ShoppingBasket, Dumbbell, Code2, BookOpen } from "lucide-react"

export interface DealTemplate {
  id: string
  label: string
  icon: React.ElementType
  color: string
  bg: string
  title: string
  description: string
  category: "Physical" | "Digital" | "Offer"
  slots: number
  tags: string[]
}

export const DEAL_TEMPLATES: DealTemplate[] = [
  {
    id: "electronics",
    label: "Electronics",
    icon: Cpu,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:border-blue-800 dark:hover:bg-blue-900/50",
    title: "Group Electronics Purchase",
    description:
      "Join our group buy to get the latest electronics at wholesale prices. We pool together to unlock bulk discounts directly from suppliers.",
    category: "Physical",
    slots: 20,
    tags: ["electronics", "tech", "gadgets", "bulk-buy"],
  },
  {
    id: "groceries",
    label: "Groceries",
    icon: ShoppingBasket,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950/40 dark:border-green-800 dark:hover:bg-green-900/50",
    title: "Community Grocery Group Buy",
    description:
      "Fresh produce and pantry essentials bought in bulk from local suppliers. Split costs and save on weekly grocery bills for your household.",
    category: "Physical",
    slots: 30,
    tags: ["groceries", "food", "fresh", "community"],
  },
  {
    id: "gym",
    label: "Gym",
    icon: Dumbbell,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200 hover:bg-orange-100 dark:bg-orange-950/40 dark:border-orange-800 dark:hover:bg-orange-900/50",
    title: "Group Gym Membership",
    description:
      "Negotiate a group rate at your local gym or fitness center. The more members, the bigger the discount on annual memberships.",
    category: "Offer",
    slots: 15,
    tags: ["gym", "fitness", "health", "membership"],
  },
  {
    id: "software",
    label: "Software",
    icon: Code2,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/40 dark:border-purple-800 dark:hover:bg-purple-900/50",
    title: "Software License Group Deal",
    description:
      "Share the cost of premium software subscriptions or one-time licenses. Split seats on team plans to access professional-grade tools.",
    category: "Digital",
    slots: 10,
    tags: ["software", "saas", "license", "digital"],
  },
  {
    id: "book-club",
    label: "Book Club",
    icon: BookOpen,
    color: "text-teal-600",
    bg: "bg-teal-50 border-teal-200 hover:bg-teal-100 dark:bg-teal-950/40 dark:border-teal-800 dark:hover:bg-teal-900/50",
    title: "Book Club Bulk Order",
    description:
      "Order books in bulk for your book club at a heavily discounted rate. Perfect for organizing reading groups and saving on literature.",
    category: "Physical",
    slots: 12,
    tags: ["books", "reading", "book-club", "education"],
  },
]

interface DealTemplatesProps {
  onSelect: (template: DealTemplate) => void
  selectedId: string | null
}

export function DealTemplates({ onSelect, selectedId }: DealTemplatesProps) {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        Quick-start with a template
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {DEAL_TEMPLATES.map((tpl) => {
          const Icon = tpl.icon
          const isSelected = selectedId === tpl.id
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelect(tpl)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium shrink-0 transition-all duration-150 ${tpl.bg} ${
                isSelected ? "ring-2 ring-accent ring-offset-1" : ""
              }`}
            >
              <Icon className={`w-4 h-4 ${tpl.color}`} />
              <span className="text-foreground">{tpl.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
