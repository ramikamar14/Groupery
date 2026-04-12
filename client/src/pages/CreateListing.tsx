import { useState, useCallback, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { useCreateListing } from "@/hooks/use-listings";
import { insertListingSchema, type InsertListing } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Upload, X, Plus, Tag, Sparkles, DollarSign, FileText, Globe, Image as ImageIcon, Truck, Package, Monitor, CheckCheck, Zap, ShoppingCart, Dumbbell, BookOpen, Cpu, ShieldAlert } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

function SectionDivider({ step, icon: Icon, title, desc }: { step: number; icon: any; title: string; desc?: string }) {
  return (
    <div className="flex items-start gap-3 pt-2 pb-1 border-t border-border/60 mt-2">
      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
        {step}
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <Icon className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">{title}</span>
        </div>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "MX", label: "Mexico" },
  { value: "BR", label: "Brazil" },
  { value: "AR", label: "Argentina" },
  { value: "CO", label: "Colombia" },
  { value: "UK", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "ES", label: "Spain" },
  { value: "IT", label: "Italy" },
  { value: "NL", label: "Netherlands" },
  { value: "BE", label: "Belgium" },
  { value: "PT", label: "Portugal" },
  { value: "PL", label: "Poland" },
  { value: "SE", label: "Sweden" },
  { value: "NO", label: "Norway" },
  { value: "DK", label: "Denmark" },
  { value: "FI", label: "Finland" },
  { value: "AT", label: "Austria" },
  { value: "CH", label: "Switzerland" },
  { value: "IE", label: "Ireland" },
  { value: "GR", label: "Greece" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "AE", label: "UAE" },
  { value: "EG", label: "Egypt" },
  { value: "MA", label: "Morocco" },
  { value: "DZ", label: "Algeria" },
  { value: "TN", label: "Tunisia" },
  { value: "JO", label: "Jordan" },
  { value: "LB", label: "Lebanon" },
  { value: "KW", label: "Kuwait" },
  { value: "QA", label: "Qatar" },
  { value: "BH", label: "Bahrain" },
  { value: "OM", label: "Oman" },
  { value: "IQ", label: "Iraq" },
  { value: "SY", label: "Syria" },
  { value: "PS", label: "Palestine" },
  { value: "LY", label: "Libya" },
  { value: "SD", label: "Sudan" },
  { value: "AU", label: "Australia" },
  { value: "NZ", label: "New Zealand" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "IN", label: "India" },
  { value: "KR", label: "South Korea" },
  { value: "SG", label: "Singapore" },
  { value: "MY", label: "Malaysia" },
  { value: "ID", label: "Indonesia" },
  { value: "TH", label: "Thailand" },
  { value: "PH", label: "Philippines" },
  { value: "VN", label: "Vietnam" },
  { value: "PK", label: "Pakistan" },
  { value: "TR", label: "Turkey" },
  { value: "ZA", label: "South Africa" },
  { value: "NG", label: "Nigeria" },
  { value: "KE", label: "Kenya" },
  { value: "GH", label: "Ghana" },
  { value: "OTHER", label: "Other" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "OTHER", label: "Other" },
];

const MAX_IMAGES = 5;

const formSchema = insertListingSchema;

interface UploadedImage {
  url: string;
  preview: string;
}

