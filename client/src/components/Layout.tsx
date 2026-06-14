import { ReactNode } from "react";
import { BottomNav, Sidebar } from "./Navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Footer } from "./Footer";
import { LogoIcon } from "./Logo";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  /** Override main inner max-width (default: max-w-5xl). Use e.g. max-w-[1400px] for admin. */
  mainClassName?: string;
}

export function Layout({ children, mainClassName }: LayoutProps) {
  const { t } = useTranslation();
  const { resolved: themeResolved, toggle: toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar />

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2" data-testid="mobile-logo">
            <LogoIcon size={28} />
            <span className="text-base font-bold font-display tracking-tight text-foreground">
              {t("landing.brandName")}
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={themeResolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              data-testid="mobile-toggle-theme"
            >
              {themeResolved === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="flex flex-col flex-1 md:pl-60 xl:pl-64 pt-14 md:pt-0">
        <main className="flex-1 pb-20 md:pb-0">
          <div className={cn("mx-auto px-4 py-6 sm:px-6 lg:px-8", mainClassName ?? "max-w-5xl")}>
            {children}
          </div>
        </main>

        <Footer />
      </div>

      <BottomNav />
    </div>
  );
}
