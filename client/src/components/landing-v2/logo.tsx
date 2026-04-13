import { cn } from "@/lib/utils";
import { LogoIcon } from "@/components/Logo";

interface LogoProps {
  className?: string;
  /** Default 40px matches the former landing mark footprint (size-10). */
  iconSize?: number;
}

export function Logo({ className, iconSize = 40 }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)} data-testid="text-brand">
      <LogoIcon size={iconSize} />
      <span className="text-2xl font-bold font-display tracking-tight text-foreground">Grouperry</span>
    </div>
  );
}