const DEAL_TEMPLATES = [
  {
    id: "electronics",
    label: "Electronics",
    icon: Cpu,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-400/30",
    title: "Electronics Group Buy: ",
    description: "Group buy for electronics. We're pooling together to get bulk pricing on high-quality tech products. Join us to unlock significant savings over retail price.\n\nWhat's included:\n- [Product name and model]\n- [Specifications]\n\nMinimum order: [X] units needed to unlock discount.",
    category: "physical" as const,
    totalSlots: 10,
    tags: ["electronics", "tech", "gadgets"],
  },
  {
    id: "groceries",
    label: "Groceries",
    icon: ShoppingCart,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10 border-green-400/30",
    title: "Bulk Order: ",
    description: "Bulk grocery purchase for our neighbourhood. By ordering together we get wholesale pricing and split the delivery cost.\n\nItems in this order:\n- [Product and quantity]\n- [Product and quantity]\n\nDelivery: [Date/location]",
    category: "physical" as const,
    totalSlots: 8,
    tags: ["groceries", "food", "bulk"],
  },
  {
    id: "gym",
    label: "Gym Membership",
    icon: Dumbbell,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10 border-orange-400/30",
    title: "Gym Membership Deal: ",
    description: "Group deal on gym membership — we're getting a corporate/group rate that's significantly cheaper than individual sign-up.\n\nIncludes:\n- [Gym name and location]\n- [Membership duration]\n- [Facilities included]\n\nMinimum group size required for this rate.",
    category: "offer" as const,
    totalSlots: 15,
    tags: ["gym", "fitness", "health"],
  },
  {
    id: "software",
    label: "Software Bundle",
    icon: Monitor,
    color: "text-[#008080] dark:text-teal-400",
    bg: "bg-teal-500/10 border-teal-400/30",
    title: "Software Bundle: ",
    description: "Group purchase for software licenses at a team/enterprise rate. Split the cost and get professional tools at a fraction of the individual price.\n\nWhat's included:\n- [Software name and version]\n- [License type: per seat / shared]\n- [Duration: annual/lifetime]\n\nEach person gets their own login/license.",
    category: "digital" as const,
    totalSlots: 10,
    tags: ["software", "digital", "tools"],
  },
  {
    id: "books",
    label: "Book Club",
    icon: BookOpen,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-400/30",
    title: "Book Club Order: ",
    description: "Group book order — buy together, save on shipping and sometimes get a volume discount.\n\nBooks in this order:\n- [Title by Author]\n\nEach person receives their own copy. Shipped to a common pick-up point or split delivery costs.",
    category: "physical" as const,
    totalSlots: 6,
    tags: ["books", "reading", "education"],
  },
];

