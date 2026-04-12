import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { User, Store, Upload, Loader2, CheckCircle, Globe, Phone, Mail, Shield, ChevronLeft, MapPin } from "lucide-react";
import { CountrySelect } from "@/components/CountrySelect";
import { cn } from "@/lib/utils";

type UserType = "individual" | "vendor";
type Step = "personal-info" | "type" | "verification" | "vendor-details" | "complete";

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

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [step, setStep] = useState<Step>("personal-info");
  const [userType, setUserType] = useState<UserType | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Personal info (email comes from OIDC, prefilled and read-only)
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    country: "",
    language: "",
  });
  
  // Verification
  const [idDocumentUrl, setIdDocumentUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [idDocumentName, setIdDocumentName] = useState("");
  const [selfieName, setSelfieName] = useState("");
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);
  
  // Vendor details
  const [vendorDetails, setVendorDetails] = useState({
    businessName: "",
    businessLicenseUrl: "",
    storeAddress: "",
    contactPhone: "",
    description: "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  const handlePersonalInfoSubmit = async () => {
    if (!personalInfo.firstName || !personalInfo.lastName) {
      toast({ title: "Required", description: "Please enter your first and last name.", variant: "destructive" });
      return;
    }
    if (!personalInfo.country) {
      toast({ title: "Required", description: "Please select your country.", variant: "destructive" });
      return;
    }
    if (!personalInfo.language) {
      toast({ title: "Required", description: "Please select your preferred language.", variant: "destructive" });
      return;
    }
    if (!agreedToTerms) {
      toast({ title: "Agreement required", description: "Please agree to our Terms & Conditions and Privacy Policy to continue.", variant: "destructive" });
      return;
    }
    
    await updateProfileMutation.mutateAsync({
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      phone: personalInfo.phone || undefined,
      country: personalInfo.country,
      language: personalInfo.language,
    });
    
    setStep("type");
  };

  const handleTypeSelection = async (type: UserType) => {
    setUserType(type);
    await updateProfileMutation.mutateAsync({ userType: type });
    setStep("verification");
  };

  const uploadVerificationFile = async (file: File, type: "id" | "selfie") => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Invalid file", description: "Please upload an image (JPG, PNG, WEBP) or PDF.", variant: "destructive" });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 15MB.", variant: "destructive" });
      return;
    }

    if (type === "id") setIsUploadingId(true);
    else setIsUploadingSelfie(true);

    try {
      const res = await fetch("/api/uploads/request-url", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await res.json();

      const uploadRes = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!uploadRes.ok) throw new Error("Upload failed");

      if (type === "id") { setIdDocumentUrl(objectPath); setIdDocumentName(file.name); }
      else { setSelfieUrl(objectPath); setSelfieName(file.name); }
      toast({ title: "Uploaded", description: `${type === "id" ? "ID document" : "Selfie"} uploaded successfully.` });
    } catch {
      toast({ title: "Upload failed", description: "Could not upload file. Please try again.", variant: "destructive" });
    } finally {
      if (type === "id") setIsUploadingId(false);
      else setIsUploadingSelfie(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (!idDocumentUrl || !selfieUrl) {
      toast({ title: "Required", description: "Please upload both ID document and selfie.", variant: "destructive" });
      return;
    }
    
    await updateProfileMutation.mutateAsync({ 
      idDocumentUrl, 
      selfieUrl,
      verificationStatus: "pending"
    });
    
    if (userType === "vendor") {
      setStep("vendor-details");
    } else {
      setStep("complete");
    }
  };

  const handleSkipVerification = async () => {
    if (userType === "vendor") {
      setStep("vendor-details");
    } else {
      setStep("complete");
    }
  };

  const handleVendorDetailsSubmit = async () => {
    if (!vendorDetails.businessName) {
      toast({ title: "Required", description: "Business name is required.", variant: "destructive" });
      return;
    }
    
    await fetch("/api/user/vendor-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendorDetails),
      credentials: "include",
    });
    
    setStep("complete");
  };

  const handleComplete = async () => {
    await updateProfileMutation.mutateAsync({ onboardingComplete: true });
    toast({ title: "Welcome!", description: "Your account setup is complete. Start exploring group deals!" });
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Step 1: Personal Information */}
        {step === "personal-info" && (
          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">Welcome to Grouperry</CardTitle>
              <CardDescription>Let's set up your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input 
                    placeholder="John" 
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input 
                    placeholder="Doe" 
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </Label>
                <Input 
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                  data-testid="input-email"
                />
                <p className="text-xs text-muted-foreground">Email is linked to your login account</p>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone Number
                </Label>
                <Input 
                  type="tel"
                  placeholder="+1 234 567 8900" 
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  data-testid="input-phone"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Country *
                </Label>
                <CountrySelect
                  value={personalInfo.country}
                  onValueChange={(v: string) => setPersonalInfo({ ...personalInfo, country: v })}
                  data-testid="select-country"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Preferred Language *</Label>
                <Select 
                  value={personalInfo.language} 
                  onValueChange={(v) => setPersonalInfo({ ...personalInfo, language: v })}
                >
                  <SelectTrigger data-testid="select-language">
                    <SelectValue placeholder={t("create.selectLanguage")} />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <label className="flex items-start gap-3 cursor-pointer group" data-testid="checkbox-terms-agreement">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 accent-primary shrink-0 cursor-pointer"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  data-testid="input-terms-checkbox"
                />
                <span className="text-sm text-muted-foreground leading-snug">
                  I agree to Grouperry's{" "}
                  <a href="/terms" target="_blank" className="text-primary hover:underline font-medium">Terms & Conditions</a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank" className="text-primary hover:underline font-medium">Privacy Policy</a>
                </span>
              </label>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handlePersonalInfoSubmit}
                disabled={updateProfileMutation.isPending || !agreedToTerms}
                data-testid="button-continue-personal"
              >
                {updateProfileMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("onboarding.saving")}</>
                ) : (
                  t("onboarding.continue")
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Account Type Selection */}
        {step === "type" && (
          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center">
              <button
                onClick={() => setStep("personal-info")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 mx-auto"
                data-testid="button-back-to-personal"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <CardTitle className="text-2xl font-display">Account Type</CardTitle>
              <CardDescription>Select your account type to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                onClick={() => handleTypeSelection("individual")}
                disabled={updateProfileMutation.isPending}
                className={cn(
                  "w-full p-6 rounded-2xl border-2 transition-all text-left flex items-start gap-4",
                  "hover:border-primary hover:bg-primary/5"
                )}
                data-testid="button-individual"
              >
                <div className="p-3 rounded-xl bg-primary/10">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Individual User</h3>
                  <p className="text-sm text-muted-foreground">Join group buys, share costs, and discover deals</p>
                </div>
              </button>
              
              <button
                onClick={() => handleTypeSelection("vendor")}
                disabled={updateProfileMutation.isPending}
                className={cn(
                  "w-full p-6 rounded-2xl border-2 transition-all text-left flex items-start gap-4",
                  "hover:border-primary hover:bg-primary/5"
                )}
                data-testid="button-vendor"
              >
                <div className="p-3 rounded-xl bg-accent/10">
                  <Store className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Vendor / Shop</h3>
                  <p className="text-sm text-muted-foreground">Post promotional offers and connect with groups</p>
                </div>
              </button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Identity Verification (Optional) */}
        {step === "verification" && (
          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center">
              <button
                onClick={() => setStep("type")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 mx-auto"
                data-testid="button-back-to-type"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded-full text-xs font-semibold mx-auto mb-3">
                <Shield className="w-3.5 h-3.5" />
                Optional step — skip anytime
              </div>
              <CardTitle className="text-2xl font-display">Get Verified</CardTitle>
              <CardDescription>
                A verified badge builds trust with other members. You can start exploring deals now and verify later from your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Skip option — prominent at top */}
              <Button 
                variant="outline"
                className="w-full rounded-xl border-primary/30 text-primary hover:bg-primary/5 hover:border-primary" 
                size="lg"
                onClick={handleSkipVerification}
                data-testid="button-skip-verification"
              >
                Skip — I'll verify later
              </Button>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or verify now</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-2">
                <Label>ID Document or Passport</Label>
                <label
                  className={cn(
                    "flex items-center gap-3 w-full rounded-xl border-2 border-dashed px-4 py-4 cursor-pointer transition-all",
                    idDocumentUrl ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                  data-testid="upload-id-document"
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                    className="sr-only"
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadVerificationFile(f, "id"); e.target.value = ""; }}
                    disabled={isUploadingId}
                    data-testid="input-id-document"
                  />
                  {isUploadingId ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
                  ) : idDocumentUrl ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Upload className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="min-w-0">
                    {isUploadingId ? (
                      <p className="text-sm font-medium text-primary">Uploading...</p>
                    ) : idDocumentUrl ? (
                      <><p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Uploaded successfully</p><p className="text-xs text-muted-foreground truncate">{idDocumentName}</p></>
                    ) : (
                      <><p className="text-sm font-medium">Upload ID document</p><p className="text-xs text-muted-foreground">JPG, PNG, WEBP, or PDF · Max 15MB</p></>
                    )}
                  </div>
                </label>
              </div>
              
              <div className="space-y-2">
                <Label>Selfie / Clear Photo of Your Face</Label>
                <label
                  className={cn(
                    "flex items-center gap-3 w-full rounded-xl border-2 border-dashed px-4 py-4 cursor-pointer transition-all",
                    selfieUrl ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                  data-testid="upload-selfie"
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    className="sr-only"
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadVerificationFile(f, "selfie"); e.target.value = ""; }}
                    disabled={isUploadingSelfie}
                    data-testid="input-selfie"
                  />
                  {isUploadingSelfie ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
                  ) : selfieUrl ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Upload className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="min-w-0">
                    {isUploadingSelfie ? (
                      <p className="text-sm font-medium text-primary">Uploading...</p>
                    ) : selfieUrl ? (
                      <><p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Uploaded successfully</p><p className="text-xs text-muted-foreground truncate">{selfieName}</p></>
                    ) : (
                      <><p className="text-sm font-medium">Upload selfie</p><p className="text-xs text-muted-foreground">JPG, PNG, WEBP · Max 15MB · Face must be clearly visible</p></>
                    )}
                  </div>
                </label>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleVerificationSubmit}
                disabled={updateProfileMutation.isPending}
                data-testid="button-submit-verification"
              >
                {updateProfileMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("onboarding.submitting")}</>
                ) : (
                  t("onboarding.submitVerification")
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Vendor Details (if vendor) */}
        {step === "vendor-details" && (
          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center">
              <button
                onClick={() => setStep("verification")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 mx-auto"
                data-testid="button-back-to-verification"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <CardTitle className="text-2xl font-display">Business Details</CardTitle>
              <CardDescription>Tell us about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name *</Label>
                <Input 
                  placeholder="Your business name" 
                  value={vendorDetails.businessName}
                  onChange={(e) => setVendorDetails({ ...vendorDetails, businessName: e.target.value })}
                  data-testid="input-business-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Business License URL (Optional)</Label>
                <Input 
                  placeholder="https://..." 
                  value={vendorDetails.businessLicenseUrl}
                  onChange={(e) => setVendorDetails({ ...vendorDetails, businessLicenseUrl: e.target.value })}
                  data-testid="input-business-license"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Store Address</Label>
                <Input 
                  placeholder="Your store address" 
                  value={vendorDetails.storeAddress}
                  onChange={(e) => setVendorDetails({ ...vendorDetails, storeAddress: e.target.value })}
                  data-testid="input-store-address"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input 
                  placeholder="+1 234 567 8900" 
                  value={vendorDetails.contactPhone}
                  onChange={(e) => setVendorDetails({ ...vendorDetails, contactPhone: e.target.value })}
                  data-testid="input-contact-phone"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Tell customers about your business..." 
                  value={vendorDetails.description}
                  onChange={(e) => setVendorDetails({ ...vendorDetails, description: e.target.value })}
                  data-testid="input-business-description"
                />
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleVendorDetailsSubmit}
                data-testid="button-submit-vendor"
              >
                Complete Setup
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Complete */}
        {step === "complete" && (
          <Card className="border-border/50 shadow-xl">
            <CardContent className="pt-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold mb-2">Setup Complete!</h2>
                <p className="text-muted-foreground">
                  {idDocumentUrl && selfieUrl 
                    ? t("onboarding.verificationSubmitted")
                    : "You're all set! You can get verified anytime from your profile to earn a trusted badge."}
                </p>
              </div>
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleComplete}
                disabled={updateProfileMutation.isPending}
                data-testid="button-start-exploring"
              >
                {updateProfileMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("onboarding.finishing")}</>
                ) : (
                  t("onboarding.startExploring")
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
