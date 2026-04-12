import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarPlus, Megaphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function AnnouncementsSection({ listing, isCreator, canManage }: { listing: any; isCreator: boolean; canManage: boolean }) {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: updates = [] } = useQuery({
    queryKey: ["/api/listings", listing.id, "updates"],
    queryFn: () => fetch(`/api/listings/${listing.id}/updates`).then(r => r.json()),
  });

  const postUpdate = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/listings/${listing.id}/updates`, { content });
      if (!res.ok) throw new Error("Failed to post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listing.id, "updates"] });
      setContent("");
      toast({ title: t("listing.announcementPosted") });
    },
  });

  const [showExtend, setShowExtend] = useState(false);
  const [newExpiry, setNewExpiry] = useState("");

  const extendExpiry = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/listings/${listing.id}`, { expiresAt: newExpiry });
      if (!res.ok) throw new Error("Failed to extend");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listing.id] });
      setShowExtend(false);
      toast({ title: t("listing.expiryExtended") });
    },
  });

  if (updates.length === 0 && !canManage) return null;

  return (
    <div className="bg-card rounded-3xl shadow-sm border border-border/50 p-6">
      <h3 className="font-bold font-display text-lg mb-4 flex items-center">
        <Megaphone className="w-5 h-5 mr-2" />
        {t("listing.announcements")}
      </h3>

      {canManage && (
        <div className="mb-4 space-y-3">
          <Textarea
            placeholder={t("listing.announcementPlaceholder")}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px]"
            data-testid="input-announcement"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => postUpdate.mutate()}
              disabled={!content.trim() || postUpdate.isPending}
              size="sm"
              data-testid="button-post-announcement"
            >
              {postUpdate.isPending ? t("listing.posting") : t("listing.postAnnouncement")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExtend(!showExtend)}
              data-testid="button-extend-expiry-toggle"
            >
              <CalendarPlus className="w-4 h-4 mr-1" />
              {t("listing.extendExpiry")}
            </Button>
          </div>
          {showExtend && (
            <div className="flex gap-2 items-center p-3 bg-muted/30 rounded-xl">
              <Input
                type="datetime-local"
                value={newExpiry}
                onChange={(e) => setNewExpiry(e.target.value)}
                className="flex-1"
                data-testid="input-new-expiry"
              />
              <Button
                size="sm"
                onClick={() => extendExpiry.mutate()}
                disabled={!newExpiry || extendExpiry.isPending}
                data-testid="button-confirm-extend"
              >
                {extendExpiry.isPending ? "..." : t("listing.confirmAction")}
              </Button>
            </div>
          )}
        </div>
      )}

      {updates.length > 0 ? (
        <div className="space-y-3">
          {updates.map((update: any) => (
            <div key={update.id} className="p-3 bg-primary/5 border border-primary/10 rounded-xl">
              <p className="text-sm">{update.content}</p>
              <span className="text-xs text-muted-foreground mt-1 block">
                {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("listing.noAnnouncements")}</p>
      )}
    </div>
  );
}
