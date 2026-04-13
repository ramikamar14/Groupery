import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-violet-400/45 to-purple-500/35 dark:from-violet-500/30 dark:to-purple-600/25",
  "from-sky-400/45 to-cyan-500/35 dark:from-sky-500/30 dark:to-cyan-600/25",
  "from-emerald-400/45 to-teal-500/35 dark:from-emerald-500/30 dark:to-teal-600/25",
  "from-amber-400/45 to-orange-500/35 dark:from-amber-500/30 dark:to-orange-600/25",
  "from-rose-400/45 to-pink-500/35 dark:from-rose-500/30 dark:to-pink-600/25",
  "from-blue-400/45 to-indigo-500/35 dark:from-blue-500/30 dark:to-indigo-600/25",
  "from-fuchsia-400/45 to-violet-500/35 dark:from-fuchsia-500/30 dark:to-violet-600/25",
  "from-lime-400/45 to-emerald-500/35 dark:from-lime-500/30 dark:to-emerald-600/25",
];

export function DecorativeAvatar({ seed, className }: { seed: number; className?: string }) {
  const i = Math.abs(seed) % GRADIENTS.length;
  return (
    <div
      className={cn("size-full rounded-full bg-gradient-to-br border border-border/50", GRADIENTS[i], className)}
      aria-hidden
    />
  );
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
