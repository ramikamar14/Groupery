import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Calendar, User as UserIcon, Store, CheckCircle, Clock, XCircle, Settings, Loader2, Edit, Camera, Shield, Star, Award, Trophy, TrendingUp, Upload, Image, MapPin, Gift, Copy, Users, Zap, Phone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Link } from "wouter";
import type { Listing } from "@shared/schema";
import { RankBadge, computeRank } from "@/components/RankBadge";
import { CountrySelect } from "@/components/CountrySelect";
import { ProfileContactInfo } from "@/components/profile/ProfileContactInfo";
import { ProfileListingsSection } from "@/components/profile/ProfileListingsSection";
import { ProfileReviewsSection } from "@/components/profile/ProfileReviewsSection";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editLanguage, setEditLanguage] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [idDocumentUrl, setIdDocumentUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const idFileRef = useRef<HTMLInputElement>(null);
  const selfieFileRef = useRef<HTMLInputElement>(null);

  const { data: myListings = [], isLoading: loadingListings } = useQuery<Listing[]>({
    queryKey: ["/api/user/listings"],
    enabled: !!user,
  });

  const { data: reliability } = useQuery<{ score: number; badges: string[]; stats: { completedGroups: number; avgRating: number; reportsReceived: number; cancelledParticipations: number; completedListingsCreated: number } }>({
    queryKey: ["/api/users", user?.id, "reliability"],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await fetch(`/api/users/${user.id}/reliability`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user,
  });

  const { data: reviews = [], isLoading: loadingReviews } = useQuery<any[]>({
    queryKey: ["/api/users", user?.id, "reviews"],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/users/${user.id}/reviews`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const { data: referralStats } = useQuery<{ totalReferrals: number; rewardedReferrals: number; referredUsers: any[] }>({
    queryKey: ["/api/referrals/stats"],
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  if (!user) return null;

  const openEditDialog = () => {
    setEditFirstName(user.firstName || "");
    setEditLastName(user.lastName || "");
    setEditCountry(user.country || "");
    setEditLanguage(user.language || "");
    setEditCity((user as any).city || "");
    setEditBio((user as any).bio || "");
    setEditPhone((user as any).phone || "");
    setOtpSent(false);
    setOtpCode("");
    setIsEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    await updateProfileMutation.mutateAsync({
      firstName: editFirstName,
      lastName: editLastName,
      country: editCountry,
      language: editLanguage,
      city: editCity,
      bio: editBio,
    });
    setIsEditDialogOpen(false);
    toast({ title: t("profile.profileUpdated"), description: t("profile.changesSaved") });
  };

  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await fetch("/api/user/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      return res.json();
    },
    onSuccess: () => {
      setOtpSent(true);
      toast({ title: t("profile.otpSent"), description: t("profile.otpSentDesc") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("profile.otpSendFailed"), variant: "destructive" });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, otp }: { phone: string; otp: string }) => {
      const res = await fetch("/api/user/phone/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, otp }),
      });
      if (!res.ok) throw new Error("Invalid OTP");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsPhoneDialogOpen(false);
      setOtpSent(false);
      setOtpCode("");
      toast({ title: t("profile.phoneVerified"), description: t("profile.phoneVerifiedDesc") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("profile.otpInvalid"), variant: "destructive" });
    },
  });

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: t("common.error"), description: t("upload.imageTooLarge"), variant: "destructive" });
      return;
    }

    setUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();
      
      await updateProfileMutation.mutateAsync({ profileImageUrl: url });
      toast({ title: t("profile.pictureUpdated"), description: t("profile.pictureChanged") });
    } catch (error) {
      toast({ title: t("upload.uploadFailed"), description: t("upload.uploadFailedDesc"), variant: "destructive" });
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleVerifFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "id" | "selfie"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: t("common.error"), description: t("upload.imageTooLarge"), variant: "destructive" });
      return;
    }
    if (type === "id") setUploadingId(true);
    else setUploadingSelfie(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      if (type === "id") setIdDocumentUrl(url);
      else setSelfieUrl(url);
      toast({ title: "Uploaded", description: `${type === "id" ? "ID document" : "Selfie"} uploaded successfully` });
    } catch {
      toast({ title: t("upload.uploadFailed"), description: t("upload.uploadFailedDesc"), variant: "destructive" });
    } finally {
      if (type === "id") setUploadingId(false);
      else setUploadingSelfie(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!idDocumentUrl || !selfieUrl) {
      toast({ title: t("common.error"), description: t("profile.provideDocuments"), variant: "destructive" });
      return;
    }
    
    await updateProfileMutation.mutateAsync({
      idDocumentUrl,
      selfieUrl,
      verificationStatus: "pending",
    });
    setIsVerifyDialogOpen(false);
    toast({ title: t("profile.submitted"), description: t("profile.documentsSubmitted") });
  };

  const getVerificationBadge = () => {
    switch (user.verificationStatus) {
      case "verified":
        return (
          <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t("profile.verified")}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50">
            <Clock className="w-3 h-3 mr-1" />
            {t("profile.pending")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
            <XCircle className="w-3 h-3 mr-1" />
            {t("profile.rejected")}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-muted">
            {t("profile.notVerified")}
          </Badge>
        );
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold">{t("profile.title")}</h1>
          <div className="flex gap-2">
            {user.isAdmin && (
              <Link href="/admin">
                <Button variant="outline" size="sm" data-testid="link-admin">
                  <Settings className="w-4 h-4 mr-2" />
                  {t("nav.admin")}
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={openEditDialog} data-testid="button-edit-profile">
              <Edit className="w-4 h-4 mr-2" />
              {t("common.edit")}
            </Button>
          </div>
        </div>

        {/* Verification call-to-action banner */}
        {user.verificationStatus !== "verified" && user.verificationStatus !== "pending" && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 p-5 flex gap-4 items-start">
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-0.5">{t("profile.verifyIdentityTitle")}</h3>
              <p className="text-sm text-amber-800/80 dark:text-amber-200/70 mb-3 leading-relaxed">
                {t("profile.verifyIdentityDesc")}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600 gap-1.5"
                  onClick={() => setIsVerifyDialogOpen(true)}
                  data-testid="button-verify-banner"
                >
                  <Shield className="w-3.5 h-3.5" />
                  {t("profile.getVerifiedNow")}
                </Button>
                <div className="flex items-center gap-3 text-xs text-amber-700/70 dark:text-amber-300/70">
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {t("profile.takes2min")}</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {t("profile.secureUpload")}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {user.verificationStatus === "pending" && (
          <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/30 p-4 flex gap-3 items-center">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">{t("profile.verificationUnderReview")}</p>
              <p className="text-xs text-blue-700/70 dark:text-blue-300/70">{t("profile.verificationUnderReviewDesc")}</p>
            </div>
          </div>
        )}

        <Card className="border-border/50 shadow-lg overflow-hidden">
          <div className="h-36 bg-gradient-to-r from-primary/30 via-primary/10 to-accent/25 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
          </div>
          <div className="px-6 sm:px-8 pb-8">
            <div className="relative -mt-16 mb-6 w-fit">
              <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-card shadow-xl ring-2 ring-accent/30">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="text-4xl bg-muted text-muted-foreground">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleProfilePictureChange}
              />
              <Button 
                size="icon" 
                variant="secondary"
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full shadow-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPicture}
                data-testid="button-change-picture"
              >
                {uploadingPicture ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </Button>
            </div>

            <div className="space-y-1 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold font-display">
                  {user.firstName} {user.lastName}
                </h2>
                <RankBadge rank={computeRank(user as any)} size="md" />
              </div>
              <p className="text-muted-foreground">@{user.email?.split('@')[0]}</p>
              {(user as any).rating > 0 && (
                <div className="flex items-center gap-2 mt-2" data-testid="rating-profile">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < ((user as any).rating || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {(user as any).rating}/5 ({(user as any).ratingCount || 0} {(user as any).ratingCount === 1 ? t("profile.review") : t("profile.reviews")})
                  </span>
                </div>
              )}
            </div>

            {reliability && (
              <div className="flex flex-wrap gap-2 mb-4" data-testid="trust-badges-profile">
                {reliability.badges.includes("verified") && (
                  <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-950/50">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {t("profile.verified")}
                  </Badge>
                )}
                {reliability.badges.includes("trusted") && (
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950/50">
                    <Award className="w-3 h-3 mr-1" />
                    {t("profile.trustedMember")}
                  </Badge>
                )}
                {reliability.badges.includes("top_organizer") && (
                  <Badge variant="outline" className="border-teal-200 text-teal-700 bg-teal-50 dark:border-teal-700 dark:text-teal-300 dark:bg-teal-950/50">
                    <Trophy className="w-3 h-3 mr-1" />
                    {t("profile.topOrganizer")}
                  </Badge>
                )}
              </div>
            )}

            {reliability && (
              <div className="mb-4" data-testid="text-reliability-score">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-accent" />
                    {t("profile.reliabilityScoreTitle")}
                  </span>
                  <span className="text-sm font-bold text-accent">{reliability.score}/100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(0, reliability.score))}%` }}
                  />
                </div>
              </div>
            )}

            {reliability?.stats && (
              <div className="grid grid-cols-3 gap-3 mb-4" data-testid="profile-trust-stats">
                <div className="flex flex-col items-center p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
                  <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300" data-testid="stat-completed-deals">{reliability.stats.completedListingsCreated ?? reliability.stats.completedGroups ?? 0}</span>
                  <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 leading-tight">{t("profile.completedDeals", "Completed deals")}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-secondary/50 border border-border rounded-xl text-center">
                  <TrendingUp className="w-4 h-4 text-muted-foreground mb-1" />
                  <span className="text-lg font-bold" data-testid="stat-avg-rating">{(reliability.stats.avgRating ?? 0).toFixed(1)}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{t("profile.avgRating", "Avg rating")}</span>
                </div>
                <div className={`flex flex-col items-center p-3 border rounded-xl text-center ${(reliability.stats.cancelledParticipations ?? 0) > 2 ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" : "bg-secondary/50 border-border"}`}>
                  <XCircle className={`w-4 h-4 mb-1 ${(reliability.stats.cancelledParticipations ?? 0) > 2 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`} />
                  <span className={`text-lg font-bold ${(reliability.stats.cancelledParticipations ?? 0) > 2 ? "text-amber-800 dark:text-amber-300" : ""}`} data-testid="stat-cancelled">{reliability.stats.cancelledParticipations ?? 0}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{t("profile.cancellations", "Cancellations")}</span>
                </div>
              </div>
            )}

            {/* Invite & Earn referral card */}
            <div className="mb-4 p-4 bg-gradient-to-br from-teal-50 to-[#E0F7FA] dark:from-teal-950/20 dark:to-[#001F3F]/20 rounded-2xl border border-teal-200/60 dark:border-teal-800/40" data-testid="card-invite-earn">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-0.5">{t("profile.inviteEarn", "Invite & Grow")}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{t("profile.inviteEarnDesc", "Share your link and grow the community.")}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {referralStats && (
                      <span className="inline-flex items-center gap-1 text-xs bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full">
                        <Users className="w-3 h-3" />
                        {referralStats.totalReferrals} {t("profile.referred", "referred")}
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/30 px-2.5"
                      onClick={() => {
                        const link = `${window.location.origin}?ref=${(user as any).id}`;
                        navigator.clipboard.writeText(link).then(() => {
                          toast({ title: t("profile.linkCopied", "Referral link copied!") });
                        });
                      }}
                      data-testid="button-copy-referral-link"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      {t("profile.copyReferral", "Copy link")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {(user as any).bio && (
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{(user as any).bio}</p>
            )}

            <div className="grid gap-4">
              <ProfileContactInfo
                email={user.email || ""}
                phone={(user as any).phone}
                phoneVerified={!!(user as any).phoneVerified}
                country={user.country || ""}
                languageCode={user.language || "en"}
                onVerifyPhone={() => {
                  setEditPhone((user as any).phone || "");
                  setIsPhoneDialogOpen(true);
                }}
                onAddPhone={() => setIsPhoneDialogOpen(true)}
              />

              {(user as any).city && (
                <div className="flex items-center text-sm p-3 bg-secondary/50 rounded-xl">
                  <MapPin className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span>{(user as any).city}{user.country ? `, ${user.country}` : ""}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm p-3 bg-secondary/50 rounded-xl">
                <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
                <span>{t("profile.joined", { date: user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : t("profile.recently") })}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm p-3 bg-secondary/50 rounded-xl">
                <div className="flex items-center">
                  {user.userType === "vendor" ? (
                    <Store className="w-4 h-4 mr-3 text-muted-foreground" />
                  ) : (
                    <UserIcon className="w-4 h-4 mr-3 text-muted-foreground" />
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="capitalize">
                      {user.userType === "vendor" ? t("profile.vendor") : t("profile.individual")}
                    </Badge>
                    {getVerificationBadge()}
                  </div>
                </div>
                {(!user.verificationStatus || user.verificationStatus === "rejected") && (
                  <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-primary" data-testid="button-get-verified">
                        <Shield className="w-4 h-4 mr-1" />
                        {t("profile.getVerified")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t("profile.identityVerification")}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <p className="text-sm text-muted-foreground">
                          {t("profile.verificationDesc")}
                        </p>
                        {/* Hidden file inputs */}
                        <input
                          ref={idFileRef}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleVerifFileUpload(e, "id")}
                          data-testid="input-id-document"
                        />
                        <input
                          ref={selfieFileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleVerifFileUpload(e, "selfie")}
                          data-testid="input-selfie"
                        />

                        <div className="space-y-2">
                          <Label>{t("profile.idDocument")}</Label>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={() => idFileRef.current?.click()}
                            disabled={uploadingId}
                            data-testid="button-upload-id"
                          >
                            {uploadingId ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> {t("common.uploading")}</>
                            ) : idDocumentUrl ? (
                              <><CheckCircle className="w-4 h-4 text-green-500" /> {t("profile.idUploaded")}</>
                            ) : (
                              <><Upload className="w-4 h-4" /> {t("profile.uploadId")}</>
                            )}
                          </Button>
                          {idDocumentUrl && (
                            <p className="text-xs text-muted-foreground truncate">{idDocumentUrl}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>{t("profile.selfieUrl")}</Label>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={() => selfieFileRef.current?.click()}
                            disabled={uploadingSelfie}
                            data-testid="button-upload-selfie"
                          >
                            {uploadingSelfie ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> {t("common.uploading")}</>
                            ) : selfieUrl ? (
                              <><CheckCircle className="w-4 h-4 text-green-500" /> {t("profile.selfieUploaded")}</>
                            ) : (
                              <><Image className="w-4 h-4" /> {t("profile.uploadSelfie")}</>
                            )}
                          </Button>
                          {selfieUrl && (
                            <p className="text-xs text-muted-foreground truncate">{selfieUrl}</p>
                          )}
                        </div>
                        <Button 
                          className="w-full"
                          onClick={handleSubmitVerification}
                          disabled={updateProfileMutation.isPending}
                          data-testid="button-submit-verification"
                        >
                          {updateProfileMutation.isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("common.loading")}</>
                          ) : (
                            t("profile.submitVerification")
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          {t("profile.reviewTime")}
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>
        </Card>

        <ProfileListingsSection listings={myListings} loading={loadingListings} />
        <ProfileReviewsSection
          reviews={reviews}
          loading={loadingReviews}
          avgRating={(user as any).rating ?? 0}
        />
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("profile.editProfile")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t("profile.firstName")}</Label>
                <Input 
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("profile.lastName")}</Label>
                <Input 
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  data-testid="input-last-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("profile.country")}</Label>
              <CountrySelect
                value={editCountry}
                onValueChange={setEditCountry}
                data-testid="select-country"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("profile.city")}</Label>
              <Input
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                placeholder={t("profile.cityPlaceholder")}
                data-testid="input-city"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("profile.language")}</Label>
              <Select value={editLanguage} onValueChange={setEditLanguage}>
                <SelectTrigger data-testid="select-language">
                  <SelectValue placeholder={t("create.selectLanguage")} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {[
                    { value: "en", label: "English" }, { value: "ar", label: "العربية" },
                    { value: "fr", label: "Français" }, { value: "es", label: "Español" },
                    { value: "de", label: "Deutsch" }, { value: "it", label: "Italiano" },
                    { value: "pt", label: "Português" }, { value: "zh", label: "中文" },
                    { value: "ja", label: "日本語" }, { value: "ko", label: "한국어" },
                    { value: "hi", label: "हिन्दी" }, { value: "tr", label: "Türkçe" },
                    { value: "ru", label: "Русский" }, { value: "nl", label: "Nederlands" },
                    { value: "pl", label: "Polski" }, { value: "OTHER", label: "Other" },
                  ].map(l => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("profile.bio")}</Label>
              <Textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder={t("profile.bioPlaceholder")}
                className="resize-none"
                rows={3}
                data-testid="input-bio"
              />
            </div>
            <Button 
              className="w-full"
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("common.loading")}</>
              ) : (
                t("profile.saveChanges")
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phone Verification Dialog */}
      <Dialog open={isPhoneDialogOpen} onOpenChange={(open) => { setIsPhoneDialogOpen(open); if (!open) { setOtpSent(false); setOtpCode(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> {t("profile.verifyPhone")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {!otpSent ? (
              <>
                <p className="text-sm text-muted-foreground">{t("profile.verifyPhoneDesc")}</p>
                <div className="space-y-2">
                  <Label>{t("profile.phoneNumber")}</Label>
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    data-testid="input-phone-verify"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => sendOtpMutation.mutate(editPhone)}
                  disabled={!editPhone.trim() || sendOtpMutation.isPending}
                  data-testid="button-send-otp"
                >
                  {sendOtpMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("common.loading")}</> : t("profile.sendOtp")}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">{t("profile.enterOtpDesc", { phone: editPhone })}</p>
                <div className="space-y-2">
                  <Label>{t("profile.otpCode")}</Label>
                  <Input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    data-testid="input-otp-code"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setOtpSent(false); setOtpCode(""); }}
                    data-testid="button-otp-back"
                  >
                    {t("common.back")}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => verifyOtpMutation.mutate({ phone: editPhone, otp: otpCode })}
                    disabled={!otpCode.trim() || verifyOtpMutation.isPending}
                    data-testid="button-verify-otp"
                  >
                    {verifyOtpMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("common.loading")}</> : t("profile.verifyOtp")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
