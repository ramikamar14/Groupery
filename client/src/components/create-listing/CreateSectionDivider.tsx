import type { LucideIcon } from "lucide-react";

export function CreateSectionDivider({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: number;
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6 mt-8 first:mt-0">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0 mt-0.5">
        {step}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-accent shrink-0" />
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="hidden sm:block flex-1 h-px bg-border self-center ml-2 min-w-[2rem]" />
    </div>
  );
}
