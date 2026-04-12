'use client'

import { Star, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface Review {
  id: string
  author: string
  authorAvatar: string
  rating: number
  date: string
  text: string
  dealTitle: string
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card hover:border-accent/30 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar className="w-9 h-9 shrink-0">
          <AvatarImage src={review.authorAvatar} alt={review.author} />
          <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
            {review.author.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm text-foreground">{review.author}</span>
            <span className="text-[10px] text-muted-foreground">{review.date}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-3 h-3',
                    i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted-foreground/30'
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground truncate">via &ldquo;{review.dealTitle}&rdquo;</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{review.text}</p>
        </div>
      </div>
    </div>
  )
}

interface ReviewsSectionProps {
  reviews: Review[]
  avgRating: number
}

export function ReviewsSection({ reviews, avgRating }: ReviewsSectionProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-accent" />
          Reviews
          <Badge variant="secondary" className="text-xs font-medium">{reviews.length}</Badge>
        </CardTitle>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold text-foreground">{avgRating.toFixed(1)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {reviews.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No reviews yet</p>
          </div>
        ) : (
          reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </CardContent>
    </Card>
  )
}
