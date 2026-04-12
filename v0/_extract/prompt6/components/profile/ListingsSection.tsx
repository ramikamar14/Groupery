'use client'

import { Users, Tag, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface Listing {
  id: string
  title: string
  category: string
  price: number
  originalPrice: number
  slots: number
  filled: number
  status: 'Active' | 'Completed' | 'Expired'
  image: string
}

const statusConfig = {
  Active:    { label: 'Active',    className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  Completed: { label: 'Completed', className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
  Expired:   { label: 'Expired',   className: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' },
}

function ListingCard({ listing }: { listing: Listing }) {
  const discount = Math.round((1 - listing.price / listing.originalPrice) * 100)
  const fillPct = Math.min(100, Math.round((listing.filled / listing.slots) * 100))
  const { className } = statusConfig[listing.status]

  return (
    <Card className="group overflow-hidden border-border hover:border-accent/40 hover:shadow-md transition-all duration-200">
      <div className="relative h-36 bg-muted overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', className)}>
            {listing.status}
          </span>
        </div>
      </div>
      <CardContent className="p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">{listing.category}</div>
        <h4 className="text-sm font-semibold text-foreground leading-tight mb-2 line-clamp-1">{listing.title}</h4>
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-base font-bold text-accent">${listing.price}</span>
          <span className="text-xs text-muted-foreground line-through">${listing.originalPrice}</span>
        </div>
        <div className="mb-1.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {listing.filled}/{listing.slots} slots</span>
            <span>{fillPct}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ListingsSectionProps {
  listings: Listing[]
}

export function ListingsSection({ listings }: ListingsSectionProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Tag className="w-4 h-4 text-accent" />
          My Listings
          <Badge variant="secondary" className="text-xs font-medium">{listings.length}</Badge>
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-accent hover:text-accent text-xs h-7 gap-1">
          View all <ArrowUpRight className="w-3.5 h-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No listings yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
