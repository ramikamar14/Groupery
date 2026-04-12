'use client'

import { useState } from 'react'
import { Camera, Star, Shield, BadgeCheck, Trophy, Zap, Copy, Check, Gift } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RankBadge } from './RankBadge'
import { cn } from '@/lib/utils'

interface ProfileCardProps {
  user: {
    name: string
    username: string
    avatar: string
    rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'
    rating: number
    ratingCount: number
    reliabilityScore: number
    completedDeals: number
    cancellations: number
    referralLink: string
    referredCount: number
    bio: string
    email: string
    phone: string
    phoneVerified: boolean
    country: string
    language: string
    badges: Array<'Verified' | 'Trusted Member' | 'Top Organizer'>
  }
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'w-4 h-4',
            i < Math.floor(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : i < rating
              ? 'fill-yellow-400/50 text-yellow-400'
              : 'fill-muted text-muted-foreground/30'
          )}
        />
      ))}
      <span className="text-sm font-medium text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  )
}

const badgeConfig = {
  Verified:         { icon: BadgeCheck, color: 'text-accent',      bg: 'bg-accent/10 dark:bg-accent/20',       border: 'border-accent/30' },
  'Trusted Member': { icon: Shield,     color: 'text-primary',     bg: 'bg-primary/10 dark:bg-primary/20',     border: 'border-primary/30' },
  'Top Organizer':  { icon: Trophy,     color: 'text-yellow-600',  bg: 'bg-yellow-50 dark:bg-yellow-900/20',   border: 'border-yellow-300 dark:border-yellow-700' },
}

export function ProfileCard({ user }: ProfileCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(user.referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="overflow-hidden border-border shadow-lg">
      {/* Cover gradient */}
      <div className="h-36 bg-gradient-to-r from-primary/30 via-primary/10 to-accent/25 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
      </div>

      <CardContent className="px-6 pb-8 pt-0">
        {/* Avatar */}
        <div className="relative -mt-16 mb-5 w-fit">
          <Avatar className="w-28 h-28 border-4 border-card shadow-xl ring-2 ring-accent/30">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-1 right-1 w-8 h-8 rounded-full shadow-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Name + rank */}
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
          <RankBadge rank={user.rank} />
        </div>
        <p className="text-sm text-muted-foreground mb-3">@{user.username}</p>

        {/* Star rating */}
        <div className="flex items-center gap-3 mb-4">
          <StarRating rating={user.rating} />
          <span className="text-xs text-muted-foreground">({user.ratingCount} reviews)</span>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          {user.badges.map(badge => {
            const { icon: Icon, color, bg, border } = badgeConfig[badge]
            return (
              <span
                key={badge}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
                  bg, color, border
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {badge}
              </span>
            )
          })}
        </div>

        {/* Reliability score */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-accent" />
              Reliability Score
            </span>
            <span className="text-sm font-bold text-accent">{user.reliabilityScore}/100</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full transition-all duration-700"
              style={{ width: `${user.reliabilityScore}%` }}
            />
          </div>
        </div>

        {/* Trust stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
            <BadgeCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300">{user.completedDeals}</div>
            <div className="text-[10px] text-emerald-700/70 dark:text-emerald-500 leading-tight">Completed deals</div>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-center">
            <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1 fill-yellow-400" />
            <div className="text-lg font-bold text-yellow-800 dark:text-yellow-300">{user.rating.toFixed(1)}</div>
            <div className="text-[10px] text-yellow-700/70 dark:text-yellow-500 leading-tight">Avg rating</div>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
            <Shield className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-red-800 dark:text-red-300">{user.cancellations}</div>
            <div className="text-[10px] text-red-700/70 dark:text-red-500 leading-tight">Cancellations</div>
          </div>
        </div>

        {/* Referral card */}
        <div className="rounded-2xl bg-gradient-to-r from-accent/90 to-accent/60 dark:from-accent/70 dark:to-accent/40 p-4 mb-6 text-accent-foreground dark:text-foreground">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-xl shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-0.5">Refer & Earn</h4>
              <p className="text-xs opacity-80 mb-3">
                Invite friends to Grouperry and earn rewards. <strong>{user.referredCount} friends</strong> joined so far.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/20 rounded-lg px-3 py-1.5 text-xs font-mono truncate opacity-90">
                  {user.referralLink}
                </div>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0 bg-white/20 hover:bg-white/30 border border-white/30 text-inherit h-8 text-xs font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mb-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">About</h4>
            <p className="text-sm text-foreground/80 leading-relaxed">{user.bio}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
