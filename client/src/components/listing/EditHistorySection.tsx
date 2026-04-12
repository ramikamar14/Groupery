import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, History, ChevronDown } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function EditHistorySection({ listingId }: { listingId: number }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["/api/listings", listingId, "history"],
    queryFn: () => fetch(`/api/listings/${listingId}/history`, { credentials: "include" }).then(r => r.json()),
    enabled: expanded,
  });

  const formatFieldName = (field: string) => {
    const names: Record<string, string> = {
      title: t("listing.titleField"),
      description: t("listing.descriptionField"),
      expiresAt: t("listing.expiryDate"),
      status: t("listing.statusField"),
      totalSlots: t("listing.totalSlotsField"),
      location: t("listing.locationField"),
      imageUrl: t("listing.imageField"),
    };
    return names[field] || field;
  };

  const formatValue = (field: string, value: any) => {
    if (value === null || value === undefined) return "—";
    if (field === "expiresAt" && value) {
      try {
        return format(new Date(value), "MMM d, yyyy HH:mm");
      } catch {
        return String(value);
      }
    }
    if (field === "description" && typeof value === "string" && value.length > 80) {
      return value.substring(0, 80) + "...";
    }
    return String(value);
  };

  return (
    <div className="bg-card rounded-3xl shadow-sm border border-border/50">
      <button
        type="button"
        className="w-full p-6 flex items-center justify-between text-left hover-elevate rounded-3xl"
        onClick={() => setExpanded(!expanded)}
        data-testid="button-toggle-edit-history"
      >
        <h3 className="font-bold font-display text-lg flex items-center">
          <History className="w-5 h-5 mr-2" />
          {t("listing.editHistory")}
        </h3>
        <ChevronDown className={cn("w-5 h-5 transition-transform text-muted-foreground", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground" data-testid="text-no-edit-history">{t("listing.noEdits")}</p>
          ) : (
            <div className="space-y-4" data-testid="edit-history-list">
              {history.map((entry: any) => (
                <div key={entry.id} className="p-4 bg-muted/30 rounded-xl border border-border/30" data-testid={`edit-history-entry-${entry.id}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={entry.editor?.profileImageUrl} />
                      <AvatarFallback className="text-xs">{entry.editor?.firstName?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {entry.editor?.firstName} {entry.editor?.lastName || ""}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(entry.changes as Record<string, { old: any; new: any }>).map(([field, change]) => (
                      <div key={field} className="text-sm">
                        <span className="font-medium text-muted-foreground">{formatFieldName(field)}:</span>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 ml-4">
                          <span className="line-through text-muted-foreground/70">{formatValue(field, change.old)}</span>
                          <span className="text-muted-foreground">&rarr;</span>
                          <span>{formatValue(field, change.new)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
