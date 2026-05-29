import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { track } from "@/lib/analytics";
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
type Step = "personal-info" | "vendor-details" | "complete";

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

  const handlePersonalInfoSubmit = async (asVendor = false) => {
    if (!personalInfo.firstName || !personalInfo.lastName) {
      toast({ title: "Required", description: "Please enter your first and last name.", variant: "destructive" });
      return;
    }
    if (!personalInfo.country) {
      toast({ title: "Required", description: "Please select your country.", variant: "destructive" });
      return;
    }
    if (!agreedToTerms) {
      toast({ title: "Agreement required", description: "Please agree to our Terms & Conditions and Privacy Policy to continue.", variant: "destructive" });
      return;
    }

    const type: UserType = asVendor ? "vendor" : "individual";
    setUserType(type);

    await updateProfileMutation.mutateAsync({
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      phone: personalInfo.phone || undefined,
      country: personalInfo.country,
      language: personalInfo.language || "en",
      userType: type,
    });

    if (asVendor) {
      setStep("vendor-details");
    } else {
      setStep("complete");
    }
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
    await updateProfileMutation.mutateAsync({ idDocumentUrl, selfieUrl, verificationStatus: "pending" });
    setStep("complete");
  };

  const handleSkipVerification = async () => {
    setStep("complete");
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
    track("onboarding_complete");
    toast({ title: "Welcome!", description: "Your account setup is complete. Start exploring group deals!" });
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Step 1: Personal Information — 2-step simplified flow */}
        {step === "personal-info" && (
          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">Welcome to Grouperry</CardTitle>
              <CardDescription>Just two fields and you're in</CardDescription>
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
                onClick={() => handlePersonalInfoSubmit(false)}
                disabled={updateProfileMutation.isPending || !agreedToTerms}
                data-testid="button-continue-personal"
              >
                {updateProfileMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("onboarding.saving")}</>
                ) : (
                  t("onboarding.continue")
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                  onClick={() => handlePersonalInfoSubmit(true)}
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-vendor-signup"
                >
                  I'm signing up as a vendor / shop →
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vendor Details step */}
        {step === "vendor-details" && (
          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center">
              <button
                onClick={() => setStep("personal-info")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 mx-auto"
                data-testid="button-back-to-personal"
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
