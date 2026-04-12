"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Search, 
  MapPin, 
  X, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Brain, 
  Gift, 
  SlidersHorizontal, 
  Users, 
  Package, 
  Copy, 
  CheckCheck, 
  Star, 
  Flame,
  Monitor,
  Ticket,
  Globe,
  Languages,
  User,
  Store,
  Zap,
  UserPlus,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const MOCK_LISTINGS = [
  {
    id: 1,
    title: "Premium Wireless Earbuds",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop",
    originalPrice: 199,
    groupPrice: 129,
    spotsTotal: 20,
    spotsFilled: 16,
    category: "physical",
    seller: { name: "TechHub", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TechHub", verified: true },
    tags: ["electronics", "audio"],
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    location: "San Francisco, CA"
  },
  {
    id: 2,
    title: "Figma Pro Annual License",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop",
    originalPrice: 144,
    groupPrice: 89,
    spotsTotal: 50,
    spotsFilled: 42,
    category: "digital",
    seller: { name: "DesignCo", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DesignCo", verified: true },
    tags: ["software", "design"],
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    location: "Remote"
  },
  {
    id: 3,
    title: "Organic Coffee Subscription",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop",
    originalPrice: 45,
    groupPrice: 32,
    spotsTotal: 30,
    spotsFilled: 28,
    category: "physical",
    seller: { name: "BeanLovers", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=BeanLovers", verified: false },
    tags: ["food", "subscription"],
    endsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    location: "Portland, OR"
  },
  {
    id: 4,
    title: "Online Yoga Masterclass",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
    originalPrice: 299,
    groupPrice: 149,
    spotsTotal: 100,
    spotsFilled: 67,
    category: "digital",
    seller: { name: "ZenLife", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ZenLife", verified: true },
    tags: ["wellness", "courses"],
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    location: "Remote"
  },
  {
    id: 5,
    title: "Handmade Ceramic Set",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop",
    originalPrice: 180,
    groupPrice: 120,
    spotsTotal: 15,
    spotsFilled: 12,
    category: "physical",
    seller: { name: "ArtisanMade", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ArtisanMade", verified: true },
    tags: ["home", "handmade"],
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    location: "Austin, TX"
  },
  {
    id: 6,
    title: "Spa Day Package",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop",
    originalPrice: 250,
    groupPrice: 175,
    spotsTotal: 25,
    spotsFilled: 20,
    category: "offer",
    seller: { name: "RelaxSpa", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RelaxSpa", verified: true },
    tags: ["wellness", "local"],
    endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    location: "Los Angeles, CA"
  }
];

const DEAL_OF_THE_DAY = {
  id: 99,
  title: "Sony WH-1000XM5 Headphones",
  description: "Industry-leading noise cancellation with exceptional sound quality. Group buy exclusive!",
  image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&h=500&fit=crop",
  originalPrice: 399,
  groupPrice: 279,
  spotsTotal: 50,
  spotsFilled: 38,
  seller: { name: "AudioPro", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AudioPro", verified: true, rating: 4.9, deals: 127 },
  endsAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
  savings: 30
};

const POPULAR_TAGS = ["electronics", "software", "wellness", "home", "food", "courses", "fashion", "beauty"];

const ACTIVITY_FEED = [
  { id: 1, type: "join", user: "Sarah M.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", action: "joined", item: "Premium Wireless Earbuds", time: "2m ago" },
  { id: 2, type: "complete", user: "Group Deal", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=complete", action: "completed", item: "Figma Team License", time: "15m ago" },
  { id: 3, type: "new", user: "Mike R.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", action: "created", item: "Camera Lens Bundle", time: "32m ago" },
  { id: 4, type: "join", user: "Emma L.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", action: "joined", item: "Yoga Masterclass", time: "1h ago" },
];

// Components

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Grouperry
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Discover</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Categories</a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
        </nav>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden sm:flex">Sign In</Button>
          <Button size="sm" className="rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}

function AISuggestionsBanner({ onDismiss }: { onDismiss: () => void }) {
  const suggestions = [
    { title: "Wireless Earbuds", match: "92%", reason: "Based on your browsing" },
    { title: "Design Software", match: "88%", reason: "Popular in your area" },
  ];
  
  return (
    <div className="relative bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-4 sm:p-6 mb-6 border border-primary/20 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
      <button 
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-background/50 transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-xl bg-primary/20">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">AI Picks for You</h3>
          <p className="text-sm text-muted-foreground">Personalized deals based on your interests</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {suggestions.map((s, i) => (
          <button 
            key={i}
            className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all group"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="font-medium text-sm">{s.title}</span>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
              {s.match}
            </Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ReferralBanner({ onDismiss }: { onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);
  const referralCode = "GROUPERRY2024";
  
  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-3xl p-4 sm:p-5 mb-6 border border-amber-500/20">
      <button 
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-background/50 transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2.5 rounded-xl bg-amber-500/20">
            <Gift className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Invite Friends, Earn Rewards</h3>
            <p className="text-sm text-muted-foreground">Get $10 credit for each friend who joins</p>
          </div>
          <Badge className="bg-amber-500/20 text-amber-700 border-0 ml-2">
            3 referrals
          </Badge>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopy}
          className="rounded-full border-amber-500/30 hover:bg-amber-500/10 gap-2"
        >
          {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : referralCode}
        </Button>
      </div>
    </div>
  );
}

function DealOfTheDay() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const calculateTime = () => {
      const diff = DEAL_OF_THE_DAY.endsAt.getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const fillPercentage = (DEAL_OF_THE_DAY.spotsFilled / DEAL_OF_THE_DAY.spotsTotal) * 100;
  
  return (
    <div className="relative rounded-3xl overflow-hidden mb-8 group">
      <div className="absolute inset-0">
        <img 
          src={DEAL_OF_THE_DAY.image} 
          alt={DEAL_OF_THE_DAY.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
      </div>
      
      <div className="relative p-6 sm:p-8 min-h-[320px] sm:min-h-[380px] flex flex-col justify-end">
        {/* Top badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <Badge className="bg-accent text-accent-foreground border-0 rounded-full px-3 py-1 font-semibold">
            <Flame className="w-3.5 h-3.5 mr-1" />
            Deal of the Day
          </Badge>
          <Badge className="bg-green-500 text-white border-0 rounded-full px-3 py-1 font-semibold">
            Save {DEAL_OF_THE_DAY.savings}%
          </Badge>
        </div>
        
        {/* Timer */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex items-center gap-3">
          <Clock className="w-4 h-4 text-accent" />
          <div className="flex items-center gap-1 font-mono text-white font-semibold">
            <span className="bg-white/20 rounded-lg px-2 py-1">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span>:</span>
            <span className="bg-white/20 rounded-lg px-2 py-1">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span>:</span>
            <span className="bg-white/20 rounded-lg px-2 py-1">{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2 text-balance">
              {DEAL_OF_THE_DAY.title}
            </h2>
            <p className="text-white/80 text-sm sm:text-base max-w-xl">
              {DEAL_OF_THE_DAY.description}
            </p>
          </div>
          
          {/* Seller info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-white/30">
              <AvatarImage src={DEAL_OF_THE_DAY.seller.avatar} />
              <AvatarFallback>{DEAL_OF_THE_DAY.seller.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{DEAL_OF_THE_DAY.seller.name}</span>
                {DEAL_OF_THE_DAY.seller.verified && (
                  <CheckCircle className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{DEAL_OF_THE_DAY.seller.rating}</span>
                <span>·</span>
                <span>{DEAL_OF_THE_DAY.seller.deals} deals</span>
              </div>
            </div>
          </div>
          
          {/* Progress and pricing */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">
                  <Users className="w-4 h-4 inline mr-1" />
                  {DEAL_OF_THE_DAY.spotsFilled}/{DEAL_OF_THE_DAY.spotsTotal} joined
                </span>
                <span className="text-accent font-medium">{Math.round(fillPercentage)}% filled</span>
              </div>
              <Progress value={fillPercentage} className="h-2.5 bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-white/50 line-through text-sm">${DEAL_OF_THE_DAY.originalPrice}</div>
                <div className="text-2xl sm:text-3xl font-bold text-white">${DEAL_OF_THE_DAY.groupPrice}</div>
              </div>
              <Button size="lg" className="rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity px-6 sm:px-8 font-semibold">
                Join Group
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiscoverySection({ 
  title, 
  icon, 
  listings 
}: { 
  title: string; 
  icon: React.ReactNode; 
  listings: typeof MOCK_LISTINGS;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    ref?.addEventListener('scroll', checkScroll);
    return () => ref?.removeEventListener('scroll', checkScroll);
  }, []);
  
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              "p-2 rounded-full border border-border transition-all",
              canScrollLeft 
                ? "hover:bg-secondary hover:border-primary/30" 
                : "opacity-30 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={cn(
              "p-2 rounded-full border border-border transition-all",
              canScrollRight 
                ? "hover:bg-secondary hover:border-primary/30" 
                : "opacity-30 cursor-not-allowed"
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} compact />
        ))}
      </div>
    </section>
  );
}

function ListingCard({ 
  listing, 
  compact = false 
}: { 
  listing: typeof MOCK_LISTINGS[0]; 
  compact?: boolean;
}) {
  const fillPercentage = (listing.spotsFilled / listing.spotsTotal) * 100;
  const savings = Math.round((1 - listing.groupPrice / listing.originalPrice) * 100);
  const isFillingFast = fillPercentage >= 80;
  
  const categoryIcon = {
    physical: <Package className="w-3.5 h-3.5" />,
    digital: <Monitor className="w-3.5 h-3.5" />,
    offer: <Ticket className="w-3.5 h-3.5" />
  }[listing.category];
  
  return (
    <div className={cn(
      "group bg-card rounded-3xl border border-border overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30",
      compact ? "flex-shrink-0 w-[280px]" : "w-full"
    )}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={listing.image} 
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm border-0 text-xs gap-1">
            {categoryIcon}
            {listing.category}
          </Badge>
          {isFillingFast && (
            <Badge className="bg-accent text-accent-foreground border-0 text-xs">
              <Zap className="w-3 h-3 mr-0.5" />
              Filling fast
            </Badge>
          )}
        </div>
        
        <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0 text-xs font-semibold">
          -{savings}%
        </Badge>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
        </div>
        
        {/* Seller */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="w-5 h-5">
            <AvatarImage src={listing.seller.avatar} />
            <AvatarFallback className="text-[10px]">{listing.seller.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{listing.seller.name}</span>
          {listing.seller.verified && (
            <CheckCircle className="w-3.5 h-3.5 text-primary" />
          )}
        </div>
        
        {/* Progress */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{listing.spotsFilled}/{listing.spotsTotal} joined</span>
            <span className="text-primary font-medium">{Math.round(fillPercentage)}%</span>
          </div>
          <Progress value={fillPercentage} className="h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">${listing.groupPrice}</span>
            <span className="text-sm text-muted-foreground line-through">${listing.originalPrice}</span>
          </div>
          <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-sm h-8 px-4">
            Join
          </Button>
        </div>
      </div>
    </div>
  );
}

function ActivityFeed() {
  const iconMap = {
    join: <UserPlus className="w-3.5 h-3.5 text-green-500" />,
    complete: <CheckCircle className="w-3.5 h-3.5 text-primary" />,
    new: <Sparkles className="w-3.5 h-3.5 text-accent" />
  };
  
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-accent" />
        <h2 className="font-display text-lg font-semibold">Live Activity</h2>
      </div>
      
      <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
        {ACTIVITY_FEED.map((activity) => (
          <div key={activity.id} className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={activity.avatar} />
              <AvatarFallback>{activity.user[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">
                <span className="font-medium">{activity.user}</span>
                <span className="text-muted-foreground"> {activity.action} </span>
                <span className="text-primary font-medium">{activity.item}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {iconMap[activity.type as keyof typeof iconMap]}
              <span>{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FilterChip({ 
  label, 
  icon, 
  active, 
  onClick 
}: { 
  label: string; 
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all",
        active 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export default function Home() {
  const [showAIBanner, setShowAIBanner] = useState(true);
  const [showReferralBanner, setShowReferralBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSellerType, setSelectedSellerType] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [fillingFastOnly, setFillingFastOnly] = useState(false);
  
  // Filter listings
  const filteredListings = MOCK_LISTINGS.filter(listing => {
    if (selectedCategory && listing.category !== selectedCategory) return false;
    if (selectedTag && !listing.tags.includes(selectedTag)) return false;
    if (fillingFastOnly && (listing.spotsFilled / listing.spotsTotal) < 0.8) return false;
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  const hasActiveFilters = selectedCategory || selectedSellerType || selectedTag || fillingFastOnly;
  
  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSellerType(null);
    setSelectedTag(null);
    setFillingFastOnly(false);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Banners */}
        {showAIBanner && <AISuggestionsBanner onDismiss={() => setShowAIBanner(false)} />}
        {showReferralBanner && <ReferralBanner onDismiss={() => setShowReferralBanner(false)} />}
        
        {/* Search & Filters */}
        <div className="mb-6">
          {/* Search input */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search group deals..." 
              className="pl-12 pr-4 h-12 rounded-2xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/50 text-base"
            />
          </div>
          
          {/* Filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <FilterChip 
              label="All" 
              active={!selectedCategory}
              onClick={() => setSelectedCategory(null)}
            />
            <FilterChip 
              label="Physical" 
              icon={<Package className="w-4 h-4" />}
              active={selectedCategory === "physical"}
              onClick={() => setSelectedCategory(selectedCategory === "physical" ? null : "physical")}
            />
            <FilterChip 
              label="Digital" 
              icon={<Monitor className="w-4 h-4" />}
              active={selectedCategory === "digital"}
              onClick={() => setSelectedCategory(selectedCategory === "digital" ? null : "digital")}
            />
            <FilterChip 
              label="Offers" 
              icon={<Ticket className="w-4 h-4" />}
              active={selectedCategory === "offer"}
              onClick={() => setSelectedCategory(selectedCategory === "offer" ? null : "offer")}
            />
            
            <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
            
            <FilterChip 
              label="Individuals" 
              icon={<User className="w-4 h-4" />}
              active={selectedSellerType === "individual"}
              onClick={() => setSelectedSellerType(selectedSellerType === "individual" ? null : "individual")}
            />
            <FilterChip 
              label="Vendors" 
              icon={<Store className="w-4 h-4" />}
              active={selectedSellerType === "vendor"}
              onClick={() => setSelectedSellerType(selectedSellerType === "vendor" ? null : "vendor")}
            />
            
            <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
            
            <FilterChip 
              label="Filling Fast" 
              icon={<Flame className="w-4 h-4" />}
              active={fillingFastOnly}
              onClick={() => setFillingFastOnly(!fillingFastOnly)}
            />
            
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
            
            {/* Mobile filters button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full sm:hidden ml-auto">
                  <SlidersHorizontal className="w-4 h-4 mr-1" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <div className="flex flex-wrap gap-2">
                      <FilterChip label="Physical" icon={<Package className="w-4 h-4" />} />
                      <FilterChip label="Digital" icon={<Monitor className="w-4 h-4" />} />
                      <FilterChip label="Offers" icon={<Ticket className="w-4 h-4" />} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <div className="flex flex-wrap gap-2">
                      <FilterChip label="Worldwide" icon={<Globe className="w-4 h-4" />} />
                      <FilterChip label="Near me" icon={<MapPin className="w-4 h-4" />} />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Tag cloud */}
          <div className="flex gap-2 flex-wrap mt-4">
            {POPULAR_TAGS.map(tag => (
              <Badge 
                key={tag}
                variant={selectedTag === tag ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer transition-all hover:scale-105",
                  selectedTag === tag 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary/50 hover:bg-secondary"
                )}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Deal of the Day */}
        <DealOfTheDay />
        
        {/* Discovery sections */}
        <DiscoverySection 
          title="Trending Now" 
          icon={<TrendingUp className="w-5 h-5" />} 
          listings={MOCK_LISTINGS.slice(0, 4)}
        />
        <DiscoverySection 
          title="Ending Soon" 
          icon={<Clock className="w-5 h-5" />} 
          listings={[...MOCK_LISTINGS].sort((a, b) => a.endsAt.getTime() - b.endsAt.getTime()).slice(0, 4)}
        />
        <DiscoverySection 
          title="Near You" 
          icon={<MapPin className="w-5 h-5" />} 
          listings={MOCK_LISTINGS.filter(l => l.location !== "Remote").slice(0, 4)}
        />
        
        {/* Activity Feed */}
        <ActivityFeed />
        
        {/* Main Listing Grid */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">All Deals</h2>
            <span className="text-sm text-muted-foreground">({filteredListings.length})</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          
          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">No deals found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
              <Button variant="outline" className="mt-4 rounded-full" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
          
          {filteredListings.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                Load more deals
              </Button>
            </div>
          )}
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Package className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">Grouperry</span>
          </div>
          <p>© 2024 Grouperry. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
