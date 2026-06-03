import { useEffect, useState } from "react";
import { Link } from "wouter";
import { differenceInHours } from "date-fns";
import type { DiscoverCardListing } from "./mapListing";
import { fillRatio } from "./mapListing";

interface Props {
  listing: DiscoverCardListing;
  description: string;
  joinLabel: string;
  badgeDeal: string;
  saveBadgeText: string;
  joinedLabel: string;
  filledLabel: string;
}

function SlotMeter({ filled, total }: { filled: number; total: number }) {
  const cells = Math.min(total, 24);
  const filledCells = total > 24 ? Math.round((filled / total) * cells) : filled;
  return (
    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
      {Array.from({ length: cells }).map((_, i) => (
        <div
          key={i}
          className={i < filledCells ? "gp-slot gp-slot-on" : i === filledCells ? "gp-slot gp-slot-next" : "gp-slot gp-slot-off"}
          style={{ height: 16, minWidth: 18, flex: "1 1 18px", maxWidth: 28 }}
        />
      ))}
    </div>
  );
}

export function DiscoverDealOfTheDay({
  listing,
  description,
  joinLabel,
  badgeDeal,
  saveBadgeText,
  joinedLabel,
  filledLabel,
}: Props) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = listing.endsAt.getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [listing.endsAt]);

  const pct = fillRatio(listing);
  const savings =
    listing.originalPrice > 0 && listing.groupPrice > 0
      ? Math.round((1 - listing.groupPrice / listing.originalPrice) * 100)
      : 0;
  const slotsLeft = listing.spotsTotal - listing.spotsFilled;
  const isAlmostFull = slotsLeft > 0 && slotsLeft <= 3;
  const hoursLeft = differenceInHours(listing.endsAt, new Date());
  const isUrgent = hoursLeft > 0 && hoursLeft <= 9;

  return (
    <div
      className="gp-card mb-8"
      style={{
        overflow: "hidden",
        background: "var(--surface)",
        borderRadius: 24,
      }}
    >
      {/* Hero image tile */}
      <div style={{ position: "relative", height: 240 }}>
        <div className="gp-img-tile" style={{ height: "100%", borderRadius: 0 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: "#fff",
            boxShadow: "0 10px 30px -8px rgba(109,40,217,.45)",
            display: "grid", placeItems: "center",
            color: "var(--v-700)", fontWeight: 900, fontSize: 28,
            letterSpacing: "-.02em",
          }}>
            {listing.title.slice(0, 2).toUpperCase()}
          </div>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".1em",
            textTransform: "uppercase", color: "rgba(255,255,255,.6)", fontWeight: 500,
          }}>
            deal of the day
          </span>
        </div>

        {/* LIVE chip */}
        <span className="gp-chip gp-chip-live" style={{ position: "absolute", top: 14, left: 14, fontWeight: 700, fontSize: 11 }}>
          <span className="gp-dot-pulse" style={{ background: "#fff" }} /> LIVE
        </span>

        {/* Deal of the Day badge */}
        <span
          className="gp-chip"
          style={{
            position: "absolute", top: 14, left: 74,
            background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)",
            color: "#fff", border: "1px solid rgba(255,255,255,.25)",
            fontWeight: 700, fontSize: 11,
          }}
        >
          🔥 {badgeDeal}
        </span>

        {/* Countdown timer */}
        <div style={{
          position: "absolute", top: 14, right: 14,
          background: "rgba(0,0,0,.55)", backdropFilter: "blur(8px)",
          borderRadius: 14, padding: "6px 12px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,.6)", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>ends</span>
          <span style={{
            fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 15,
            color: isUrgent ? "#fca5a5" : "#fff", letterSpacing: ".04em",
          }}>
            {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
          </span>
        </div>

        {/* Savings disc */}
        {savings > 0 && (
          <div className="gp-savings-disc" style={{ width: 58, height: 58, bottom: 14, right: 14 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 900, lineHeight: 1 }}>{savings}%</div>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: ".06em", opacity: .85 }}>OFF</div>
            </div>
          </div>
        )}

        {/* Almost full banner */}
        {isAlmostFull && (
          <div className="gp-almost">
            🔥 Only {slotsLeft} spot{slotsLeft === 1 ? "" : "s"} left!
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "22px 22px 20px" }}>
        {/* Category chip */}
        <div style={{ marginBottom: 10 }}>
          <span className="gp-chip gp-chip-cat">{listing.category}</span>
        </div>

        {/* Title + description */}
        <h2 style={{
          margin: "0 0 8px", fontSize: 22, fontWeight: 800,
          letterSpacing: "-.03em", lineHeight: 1.2, color: "var(--ink)",
        }}>
          {listing.title}
        </h2>
        <p style={{
          margin: "0 0 18px", fontSize: 14, color: "var(--muted-c)", lineHeight: 1.55,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
        }}>
          {description}
        </p>

        {/* Seller row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--v-500), var(--v-700))",
            color: "#fff", fontWeight: 700, fontSize: 12,
            display: "grid", placeItems: "center", flexShrink: 0,
          }}>
            {listing.seller.name[0]}
          </div>
          <span style={{ fontSize: 13, color: "var(--muted-c)", fontWeight: 600 }}>
            {listing.seller.name}
          </span>
          {listing.seller.verified && (
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--emerald)" }}>✓ verified</span>
          )}
        </div>

        {/* Slot meter */}
        <SlotMeter filled={listing.spotsFilled} total={listing.spotsTotal} />

        {/* Fill count + price row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "14px 0 16px" }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
              <span style={{ color: "var(--v-700)", fontSize: 22, fontWeight: 900 }}>{listing.spotsFilled}</span>
              {" "}<span style={{ color: "var(--muted-c)", fontWeight: 600 }}>in ·</span>{" "}
              <span style={{ fontWeight: 700 }}>{slotsLeft}</span>{" "}
              <span style={{ color: "var(--muted-c)", fontWeight: 500, fontSize: 13 }}>to unlock</span>
            </span>
            <div style={{ marginTop: 4 }}>
              <span style={{ fontSize: 12, color: "var(--muted-2)", fontWeight: 500 }}>
                {Math.round(pct)}% filled
              </span>
            </div>
          </div>

          {listing.groupPrice > 0 && (
            <div style={{ textAlign: "right" }}>
              {listing.originalPrice > listing.groupPrice && (
                <div style={{ fontSize: 13, color: "var(--muted-2)", textDecoration: "line-through", fontWeight: 500 }}>
                  ${listing.originalPrice}
                </div>
              )}
              <div style={{ fontSize: 30, fontWeight: 900, color: "var(--v-700)", letterSpacing: "-.03em", lineHeight: 1 }}>
                ${listing.groupPrice}
              </div>
            </div>
          )}
        </div>

        {/* CTA button */}
        <Link href={`/listings/${listing.id}`}>
          <button style={{
            width: "100%",
            background: "linear-gradient(135deg, var(--v-700), var(--v-500))",
            color: "#fff", border: "none", borderRadius: 16,
            padding: "14px 24px",
            fontSize: 16, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 8px 24px -6px rgba(109,40,217,.5)",
            fontFamily: "inherit",
            letterSpacing: "-.01em",
            transition: "opacity .15s, transform .15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.opacity = ".9";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            (e.currentTarget as HTMLButtonElement).style.transform = "";
          }}
          >
            {joinLabel} →
          </button>
        </Link>
      </div>
    </div>
  );
}
