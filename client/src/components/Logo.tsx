interface LogoIconProps {
  size?: number;
  className?: string;
  /**
   * "badge" (default) — navy rounded-square bg + white icon. Nav, mobile header, app icon.
   * "mark"            — transparent bg, navy icon. White/light page backgrounds.
   * "white"           — transparent bg, white icon. Navy/dark sections.
   */
  variant?: "badge" | "mark" | "white";
}

export function LogoIcon({ size = 32, className, variant = "badge" }: LogoIconProps) {
  const hasBg = variant === "badge";
  const c = variant === "mark" ? "#001F3F" : "#FFFFFF";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Grouperry"
    >
      {hasBg && <rect width="100" height="100" rx="20" fill="#001F3F" />}

      {/* Upper-left ring — top "o" of the % */}
      <circle cx="29" cy="40" r="14" stroke={c} strokeWidth="10" fill="none" />

      {/* Lower-right ring — bottom "o" of the % */}
      <circle cx="71" cy="62" r="14" stroke={c} strokeWidth="10" fill="none" />

      {/* Upper-right filled dot — top tip of the slash */}
      <circle cx="59" cy="11" r="9" fill={c} />

      {/* Lower-left filled dot — bottom tip of the slash */}
      <circle cx="39" cy="90" r="9" fill={c} />

      {/*
        S-curve slash threading between both rings.
        C1 pulls upper-half LEFT  (grazes right edge of top ring at x≈48)
        C2 pulls lower-half RIGHT (grazes left  edge of bottom ring at x≈52)
      */}
      <path
        d="M 59 20 C 30 40, 70 62, 39 81"
        stroke={c}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function LogoWordmark({
  className,
  variant,
}: {
  className?: string;
  variant?: LogoIconProps["variant"];
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoIcon size={32} variant={variant} />
      <div className="flex flex-col leading-none">
        <span className="text-base font-bold font-display tracking-widest uppercase text-foreground">
          Grouperry
        </span>
        <span className="text-[9px] font-medium tracking-wider uppercase text-muted-foreground">
          Group Buying Made Easy
        </span>
      </div>
    </div>
  );
}
