import { Link } from "wouter";
import { LogoIcon } from "./Logo";
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/40 bg-card/30 mt-auto" data-testid="footer">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">

          {/* Brand column */}
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <LogoIcon size={28} />
              <span className="font-bold font-display text-base tracking-tight">Grouperry</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[180px]">
              Group buying coordination platform. Buy together, save more.
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Platform</p>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-explore">
                  Explore Deals
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-create">
                  Create a Group
                </Link>
              </li>
              <li>
                <Link href="/my-groups" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-mygroups">
                  My Groups
                </Link>
              </li>
              <li>
                <Link href="/saved" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-saved">
                  Saved Listings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Support</p>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-faq">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-contact">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-profile">
                  Your Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Legal</p>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-terms">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-privacy">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 pt-6 border-t border-border/40">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 text-center sm:text-left">
            &copy; {currentYear} Grouperry. Made with <Heart className="w-3 h-3 text-destructive fill-destructive" /> for group buyers.
          </p>
        </div>
      </div>
    </footer>
  );
}
