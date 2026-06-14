import { Link, useLocation } from "wouter";
import { Home, LayoutDashboard, PlusSquare, Users, User, LogOut, Bell, Bookmark, ShieldAlert, Clock, CheckCircle, ChevronRight, Tag, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LogoIcon } from "./Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";

export function BottomNav() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();

  const { data: notifications = [] } = useQuery<Array<{ id: number; isRead: boolean }>>({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isAdmin = !!(user as { isAdmin?: boolean } | undefined)?.isAdmin;

  // Keep bottom nav to 5 items max for comfortable tap targets
  const navItems = [
    { href: "/", icon: Home, label: t("nav.explore") },
    { href: "/my-groups", icon: Users, label: t("nav.myGroups") },
    { href: "/create", icon: PlusSquare, label: t("nav.create") },
    { href: "/notifications", icon: Bell, label: t("nav.notifications"), badge: unreadCount > 0 ? unreadCount : undefined },
    { href: "/profile", icon: User, label: t("nav.profile") },
  ];

  const createBlocked =
    isAuthenticated &&
    user &&
    (!(user as { phoneVerified?: boolean }).phoneVerified || !(user as { onboardingComplete?: boolean }).onboardingComplete);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass border-t md:hidden pb-safe">
      <div className="flex justify-around items-stretch h-[4.25rem] px-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const isCreate = item.href === "/create";
          const inner = (
            <Link
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 min-h-[44px] h-full space-y-1 transition-all duration-200 relative rounded-xl mx-0.5 px-1",
                isActive && !isCreate ? "text-primary" : !isCreate ? "text-muted-foreground hover:text-foreground" : ""
              )}
              data-testid={`nav-mobile-${item.href.replace("/", "") || "home"}`}
            >
              {isActive && item.href !== "/create" && (
                <span className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
              )}
              <div className="relative mt-1">
                {item.href === "/create" ? (
                  <span className="nav-create-fab">
                    <item.icon style={{ width: 18, height: 18, color: "#fff" }} strokeWidth={2.2} />
                  </span>
                ) : (
                  <item.icon className={cn("w-6 h-6 transition-transform duration-150", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 1.75} />
                )}
                {"badge" in item && item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm px-0.5">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className={cn("text-[11px] font-medium leading-none", item.href === "/create" ? "text-muted-foreground" : isActive ? "font-semibold text-primary" : "text-muted-foreground")}>{item.label}</span>
            </Link>
          );
          if (item.href === "/create" && createBlocked) {
            return (
              <Tooltip key={item.href} delayDuration={300}>
                <TooltipTrigger asChild>{inner}</TooltipTrigger>
                <TooltipContent side="top" className="max-w-[240px]">
                  {t("nav.createRequiresVerification")}
                </TooltipContent>
              </Tooltip>
            );
          }
          return <span key={item.href} className="contents">{inner}</span>;
        })}
      </div>
    </div>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { logout, isAuthenticated, user } = useAuth();
  const { t } = useTranslation();
  const { resolved: themeResolved, toggle: toggleTheme } = useTheme();

  const { data: notifications = [] } = useQuery<Array<{ id: number; isRead: boolean }>>({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
  });

  const { data: reliability } = useQuery<{ score: number }>({
    queryKey: ["/api/users", (user as any)?.id, "reliability"],
    queryFn: async () => {
      if (!(user as any)?.id) return null;
      const res = await fetch(`/api/users/${(user as any).id}/reliability`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user,
    staleTime: 300000,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navItems = [
    { href: "/", icon: Home, label: t("nav.explore") },
    { href: "/dashboard", icon: LayoutDashboard, label: t("nav.dashboard") },
    { href: "/my-groups", icon: Users, label: t("nav.myGroups") },
    { href: "/create", icon: PlusSquare, label: t("nav.create") },
    { href: "/saved", icon: Bookmark, label: t("nav.saved") },
    { href: "/vouchers", icon: Tag, label: "Vouchers" },
    { href: "/notifications", icon: Bell, label: t("nav.notifications"), badge: unreadCount > 0 ? unreadCount : undefined },
    { href: "/expired", icon: Clock, label: t("nav.pastListings") },
    { href: "/profile", icon: User, label: t("nav.profile") },
  ];

  const userName = user
    ? `${(user as any).firstName || ""} ${(user as any).lastName || ""}`.trim() || (user as any).email || t("nav.fallbackUser")
    : "";
  const userInitials = userName ? userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "U";
  const reliabilityScore = reliability?.score ?? null;

  const createBlocked =
    isAuthenticated &&
    user &&
    (!(user as { phoneVerified?: boolean }).phoneVerified || !(user as { onboardingComplete?: boolean }).onboardingComplete);

  return (
    <div className="hidden md:flex flex-col w-60 xl:w-64 h-screen border-r border-border/50 bg-card/50 backdrop-blur-sm fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border/40">
        <Link href="/" className="flex items-center gap-2.5 group" data-testid="nav-logo">
          <LogoIcon size={32} />
          <span className="text-base font-bold font-display tracking-tight text-foreground group-hover:text-primary transition-colors">
            {t("landing.brandName")}
          </span>
        </Link>
      </div>

      {/* User profile card */}
      {user && (
        <Link href="/profile" className="mx-3 mt-3 mb-1 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors duration-150 block group" data-testid="nav-user-card">
          <div className="flex items-center gap-2.5">
            <Avatar className="w-9 h-9 ring-2 ring-primary/20 shrink-0">
              <AvatarImage src={(user as any).profileImageUrl} alt={userName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">{userName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {(user as any).isVerified ? (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0 font-medium gap-0.5">
                    <CheckCircle className="w-2.5 h-2.5" />
                    {t("nav.verified")}
                  </Badge>
                ) : (
                  <span className="text-[10px] text-muted-foreground">{t("nav.notVerified")}</span>
                )}
                {reliabilityScore !== null && (
                  <span className="text-[10px] text-muted-foreground">
                    · {t("nav.reliableLine", { pct: reliabilityScore })}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
          </div>
        </Link>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const inner = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
              data-testid={`nav-sidebar-${item.href.replace("/", "") || "home"}`}
            >
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r bg-primary" />}
              <div className="relative">
                <item.icon className={cn("shrink-0", isActive ? "text-primary" : "group-hover:text-foreground")} strokeWidth={isActive ? 2.25 : 1.75} style={{ width: "1.0625rem", height: "1.0625rem" }} />
                {"badge" in item && item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-sm flex-1">{item.label}</span>
            </Link>
          );
          if (item.href === "/create" && createBlocked) {
            return (
              <Tooltip key={item.href} delayDuration={300}>
                <TooltipTrigger asChild>{inner}</TooltipTrigger>
                <TooltipContent side="right" className="max-w-[260px]">
                  {t("nav.createRequiresVerification")}
                </TooltipContent>
              </Tooltip>
            );
          }
          return <span key={item.href} className="contents">{inner}</span>;
        })}

        {(user as any)?.isAdmin && (
          <div className="pt-2 mt-1 border-t border-border/40">
            <Link href="/admin" className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group",
              location === "/admin"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                : "text-muted-foreground hover:bg-amber-500/8 hover:text-amber-600 dark:hover:text-amber-400"
            )} data-testid="nav-sidebar-admin">
              <ShieldAlert style={{ width: "1.0625rem", height: "1.0625rem" }} strokeWidth={1.75} />
              <span className="text-sm">{t("nav.adminCrm")}</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Footer actions */}
      <div className="p-3 border-t border-border/40 space-y-1">
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-xs text-muted-foreground font-medium">{t("nav.language")}</span>
          <LanguageSwitcher />
        </div>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-all duration-150 text-sm group"
          data-testid="button-toggle-theme"
        >
          {themeResolved === "dark"
            ? <Sun style={{ width: "1.0625rem", height: "1.0625rem" }} strokeWidth={1.75} />
            : <Moon style={{ width: "1.0625rem", height: "1.0625rem" }} strokeWidth={1.75} />}
          <span>{themeResolved === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-muted-foreground hover:bg-destructive/8 hover:text-destructive transition-all duration-150 text-sm group"
          data-testid="button-logout"
        >
          <LogOut style={{ width: "1.0625rem", height: "1.0625rem" }} strokeWidth={1.75} />
          <span>{t("nav.logout")}</span>
        </button>
      </div>
    </div>
  );
}
