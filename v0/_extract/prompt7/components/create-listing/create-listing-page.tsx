"use client"

import { useState, useEffect, useCallback } from "react"
import {
  FileText,
  DollarSign,
  MapPin,
  ImageIcon,
  Tag,
  ShieldAlert,
  Zap,
  Sparkles,
  Navigation,
  CheckCircle2,
  TrendingDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SectionDivider } from "./section-divider"
import { DealTemplates, DEAL_TEMPLATES, type DealTemplate } from "./deal-templates"
import { ImageUpload } from "./image-upload"
import { TagsInput } from "./tags-input"
import { DistributionSelector, type DistributionType } from "./distribution-selector"

const COUNTRIES = [
  "Australia", "Canada", "Germany", "India", "Japan",
  "New Zealand", "Singapore", "South Africa", "United Kingdom", "United States",
]

const LANGUAGES = [
  "English", "French", "German", "Hindi", "Japanese",
  "Mandarin", "Portuguese", "Spanish",
]

interface FormState {
  title: string
  description: string
  category: "Physical" | "Digital" | "Offer"
  slots: string
  pricePerSlot: string
  marketPrice: string
  country: string
  language: string
  location: string
  expiryDate: string
  distributionType: DistributionType
  distributionDetails: string
}

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  category: "Physical",
  slots: "",
  pricePerSlot: "",
  marketPrice: "",
  country: "Australia",
  language: "English",
  location: "",
  expiryDate: "",
  distributionType: "Pickup",
  distributionDetails: "",
}

const AI_DESCRIPTIONS: Record<string, string> = {
  Electronics:
    "Join our curated group buy for the latest consumer electronics — from smartphones and laptops to smart home devices. By pooling our orders, we unlock wholesale pricing direct from verified suppliers, passing substantial savings to every member. All items come with full manufacturer warranties.",
  Groceries:
    "Fresh, high-quality groceries sourced directly from local farms and regional suppliers. This group buy covers pantry staples, fresh produce, dairy, and dry goods. The more members who join, the better our per-unit cost. Orders are split into individual household packs for easy distribution.",
  Gym:
    "Negotiate a premium group rate at our partnered fitness facilities. Members gain access to full gym equipment, classes, pools, and wellness amenities at a fraction of the standard membership fee. Available for 12-month annual commitments — the more members, the steeper the discount.",
  Software:
    "Access professional-grade software at a fraction of retail price by sharing a team or enterprise license. Perfect for freelancers, small teams, or startups who need premium tools without the premium price tag. Includes setup support and licence transfer assistance.",
  "Book Club":
    "Order the next book club selection in bulk directly from the publisher or distributor. We negotiate discounted rates on print and digital editions, making it affordable for every reader. Includes free shipping when we hit our group target. Vote on next picks in the community chat.",
}

