import { Star, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

export function ProfileReviewsSection({
  reviews,
  loading,
  avgRating,
}: {
  reviews: any[];
  loading: boolean;
  avgRating: number;
}) {
  const { t } = useTranslation();

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-accent" />
          {t("profile.reviewsReceived")}
          <Badge variant="secondary" className="text-xs font-medium">
            {reviews.length}
          </Badge>
        </CardTitle>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-foreground">{avgRating.toFixed(1)}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t("profile.noReviews")}</p>
          </div>
        ) : (
          reviews.map((review: any) => (
            <div
              key={review.id}
              className="p-4 rounded-xl border border-border bg-card hover:border-accent/30 transition-colors"
              data-testid={`review-item-${review.id}`}
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarImage src={review.reviewer?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {review.reviewer?.firstName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm text-foreground">
                      {review.reviewer?.firstName} {review.reviewer?.lastName}
                    </span>
                    {review.createdAt && (
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(review.createdAt), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3 h-3",
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                    {review.listing?.title && (
                      <span className="text-[10px] text-muted-foreground truncate">
                        {t("profile.reviewViaListing", { title: review.listing.title })}
                      </span>
                    )}
                  </div>
                  {review.comment && <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>}
                  {review.listing?.id && (
                    <Link href={`/listings/${review.listing.id}`} className="text-xs text-accent font-medium hover:underline mt-2 inline-block">
                      {t("notifications.viewListing")} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
