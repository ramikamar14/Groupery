const LOGO_KEY = "grouperry_admin_logo_url";

function getCustomLogoUrl(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LOGO_KEY) || "";
}

export function setCustomLogoUrl(url: string) {
  if (typeof window === "undefined") return;
  if (url.trim()) {
    localStorage.setItem(LOGO_KEY, url.trim());
  } else {
    localStorage.removeItem(LOGO_KEY);
  }
  // Dispatch storage event so other components re-render
  window.dispatchEvent(new StorageEvent("storage", { key: LOGO_KEY }));
}

interface LogoIconProps {
  size?: number;
  className?: string;
  /**
   * "badge" — purple gradient rounded-square bg + white mark (app icon, nav)
   * "color" — transparent bg, purple gradient mark (light backgrounds)
   * "white" — transparent bg, white mark (dark/violet backgrounds)
   */
  variant?: "badge" | "color" | "white";
}

export function LogoIcon({ size = 32, className, variant = "badge" }: LogoIconProps) {
  const id = `lg-${variant}-${size}`;
  const hasBg = variant === "badge";
  const useGradient = variant === "color";
  const markColor = useGradient ? `url(#${id})` : "#fff";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Grouperry"
    >
      <defs>
        {hasBg && (
          <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        )}
        {useGradient && (
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        )}
      </defs>

      {hasBg && <rect width="180" height="180" rx="38" fill={`url(#${id}-bg)`} />}

      {/* G shape: large arc (CCW) + inward horizontal bar */}
      <g transform="translate(10, 40) scale(1.0)">
        <path
          d="M 76.9,41.5 A 33,33 0 1,0 75,61.3 L 56,61.3"
          fill="none"
          stroke={markColor}
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* ∞ infinity loops — filled figure-8 */}
        <path
          d="M 114,58 C 114,46 130,46 130,58 C 130,70 114,70 114,58 C 114,46 98,46 98,58 C 98,70 114,70 114,58 Z"
          fill={markColor}
        />
      </g>
    </svg>
  );
}

export function LogoWordmark({
  className,
  variant = "color",
}: {
  className?: string;
  variant?: LogoIconProps["variant"];
}) {
  const customUrl = getCustomLogoUrl();

  if (customUrl) {
    return (
      <div className={`flex items-center gap-2 ${className ?? ""}`}>
        <img
          src={customUrl}
          alt="Grouperry"
          style={{ height: 36, width: "auto", objectFit: "contain" }}
          onError={(e) => {
            // If custom URL fails, fall back to SVG
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <LogoIcon size={36} variant={variant} />
      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: "-0.02em",
          color: variant === "white" ? "#fff" : "#0f172a",
          lineHeight: 1,
        }}
      >
        Grouperry<sup style={{ fontSize: 10, verticalAlign: "super", fontWeight: 400 }}>®</sup>
      </span>
    </div>
  );
}