export default function CreateListingPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [isLocating, setIsLocating] = useState(false)
  const [isVerified] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Auto-save draft to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.title || form.description) {
        localStorage.setItem("grouperry_draft", JSON.stringify({ form, tags }))
        setDraftSaved(true)
        setTimeout(() => setDraftSaved(false), 2000)
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [form, tags])

  // Restore draft on mount
  useEffect(() => {
    const saved = localStorage.getItem("grouperry_draft")
    if (saved) {
      try {
        const { form: savedForm, tags: savedTags } = JSON.parse(saved)
        setForm(savedForm)
        setTags(savedTags || [])
      } catch {
        // ignore
      }
    }
  }, [])

  const updateField = useCallback((field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleTemplateSelect = useCallback((tpl: DealTemplate) => {
    setSelectedTemplate(tpl.id)
    setForm((prev) => ({
      ...prev,
      title: tpl.title,
      description: tpl.description,
      category: tpl.category,
      slots: String(tpl.slots),
    }))
    setTags(tpl.tags)
  }, [])

  const handleAiGenerate = useCallback(async () => {
    if (!form.title) return
    setIsAiGenerating(true)
    // Simulate AI generation with a delay
    await new Promise((resolve) => setTimeout(resolve, 1400))
    const keyword = DEAL_TEMPLATES.find((t) =>
      form.title.toLowerCase().includes(t.label.toLowerCase())
    )?.label ?? Object.keys(AI_DESCRIPTIONS)[Math.floor(Math.random() * Object.keys(AI_DESCRIPTIONS).length)]
    const description = AI_DESCRIPTIONS[keyword] ?? AI_DESCRIPTIONS["Electronics"]
    setForm((prev) => ({ ...prev, description }))
    setIsAiGenerating(false)
  }, [form.title])

  const handleAddImages = useCallback((files: File[]) => {
    const newFiles = [...images, ...files].slice(0, 5)
    setImages(newFiles)
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f))
    setPreviews(newPreviews)
  }, [images])

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const handleAddTag = useCallback((tag: string) => {
    setTags((prev) => [...prev, tag])
  }, [])

  const handleRemoveTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) return
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        updateField("location", `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        setIsLocating(false)
      },
      () => {
        setIsLocating(false)
      }
    )
  }, [updateField])

  const savingsPercent =
    form.marketPrice && form.pricePerSlot
      ? Math.round((1 - parseFloat(form.pricePerSlot) / parseFloat(form.marketPrice)) * 100)
      : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isVerified) return
    setSubmitted(true)
    localStorage.removeItem("grouperry_draft")
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Listing Published!</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your group buy is now live. Share it with your community and start collecting members.
          </p>
          <Button
            onClick={() => { setSubmitted(false); setForm(INITIAL_FORM); setTags([]); setImages([]); setPreviews([]) }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            Create another listing
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-accent" />
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">Grouperry</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground text-balance">Create a Listing</h1>
            <p className="text-muted-foreground mt-1">Start a group buy and save together</p>
          </div>
          {draftSaved && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Draft saved
            </span>
          )}
        </div>

        {/* Verification Banner */}
        {!isVerified && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-2xl">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Verification required</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                Complete your profile and verify your phone number before you can publish listings.{" "}
                <button className="underline underline-offset-2 font-medium hover:no-underline">
                  Go to profile →
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Deal Templates */}
        <DealTemplates onSelect={handleTemplateSelect} selectedId={selectedTemplate} />

        {/* Form Card */}
        <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border">
          <form onSubmit={handleSubmit} className="space-y-0">

            {/* ── STEP 1: BASICS ── */}
            <SectionDivider step={1} icon={FileText} title="Basics" description="Tell us about your group buy" />

            <div className="space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-foreground">
                  Listing Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Group Buy — Sony WH-1000XM5 Headphones"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAiGenerate}
                    disabled={isAiGenerating || !form.title}
                    className="h-7 px-2.5 text-xs font-medium text-accent hover:text-accent hover:bg-accent/10 gap-1.5"
                  >
                    {isAiGenerating ? (
                      <>
                        <span className="inline-block w-3.5 h-3.5 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
                        Generating…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="description"
                  placeholder="Describe the deal, what members get, and why it's great value…"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  required
                  rows={4}
                  className="rounded-xl resize-none leading-relaxed"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Category</Label>
                <div className="flex gap-3">
                  {(["Physical", "Digital", "Offer"] as const).map((cat) => (
                    <label
                      key={cat}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
                        form.category === cat
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={form.category === cat}
                        onChange={() => updateField("category", cat)}
                        className="sr-only"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              {/* Slots */}
              <div className="space-y-2">
                <Label htmlFor="slots" className="text-sm font-semibold text-foreground">
                  Total Slots <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slots"
                  type="number"
                  min="2"
                  max="1000"
                  placeholder="e.g. 20"
                  value={form.slots}
                  onChange={(e) => updateField("slots", e.target.value)}
                  required
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">Minimum 2 slots required to form a group buy</p>
              </div>
            </div>

            {/* ── STEP 2: PRICING ── */}
            <SectionDivider step={2} icon={DollarSign} title="Pricing" description="Set competitive group prices" />

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {/* Price per slot */}
                <div className="space-y-2">
                  <Label htmlFor="pricePerSlot" className="text-sm font-semibold text-foreground">
                    Price per Slot <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                    <Input
                      id="pricePerSlot"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={form.pricePerSlot}
                      onChange={(e) => updateField("pricePerSlot", e.target.value)}
                      required
                      className="rounded-xl pl-7"
                    />
                  </div>
                </div>

                {/* Market price */}
                <div className="space-y-2">
                  <Label htmlFor="marketPrice" className="text-sm font-semibold text-foreground">
                    Market Price
                    <span className="ml-1 text-xs text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                    <Input
                      id="marketPrice"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={form.marketPrice}
                      onChange={(e) => updateField("marketPrice", e.target.value)}
                      className="rounded-xl pl-7"
                    />
                  </div>
                </div>
              </div>

              {/* Savings display */}
              {savingsPercent !== null && savingsPercent > 0 && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Members save{" "}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{savingsPercent}%</span>{" "}
                    compared to market price
                  </p>
                </div>
              )}
              {savingsPercent !== null && savingsPercent <= 0 && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Group price is higher than market price — double-check your values
                  </p>
                </div>
              )}
            </div>

            {/* ── STEP 3: LOCATION & DISTRIBUTION ── */}
            <SectionDivider step={3} icon={MapPin} title="Location & Distribution" description="Where and how members receive their items" />

            <div className="space-y-5">
              {/* Country + Language */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-semibold text-foreground">Country</Label>
                  <select
                    id="country"
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-semibold text-foreground">Language</Label>
                  <select
                    id="language"
                    value={form.language}
                    onChange={(e) => updateField("language", e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-semibold text-foreground">Location / Pickup Area</Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    placeholder="e.g. Melbourne CBD, or suburb name"
                    value={form.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    className="rounded-xl flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUseMyLocation}
                    disabled={isLocating}
                    className="rounded-xl shrink-0 gap-1.5 border-border"
                  >
                    {isLocating ? (
                      <span className="inline-block w-4 h-4 border-2 border-muted-foreground/40 border-t-muted-foreground rounded-full animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{isLocating ? "Locating…" : "Use my location"}</span>
                  </Button>
                </div>
              </div>

              {/* Expiry date */}
              <div className="space-y-2">
                <Label htmlFor="expiry" className="text-sm font-semibold text-foreground">
                  Expiry Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="expiry"
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => updateField("expiryDate", e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="rounded-xl"
                />
              </div>

              {/* Distribution type */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Distribution Type</Label>
                <DistributionSelector
                  value={form.distributionType}
                  onChange={(v) => updateField("distributionType", v)}
                />
              </div>

              {/* Distribution details */}
              <div className="space-y-2">
                <Label htmlFor="distributionDetails" className="text-sm font-semibold text-foreground">
                  Distribution Details
                  <span className="ml-1 text-xs text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="distributionDetails"
                  placeholder={
                    form.distributionType === "Pickup"
                      ? "Describe the pickup address, times, and any instructions…"
                      : form.distributionType === "Delivery"
                      ? "Describe shipping method, estimated delivery time, and regions covered…"
                      : "Describe how members receive their digital access — links, codes, or files…"
                  }
                  value={form.distributionDetails}
                  onChange={(e) => updateField("distributionDetails", e.target.value)}
                  rows={3}
                  className="rounded-xl resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* ── STEP 4: IMAGES ── */}
            <SectionDivider step={4} icon={ImageIcon} title="Images" description="Add up to 5 photos of the item or deal" />

            <ImageUpload
              images={images}
              previews={previews}
              onAdd={handleAddImages}
              onRemove={handleRemoveImage}
              maxImages={5}
            />

            {/* ── STEP 5: TAGS ── */}
            <SectionDivider step={5} icon={Tag} title="Tags" description="Help members discover your listing" />

            <TagsInput tags={tags} onAdd={handleAddTag} onRemove={handleRemoveTag} maxTags={10} />

            {/* Submit */}
            <div className="pt-8">
              {!isVerified && (
                <p className="text-center text-sm text-amber-600 dark:text-amber-400 mb-4 font-medium">
                  Complete verification to publish your listing
                </p>
              )}
              <Button
                type="submit"
                disabled={!isVerified}
                className="w-full h-12 text-base gap-2 font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Zap className="w-5 h-5" />
                Publish Group Buy
              </Button>
              {isVerified && (
                <p className="text-center text-xs text-muted-foreground mt-3">
                  Your listing will be live immediately and visible to the community
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8 mb-4">
          Grouperry © 2026 · Group buying made simple
        </p>
      </div>
    </main>
  )
}
