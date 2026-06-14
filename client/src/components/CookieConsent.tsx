import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "grouperry_cookie_consent";

type ConsentValue = "accepted" | "declined" | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentValue>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as ConsentValue) || null;
    } catch {
      return null;
    }
  });

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setConsent("declined");
  };

  if (consent !== null) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Cookie className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold mb-0.5">We use cookies</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We use essential cookies to keep you signed in and improve your experience.{" "}
                <Link href="/privacy" className="underline hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>
            <button
              type="button"
              onClick={handleDecline}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground shrink-0"
              aria-label="Decline cookies"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={handleDecline}
            >
              Decline
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={handleAccept}
            >
              Accept all
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