export default function CreateListing() {
  const [, setLocation] = useLocation();
  const createListing = useCreateListing();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLocating, setIsLocating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [pricePerSlotDollars, setPricePerSlotDollars] = useState("");
  const [marketPriceDollars, setMarketPriceDollars] = useState("");
  const [distributionType, setDistributionType] = useState<"pickup" | "delivery" | "digital">("pickup");
  const [distributionDetails, setDistributionDetails] = useState("");
  const [draftSaved, setDraftSaved] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const draftKey = "grouperry-create-listing-draft";

  const applyTemplate = (tpl: typeof DEAL_TEMPLATES[number]) => {
    if (selectedTemplateId === tpl.id) {
      setSelectedTemplateId(null);
      return;
    }
    setSelectedTemplateId(tpl.id);
    form.setValue("title", tpl.title);
    form.setValue("description", tpl.description);
    form.setValue("category", tpl.category);
    form.setValue("totalSlots", tpl.totalSlots);
    setTags(tpl.tags);
    if (tpl.category === "digital") setDistributionType("digital");
    else setDistributionType("pickup");
  };

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    staleTime: 60000,
  });

  const { data: popularTags } = useQuery<{ tag: string; count: number }[]>({
    queryKey: ["/api/tags/popular"],
    queryFn: () => fetch("/api/tags/popular").then(r => r.json()),
    staleTime: 300000,
  });
  
  const form = useForm<InsertListing>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "physical",
      totalSlots: 2,
      imageUrl: "",
      location: "",
      latitude: "",
      longitude: "",
      country: "",
      language: "",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (!saved) return;
      const draft = JSON.parse(saved);
      if (draft.title) form.setValue("title", draft.title);
      if (draft.description) form.setValue("description", draft.description);
      if (draft.totalSlots) form.setValue("totalSlots", draft.totalSlots);
      if (draft.location) form.setValue("location", draft.location);
      if (draft.category) form.setValue("category", draft.category);
      if (draft.pricePerSlotDollars) setPricePerSlotDollars(draft.pricePerSlotDollars);
      if (draft.marketPriceDollars) setMarketPriceDollars(draft.marketPriceDollars);
      if (draft.distributionType) setDistributionType(draft.distributionType);
      if (draft.distributionDetails) setDistributionDetails(draft.distributionDetails);
      if (draft.tags) setTags(draft.tags);
    } catch {}
  }, []);

  // Auto-save draft to localStorage
  const formValues = form.watch();
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        const hasContent = formValues.title || formValues.description;
        if (!hasContent) return;
        localStorage.setItem(draftKey, JSON.stringify({
          title: formValues.title,
          description: formValues.description,
          totalSlots: formValues.totalSlots,
          location: formValues.location,
          category: formValues.category,
          pricePerSlotDollars,
          marketPriceDollars,
          distributionType,
          distributionDetails,
          tags,
        }));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2500);
      } catch {}
    }, 1500);
    return () => clearTimeout(timeout);
  }, [formValues.title, formValues.description, formValues.totalSlots, formValues.location, formValues.category, pricePerSlotDollars, marketPriceDollars, distributionType, distributionDetails, tags]);

  const handleGenerateDescription = useCallback(async () => {
    const title = form.getValues("title");
    const category = form.getValues("category");
    if (!title) {
      toast({ title: t("common.error"), description: "Please enter a title first", variant: "destructive" });
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `Write a compelling 2-3 sentence group-buy listing description for: "${title}" (category: ${category}). Focus on what members get, why it's a good deal, and what they need to know to join. Be concise and enthusiastic.`,
        }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      form.setValue("description", data.answer);
    } catch {
      toast({ title: "AI unavailable", description: "Could not generate description. Please write one manually.", variant: "destructive" });
    } finally {
      setIsGeneratingDesc(false);
    }
  }, [form, toast, t]);

  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ title: t("common.error"), description: t("create.geolocationNotSupported"), variant: "destructive" });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("latitude", position.coords.latitude.toString());
        form.setValue("longitude", position.coords.longitude.toString());
        setIsLocating(false);
        toast({ title: t("create.locationSet"), description: t("create.coordinatesAdded") });
      },
      (err) => {
        setIsLocating(false);
        toast({ title: t("common.error"), description: err.message || t("create.locationError"), variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [form, toast]);

  const uploadSingleFile = useCallback(async (file: File): Promise<UploadedImage | null> => {
    if (!file.type.startsWith("image/")) {
      toast({ title: t("common.error"), description: t("create.selectImage"), variant: "destructive" });
      return null;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: t("common.error"), description: t("create.imageTooLarge"), variant: "destructive" });
      return null;
    }

    const response = await fetch("/api/uploads/request-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
    });
    if (!response.ok) throw new Error("Failed to get upload URL");
    const { uploadURL, objectPath } = await response.json();

    const uploadResponse = await fetch(uploadURL, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!uploadResponse.ok) throw new Error("Failed to upload image");

    return { url: objectPath, preview: URL.createObjectURL(file) };
  }, [toast]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - uploadedImages.length;
    if (remaining <= 0) {
      toast({ title: t("create.limitReached"), description: t("create.maxImages", { max: MAX_IMAGES }), variant: "destructive" });
      return;
    }

    const filesToUpload = files.slice(0, remaining);
    setIsUploading(true);

    try {
      const results: UploadedImage[] = [];
      for (const file of filesToUpload) {
        const result = await uploadSingleFile(file);
        if (result) results.push(result);
      }

      if (results.length > 0) {
        const newImages = [...uploadedImages, ...results];
        setUploadedImages(newImages);
        if (!form.getValues("imageUrl") || form.getValues("imageUrl") === "") {
          form.setValue("imageUrl", newImages[0].url);
        }
        toast({ title: t("create.imagesUploaded"), description: t("create.imagesUploadedCount", { count: results.length }) });
      }
    } catch (err) {
      toast({ title: t("create.uploadFailed"), description: t("create.uploadFailedDesc"), variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [form, toast, uploadedImages, uploadSingleFile]);

  const removeImage = useCallback((index: number) => {
    setUploadedImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0) {
        form.setValue("imageUrl", updated[0].url);
      } else {
        form.setValue("imageUrl", "");
      }
      return updated;
    });
  }, [form]);

  const addTag = (tag: string) => {
    const normalized = tag.trim().toLowerCase();
    if (normalized && !tags.includes(normalized) && tags.length < 10) {
      setTags([...tags, normalized]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const onSubmit = (data: InsertListing) => {
    // Hard guard — backend will also reject, but stop here for cleaner UX
    if (currentUser && (!currentUser.phoneVerified || !currentUser.onboardingComplete)) return;
    const additionalImages = uploadedImages.slice(1).map(img => img.url);
    const pricePerSlot = pricePerSlotDollars ? Math.round(parseFloat(pricePerSlotDollars) * 100) : null;
    const marketPrice = marketPriceDollars ? Math.round(parseFloat(marketPriceDollars) * 100) : null;
    createListing.mutate({ ...data, additionalImages, tags, pricePerSlot, marketPrice, distributionType, distributionDetails } as any, {
      onSuccess: () => {
        try { localStorage.removeItem(draftKey); } catch {}
        setLocation("/");
      }
    });
  };

  const needsVerification = currentUser && (!currentUser.phoneVerified || !currentUser.onboardingComplete);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold font-display">{t("create.title")}</h1>
            {draftSaved && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in duration-300" data-testid="text-draft-saved">
                <CheckCheck className="w-3.5 h-3.5" /> Draft saved
              </span>
            )}
          </div>
          <p className="text-muted-foreground">{t("create.subtitle")}</p>
        </div>

        {needsVerification && (
          <div
            className="mb-6 flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-2xl"
            data-testid="banner-verification-required"
          >
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-900 dark:text-amber-100 text-sm">
                {t("create.verificationRequired", "Verification required before creating a listing")}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                {!currentUser.phoneVerified && !currentUser.onboardingComplete
                  ? t("create.verificationRequiredBothDesc", "You need to complete your profile and verify your phone number first.")
                  : !currentUser.phoneVerified
                  ? t("create.verificationRequiredPhoneDesc", "You need to verify your phone number before you can create a listing.")
                  : t("create.verificationRequiredOnboardingDesc", "You need to complete your profile setup before you can create a listing.")}
              </p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => setLocation("/profile")}
                data-testid="button-go-to-profile"
              >
                {t("create.goToProfile", "Complete profile")}
              </Button>
            </div>
          </div>
        )}

        <div className={`bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/50 ${needsVerification ? "opacity-50 pointer-events-none select-none" : ""}`}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Deal Templates */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold">Start from a template</p>
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {DEAL_TEMPLATES.map((tpl) => {
                    const Icon = tpl.icon;
                    const isSelected = selectedTemplateId === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        data-testid={`button-template-${tpl.id}`}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all hover:scale-105 ${isSelected ? `${tpl.bg} border-current ring-2 ring-primary/30` : "border-border/50 bg-muted/30 hover:bg-muted/60"}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? tpl.bg : "bg-muted"}`}>
                          <Icon className={`w-4 h-4 ${isSelected ? tpl.color : "text-muted-foreground"}`} />
                        </div>
                        <span className={`text-[11px] font-medium leading-tight ${isSelected ? tpl.color : "text-muted-foreground"}`}>{tpl.label}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedTemplateId && (
                  <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                    <CheckCheck className="w-3 h-3 text-emerald-500" />
                    Template applied — fill in the details marked with [brackets]
                  </p>
                )}
              </div>

              <SectionDivider step={1} icon={FileText} title={t("create.sectionAbout")} desc={t("create.sectionAboutDesc")} />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("create.titleField")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("create.titlePlaceholder")} className="bg-muted/50" data-testid="input-title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("create.category")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/50" data-testid="select-category">
                            <SelectValue placeholder={t("create.selectCategory")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="physical" data-testid="select-category-physical">{t("create.physicalItem")}</SelectItem>
                          <SelectItem value="digital" data-testid="select-category-digital">{t("create.digitalProduct")}</SelectItem>
                          <SelectItem value="offer" data-testid="select-category-offer">{t("create.specialOffer")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalSlots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("create.totalSlots")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={2} 
                          className="bg-muted/50" 
                          data-testid="input-total-slots"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => {
                    const formatDate = (d: Date | string | undefined) => {
                      if (!d) return '';
                      try {
                        const date = d instanceof Date ? d : new Date(d);
                        if (isNaN(date.getTime())) return '';
                        return date.toISOString().split('T')[0];
                      } catch {
                        return '';
                      }
                    };
                    return (
                      <FormItem>
                        <FormLabel>{t("listing.expiresIn")}</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="bg-muted/50" 
                            data-testid="input-expires-at"
                            value={formatDate(field.value)}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) {
                                field.onChange(new Date(val + 'T00:00:00'));
                              }
                            }}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>{t("create.description")}</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 text-primary"
                        onClick={handleGenerateDescription}
                        disabled={isGeneratingDesc}
                        data-testid="button-ai-generate-description"
                      >
                        {isGeneratingDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        {isGeneratingDesc ? "Generating..." : "Generate with AI"}
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea 
                        placeholder={t("create.descriptionPlaceholder")} 
                        className="bg-muted/50 min-h-[120px]" 
                        data-testid="input-description"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SectionDivider step={2} icon={Tag} title={t("create.sectionDetails")} desc={t("create.sectionDetailsDesc")} />

              <div className="space-y-3">
                <FormLabel className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {t("create.tagsLabel")}
                </FormLabel>
                <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-md border border-border/50 min-h-[42px]">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs" data-testid={`tag-chip-${tag}`}>
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 rounded-full"
                        data-testid={`button-remove-tag-${tag}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {tags.length < 10 && (
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
                      placeholder={tags.length === 0 ? t("create.tagPlaceholder") : t("create.tagPlaceholderMore")}
                      className="flex-1 min-w-[120px] border-0 bg-transparent shadow-none focus-visible:ring-0 p-0 h-auto"
                      data-testid="input-tag"
                    />
                  )}
                </div>
                {popularTags && popularTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">{t("create.popularTags")}</span>
                    {popularTags.slice(0, 8).map((pt) => (
                      <button
                        key={pt.tag}
                        type="button"
                        onClick={() => addTag(pt.tag)}
                        disabled={tags.includes(pt.tag)}
                        className="text-xs px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground hover-elevate disabled:opacity-40 transition-colors"
                        data-testid={`button-popular-tag-${pt.tag}`}
                      >
                        {pt.tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <SectionDivider step={3} icon={Globe} title={t("create.sectionLocation")} desc={t("create.sectionLocationDesc")} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("create.country")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/50" data-testid="select-country">
                            <SelectValue placeholder={t("create.selectCountry")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("create.language")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/50" data-testid="select-language">
                            <SelectValue placeholder={t("create.selectLanguage")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LANGUAGES.map((l) => (
                            <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Price fields (P5) */}
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  Pricing <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                </FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Group price per slot ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="bg-muted/50 pl-7"
                        value={pricePerSlotDollars}
                        onChange={(e) => setPricePerSlotDollars(e.target.value)}
                        data-testid="input-price-per-slot"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Market price (retail $)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="bg-muted/50 pl-7"
                        value={marketPriceDollars}
                        onChange={(e) => setMarketPriceDollars(e.target.value)}
                        data-testid="input-market-price"
                      />
                    </div>
                  </div>
                </div>
                {pricePerSlotDollars && marketPriceDollars && parseFloat(pricePerSlotDollars) > 0 && parseFloat(marketPriceDollars) > parseFloat(pricePerSlotDollars) && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Members save {Math.round((1 - parseFloat(pricePerSlotDollars) / parseFloat(marketPriceDollars)) * 100)}% vs. retail
                  </p>
                )}
              </div>

              {/* Distribution Method */}
              <div className="space-y-3">
                <FormLabel className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  Distribution Method <span className="text-rose-500">*</span>
                </FormLabel>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { value: "pickup", label: "Pickup", icon: MapPin, desc: "Members pick up in person" },
                    { value: "delivery", label: "Delivery", icon: Truck, desc: "Organiser ships to members" },
                    { value: "digital", label: "Digital", icon: Monitor, desc: "Download or access code" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDistributionType(opt.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${distributionType === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                      data-testid={`button-distribution-${opt.value}`}
                    >
                      <opt.icon className={`w-4 h-4 mb-1.5 ${distributionType === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                      <div className={`text-sm font-semibold ${distributionType === opt.value ? "text-primary" : ""}`}>{opt.label}</div>
                      <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-muted-foreground">
                    {distributionType === "pickup" ? "Pickup location and time (required)" : distributionType === "delivery" ? "Delivery notes (shipping method, timeline)" : "Access instructions (download link, code, etc.)"}
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm min-h-[72px] resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder={distributionType === "pickup" ? "e.g. Collection at 123 Main St, Saturday 10am–2pm" : distributionType === "delivery" ? "e.g. Will ship via Royal Mail within 3 days of group fill" : "e.g. Digital download link will be emailed to all members"}
                    value={distributionDetails}
                    onChange={(e) => setDistributionDetails(e.target.value)}
                    data-testid="input-distribution-details"
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("create.location")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("create.locationPlaceholder")} className="bg-muted/50" data-testid="input-location" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>{t("create.locationDescription")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>{t("create.gpsCoordinates")}</FormLabel>
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    data-testid="button-get-location"
                  >
                    {isLocating ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("create.gettingLocation")}</>
                    ) : (
                      <><MapPin className="w-4 h-4 mr-2" /> {t("create.useMyLocation")}</>
                    )}
                  </Button>
                  {form.watch("latitude") && (
                    <span className="text-sm text-muted-foreground" data-testid="text-coordinates">
                      {parseFloat(form.watch("latitude") || "0").toFixed(4)}, {parseFloat(form.watch("longitude") || "0").toFixed(4)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground" data-testid="text-gps-help">{t("create.gpsHelp")}</p>
              </div>

              <SectionDivider step={4} icon={ImageIcon} title={t("create.sectionPhotos")} desc={t("create.sectionPhotosDesc", { max: MAX_IMAGES })} />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>{t("create.additionalImages", { max: MAX_IMAGES })}</FormLabel>
                  <span className="text-xs text-muted-foreground" data-testid="text-image-count">
                    {uploadedImages.length}/{MAX_IMAGES}
                  </span>
                </div>
                
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative group aspect-[4/3] rounded-lg overflow-visible border border-border">
                        <img 
                          src={img.preview} 
                          alt={`Upload ${index + 1}`} 
                          className="w-full h-full object-cover rounded-lg"
                          data-testid={`img-preview-${index}`}
                        />
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            {t("create.cover")}
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ visibility: "visible" }}
                          onClick={() => removeImage(index)}
                          data-testid={`button-remove-image-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    {uploadedImages.length < MAX_IMAGES && (
                      <div 
                        className="aspect-[4/3] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover-elevate transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="upload-add-more"
                      >
                        <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">{t("create.tagPlaceholderMore")}</span>
                      </div>
                    )}
                  </div>
                )}

                {uploadedImages.length === 0 && (
                  <div className="flex flex-col gap-3">
                    <div 
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover-elevate transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="upload-dropzone"
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{t("common.loading")}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm font-medium">{t("create.clickToBrowse")}</span>
                          <span className="text-xs text-muted-foreground">{t("create.imageSize")} &middot; {t("create.additionalImages", { max: MAX_IMAGES })}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">{t("create.orPasteUrl")}</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="https://..." 
                                className="bg-muted/50" 
                                data-testid="input-image-url" 
                                {...field} 
                                value={field.value || ""} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  data-testid="input-file-upload"
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={createListing.isPending}
                  className="w-full font-semibold shadow-lg shadow-primary/25"
                  data-testid="button-create-listing"
                >
                  {createListing.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("create.creating")}</>
                  ) : (
                    t("create.createButton")
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
