'use client'

import { useState } from 'react'
import { Shield, Bell, Settings, ChevronLeft, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { ContactInfo } from '@/components/profile/ContactInfo'
import { ListingsSection } from '@/components/profile/ListingsSection'
import { ReviewsSection } from '@/components/profile/ReviewsSection'
import { EditProfileDialog } from '@/components/profile/EditProfileDialog'
import { VerifyIdentityDialog } from '@/components/profile/VerifyIdentityDialog'
import type { Listing } from '@/components/profile/ListingsSection'
import type { Review } from '@/components/profile/ReviewsSection'

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_USER = {
  name: 'Rami Al-Hassan',
  firstName: 'Rami',
  lastName: 'Al-Hassan',
  username: 'rami.hassan',
  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rami',
  rank: 'Gold' as const,
  rating: 4.7,
  ratingCount: 31,
  reliabilityScore: 82,
  completedDeals: 12,
  cancellations: 1,
  referralLink: 'grouperry.app/ref/rami2024',
  referredCount: 8,
  bio: 'Group-buying enthusiast based in Dubai 🇦🇪. Love organizing tech & home deals for the community. Reliable, fast communication, and always deliver on time.',
  city: 'Dubai',
  email: 'rami.hassan@email.com',
  phone: '+971 50 123 4567',
  phoneVerified: false,
  country: 'UAE',
  language: 'Arabic',
  badges: ['Verified', 'Trusted Member', 'Top Organizer'] as Array<'Verified' | 'Trusted Member' | 'Top Organizer'>,
}

const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'Apple AirPods Pro 2nd Gen',
    category: 'Electronics',
    price: 189,
    originalPrice: 249,
    slots: 10,
    filled: 8,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    title: 'Dyson V15 Cordless Vacuum',
    category: 'Home',
    price: 420,
    originalPrice: 599,
    slots: 5,
    filled: 5,
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    title: 'Nike Air Max 2024 Bundle',
    category: 'Fashion',
    price: 95,
    originalPrice: 150,
    slots: 8,
    filled: 3,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
  },
  {
    id: '4',
    title: 'Nespresso Vertuo Next Coffee',
    category: 'Kitchen',
    price: 110,
    originalPrice: 179,
    slots: 6,
    filled: 6,
    status: 'Completed',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
  },
]

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    author: 'Sarah K.',
    authorAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah',
    rating: 5,
    date: 'Mar 2025',
    text: 'Rami is an amazing organizer! Super responsive and everything went smoothly. The AirPods arrived ahead of schedule. Highly recommend!',
    dealTitle: 'Apple AirPods Pro',
  },
  {
    id: '2',
    author: 'Mohamed A.',
    authorAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Mohamed',
    rating: 5,
    date: 'Feb 2025',
    text: 'Very professional and trustworthy. Kept us updated throughout the process. Would definitely join another deal with him.',
    dealTitle: 'Dyson V15 Vacuum',
  },
  {
    id: '3',
    author: 'Layla N.',
    authorAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Layla',
    rating: 4,
    date: 'Jan 2025',
    text: 'Good organizer. Slight delay in delivery but kept us informed the whole time. Great deal overall — saved a lot!',
    dealTitle: 'Nike Air Max Bundle',
  },
]

// ─── Banners ─────────────────────────────────────────────────────────────────

function VerificationBanner({ onVerify }: { onVerify: () => void }) {
  return (
    <div className="rounded-2xl border border-amber-300 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 p-5 flex gap-4">
      <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl h-fit">
        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-amber-900 dark:text-amber-200 text-sm mb-1">Verify your identity</h3>
        <p className="text-sm text-amber-800/80 dark:text-amber-300/70 mb-3 leading-relaxed">
          Verified users get more trust and better conversion on their listings. It only takes 2 minutes.
        </p>
        <Button
          size="sm"
          onClick={onVerify}
          className="bg-amber-600 hover:bg-amber-700 text-white border-0 h-8 text-xs font-semibold"
        >
          Get Verified Now
        </Button>
      </div>
    </div>
  )
}

function PendingReviewBanner() {
  return (
    <div className="rounded-2xl border border-blue-300 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 p-4 flex gap-3 items-start">
      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
      <p className="text-sm text-blue-800 dark:text-blue-300">
        <strong>Identity review in progress.</strong> Our team is reviewing your submitted documents. This usually takes 1–2 business days.
      </p>
    </div>
  )
}

// ─── Layout wrapper ───────────────────────────────────────────────────────────

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-xs">G</span>
              </div>
              <span className="font-bold text-sm text-foreground">Grouperry</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [pendingReview, setPendingReview] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const handleVerifySubmit = () => {
    setPendingReview(true)
    setVerifyOpen(false)
  }

  return (
    <Layout>
      <div className="space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground text-balance">My Profile</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your public presence</p>
          </div>
          <div className="flex gap-2">
            <EditProfileDialog
              user={{
                firstName: MOCK_USER.firstName,
                lastName: MOCK_USER.lastName,
                city: MOCK_USER.city,
                bio: MOCK_USER.bio,
                country: MOCK_USER.country,
                language: MOCK_USER.language,
              }}
            />
          </div>
        </div>

        {/* Banners */}
        {!isVerified && !pendingReview && (
          <VerificationBanner onVerify={() => setVerifyOpen(true)} />
        )}
        {pendingReview && !isVerified && (
          <PendingReviewBanner />
        )}

        {/* Profile card */}
        <ProfileCard user={MOCK_USER} />

        {/* Contact info */}
        <ContactInfo
          email={MOCK_USER.email}
          phone={MOCK_USER.phone}
          phoneVerified={MOCK_USER.phoneVerified}
          country={MOCK_USER.country}
          language={MOCK_USER.language}
          onVerifyPhone={() => setVerifyOpen(true)}
        />

        {/* Listings */}
        <ListingsSection listings={MOCK_LISTINGS} />

        {/* Reviews */}
        <ReviewsSection reviews={MOCK_REVIEWS} avgRating={MOCK_USER.rating} />
      </div>

      {/* Verify identity dialog */}
      <VerifyIdentityDialog
        open={verifyOpen}
        onOpenChange={open => {
          setVerifyOpen(open)
          if (!open && !pendingReview) {
            // submitted
          }
        }}
      />
    </Layout>
  )
}
