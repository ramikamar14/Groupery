'use client'

import { cn } from '@/lib/utils'

type Rank = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'

const rankConfig: Record<Rank, { color: string; bg: string; border: string }> = {
  Bronze:   { color: 'text-amber-700',  bg: 'bg-amber-100 dark:bg-amber-900/30',   border: 'border-amber-300 dark:border-amber-700' },
  Silver:   { color: 'text-slate-600',  bg: 'bg-slate-100 dark:bg-slate-800/50',   border: 'border-slate-300 dark:border-slate-600' },
  Gold:     { color: 'text-yellow-700', bg: 'bg-yellow-50 dark:bg-yellow-900/30',  border: 'border-yellow-300 dark:border-yellow-700' },
  Platinum: { color: 'text-cyan-700',   bg: 'bg-cyan-50 dark:bg-cyan-900/30',      border: 'border-cyan-300 dark:border-cyan-700' },
  Diamond:  { color: 'text-violet-700', bg: 'bg-violet-50 dark:bg-violet-900/30',  border: 'border-violet-300 dark:border-violet-700' },
}

export function RankBadge({ rank }: { rank: Rank }) {
  const cfg = rankConfig[rank]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        cfg.bg, cfg.color, cfg.border
      )}
    >
      <span className="text-[10px]">★</span>
      {rank}
    </span>
  )
}
