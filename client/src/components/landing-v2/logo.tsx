import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} data-testid="text-brand">
      <div className="relative size-10">
        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="absolute inset-0">
          <div className="absolute bottom-0 left-0 size-6 rounded-full bg-primary/80" />
          <div className="absolute bottom-1 left-2 size-6 rounded-full bg-accent/90" />
          <div className="absolute top-0 right-0 size-6 rounded-full bg-primary shadow-md" />
        </motion.div>
      </div>
      <span className="text-2xl font-bold font-display text-foreground tracking-tight">
        group<span className="text-primary">erry</span>
      </span>
    </div>
  );
}
