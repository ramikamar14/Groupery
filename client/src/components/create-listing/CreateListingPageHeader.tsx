import { CheckCircle2 } from "lucide-react";

export function CreateListingPageHeader({
  brandLabel,
  title,
  subtitle,
  draftSaved,
  draftLabel,
}: {
  brandLabel: string;
  title: string;
  subtitle: string;
  draftSaved: boolean;
  draftLabel: string;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-accent" aria-hidden />
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">{brandLabel}</span>
        </div>
        <h1 className="text-3xl font-bold font-display text-foreground text-balance">{title}</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>
      {draftSaved && (
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 shrink-0 animate-in fade-in duration-300"
          data-testid="text-draft-saved"
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          {draftLabel}
        </span>
      )}
    </div>
  );
}
