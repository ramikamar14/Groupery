import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { apiUrl } from "@/lib/queryClient";

/** Only allow same-origin relative redirects — blocks open redirect attacks. */
function isSafeReturnTo(path: string | null | undefined): path is string {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  /** Safe relative path to navigate to after a successful login (e.g. "/admin"). */
  returnTo?: string | null;
}

export function LoginModal({ open, onClose, returnTo }: LoginModalProps) {
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [emailMode, setEmailMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    onClose();
    if (isSafeReturnTo(returnTo)) {
      navigate(returnTo);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailLoading(true);
    try {
      const url = apiUrl(emailMode === "login" ? "/api/auth/login/email" : "/api/auth/register");
      const body: any = { email, password };
      if (emailMode === "register") { body.firstName = firstName; body.lastName = lastName; }
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setEmailError(data.message || "Something went wrong"); return; }
      // Claim referral if user landed via ?ref= link
      if (emailMode === "register") {
        const ref = sessionStorage.getItem("grouperry_ref");
        if (ref) {
          fetch("/api/referrals/claim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ referrerId: ref }),
          }).then(() => sessionStorage.removeItem("grouperry_ref")).catch(() => {});
        }
      }
      onSuccess();
    } catch {
      setEmailError("Network error. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError("");
    setPhoneLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/login/send-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) { setPhoneError(data.message || "Failed to send OTP"); return; }
      setOtpSent(true);
    } catch {
      setPhoneError("Network error. Please try again.");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError("");
    setPhoneLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/login/verify-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) { setPhoneError(data.message || "Invalid OTP"); return; }
      onSuccess();
    } catch {
      setPhoneError("Network error. Please try again.");
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Welcome to Grouperry</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 pt-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              type="button"
              onClick={() => { window.location.href = apiUrl("/api/auth/google"); }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <div className="flex rounded-lg border p-1 gap-1">
              <button type="button" onClick={() => { setEmailMode("login"); setEmailError(""); }}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${emailMode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                Sign in
              </button>
              <button type="button" onClick={() => { setEmailMode("register"); setEmailError(""); }}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${emailMode === "register" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                Create account
              </button>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {emailMode === "register" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} />
              </div>
              {emailError && <p className="text-sm text-destructive">{emailError}</p>}
              <Button type="submit" className="w-full" disabled={emailLoading}>
                {emailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : emailMode === "login" ? "Sign in" : "Create account"}
              </Button>
              {emailMode === "login" && (
                <p className="text-center text-xs text-muted-foreground">
                  Forgot your password?{" "}
                  <a href="/contact" className="underline hover:text-foreground transition-colors" onClick={() => onClose()}>
                    Contact support
                  </a>
                </p>
              )}
            </form>
          </TabsContent>

          <TabsContent value="phone" className="space-y-4 pt-2">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000" required />
                </div>
                {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
                <Button type="submit" className="w-full" disabled={phoneLoading}>
                  {phoneLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send verification code"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to {phone}</p>
                <div className="space-y-1">
                  <Label htmlFor="otp">Verification code</Label>
                  <Input id="otp" value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" maxLength={6} required />
                </div>
                {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
                <Button type="submit" className="w-full" disabled={phoneLoading}>
                  {phoneLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify and sign in"}
                </Button>
                <button type="button" onClick={() => { setOtpSent(false); setOtp(""); setPhoneError(""); }} className="w-full text-sm text-muted-foreground hover:text-foreground">
                  Use a different number
                </button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
