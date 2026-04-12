import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function ReviewSection({ listing, currentUserId, isCreator }: { listing: any; currentUserId: string; isCreator: boolean }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reviewableUsers = isCreator
    ? (listing.participants || []).map((p: any) => ({ id: p.userId, name: `${p.user?.firstName || ""} ${p.user?.lastName || ""}`.trim() || p.userId }))
    : [{ id: listing.creatorId, name: `${listing.creator?.firstName || ""} ${listing.creator?.lastName || ""}`.trim() || "Host" }];

  const [selectedUserId, setSelectedUserId] = useState(reviewableUsers[0]?.id || "");

  const submitReview = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/reviews", {
        reviewedUserId: selectedUserId,
        listingId: listing.id,
        rating,
        comment: comment || undefined,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit review");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listing.id] });
      toast({ title: t("listing.reviewSubmitted"), description: t("listing.reviewSubmittedDesc") });
      setRating(0);
      setComment("");
    },
    onError: (err: Error) => {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="bg-card rounded-3xl shadow-sm border border-border/50 p-6">
      <h3 className="font-bold font-display text-lg mb-4 flex items-center">
        <Star className="w-5 h-5 mr-2" />
        {t("listing.leaveReview")}
      </h3>

      {reviewableUsers.length > 1 && (
        <div className="mb-3">
          <label className="text-sm font-medium mb-1 block">{t("listing.reviewFor")}</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full p-2 rounded-lg border bg-background text-sm"
            data-testid="select-review-user"
          >
            {reviewableUsers.map((u: any) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-1 mb-3" data-testid="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            data-testid={`button-star-${star}`}
          >
            <Star
              className={cn(
                "w-7 h-7 transition-colors cursor-pointer",
                star <= (hoverRating || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              )}
            />
          </button>
        ))}
        {rating > 0 && <span className="text-sm text-muted-foreground ml-2">{rating}/5</span>}
      </div>

      <Textarea
        placeholder={t("listing.reviewComment")}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mb-3 min-h-[60px]"
        data-testid="input-review-comment"
      />

      <Button
        onClick={() => submitReview.mutate()}
        disabled={rating === 0 || submitReview.isPending}
        size="sm"
        data-testid="button-submit-review"
      >
        {submitReview.isPending ? t("listing.submitting") : t("listing.submitReview")}
      </Button>
    </div>
  );
}
