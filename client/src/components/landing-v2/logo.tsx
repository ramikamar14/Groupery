"use client";

import { cn } from "@/lib/utils";
import { LogoIcon } from "@/components/Logo";
import { useTranslation } from "react-i18next";

interface LogoProps {
  className?: string;
  /** Default 40px matches the former landing mark footprint (size-10). */
  iconSize?: number;
}

export function Logo({ className, iconSize = 40 }: LogoProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex items-center gap-2", className)} data-testid="text-brand">
      <LogoIcon size={iconSize} variant="color" />
      <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em", color: "#0f172a", lineHeight: 1 }}>
        {t("landing.brandName")}<sup style={{ fontSize: 10, verticalAlign: "super", fontWeight: 400 }}>®</sup>
      </span>
    </div>
  );
}
