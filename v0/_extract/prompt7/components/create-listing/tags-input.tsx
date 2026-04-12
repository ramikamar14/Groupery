"use client"

import { useState, KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"

const POPULAR_TAGS = [
  "bulk-buy", "savings", "community", "local", "organic",
  "tech", "fitness", "education", "family", "weekend-deal",
]

interface TagsInputProps {
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (tag: string) => void
  maxTags?: number
}

export function TagsInput({ tags, onAdd, onRemove, maxTags = 10 }: TagsInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault()
      const tag = inputValue.trim().toLowerCase().replace(/\s+/g, "-")
      if (tag && !tags.includes(tag) && tags.length < maxTags) {
        onAdd(tag)
        setInputValue("")
      }
    }
    if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onRemove(tags[tags.length - 1])
    }
  }

  const availablePopular = POPULAR_TAGS.filter((t) => !tags.includes(t))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 p-3 border border-input rounded-xl bg-background min-h-[48px] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0 transition-shadow">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent/15 text-accent text-sm font-medium border border-accent/25"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="hover:text-accent/70 transition-colors"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {tags.length < maxTags && (
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? "Type a tag and press Enter…" : "Add another…"}
            className="border-0 p-0 h-auto shadow-none focus-visible:ring-0 text-sm flex-1 min-w-[120px] bg-transparent"
          />
        )}
      </div>
      <p className="text-xs text-muted-foreground">{tags.length}/{maxTags} tags · Press Enter or comma to add</p>

      {availablePopular.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Popular tags</p>
          <div className="flex flex-wrap gap-2">
            {availablePopular.slice(0, 8).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => tags.length < maxTags && onAdd(tag)}
                disabled={tags.length >= maxTags}
                className="px-2.5 py-1 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:border-accent hover:text-accent hover:bg-accent/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
