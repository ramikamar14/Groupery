import { ReactNode } from "react";
import { BottomNav, Sidebar } from "./Navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Footer } from "./Footer";
import { LogoIcon } from "./Logo";
import { Link } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2" data-testid="mobile-logo">
            <LogoIcon size={28} />
            <span className="text-base font-bold font-display tracking-tight bg-gradient-to-r from-[#001F3F] to-[#008080] bg-clip-text text-transparent">
              Grouperry
            </span>
          </Link>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="flex flex-col flex-1 md:pl-60 xl:pl-64 pt-14 md:pt-0">
        <main className="flex-1 pb-20 md:pb-0">
          <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        <Footer />
      </div>

      <BottomNav />
    </div>
  );
}
