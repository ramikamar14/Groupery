import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";
import { differenceInHours, formatDistanceToNowStrict } from "date-fns";
import type { DiscoverCardListing } from "./mapListing";
import { fillRatio } from "./mapListing";

interface Props {
  listing: DiscoverCardListing;
  compact?: boolean;
  joinLabel: string;
}

function SlotMeter({ filled, total }: { filled: number; total: number }) {
  const cells = Math.min(total, 20);
  const filledCells = total > 20 ? Math.round((filled / total) * cells) : filled;
  return (
    <div style={{ display: "flex", gap: total > 16 ? 3 : 4 }}>
      {Array.from({ length: cells }).map((_, i) => (
        <div
          key={i}
          className={i < filledCells ? "gp-slot gp-slot-on" : i === filledCells ? "gp-slot gp-slot-next" : "gp-slot gp-slot-off"}
          style={{ height: 14 }}
        />
      ))}
    </div>
  );
}

export function DiscoverListingCard({ listing, compact = false, joinLabel }: Props) {
  const { t } = useTranslation();
  const savings =
    listing.originalPrice > 0 && listing.groupPrice > 0
      ? Math.round((1 - listing.groupPrice / listing.originalPrice) * 100)
      : 0;
  const slotsLeft = listing.spotsTotal - listing.spotsFilled;
  const isAlmostFull = slotsLeft > 0 && slotsLeft <= 3;
  const hoursLeft = differenceInHours(listing.endsAt, new Date());
  const isUrgent = hoursLeft > 0 && hoursLeft <= 9;

  const timeLabel = hoursLeft > 0
    ? formatDistanceToNowStrict(listing.endsAt, { addSuffix: false }) + " left"
    : "Ended";

  return (
    <div
      className="gp-card"
      style={{
        cursor: "pointer",
        overflow: "hidden",
        transition: "transform .18s, box-shadow .18s",
        flexShrink: compact ? 0 : undefined,
        width: compact ? 240 : undefined,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-lg)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-sm)";
      }}
    >
      <Link href={`/listings/${listing.id}`} className="block">
        {/* Image area */}
        <div style={{ position: "relative", height: compact ? 110 : 140 }}>
          <div className="gp-img-tile" style={{ height: "100%" }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "#fff",
              boxShadow: "0 6px 18px -6px rgba(109,40,217,.4)",
              display: "grid", placeItems: "center",
              color: "var(--v-700)", fontWeight: 800, fontSize: 18,
            }}>
              {listing.title.slice(0, 2).toUpperCase()}
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", fontWeight: 500 }}>
              product shot
            </span>
          </div>

          {/* LIVE chip */}
          <span className="gp-chip gp-chip-live" style={{ position: "absolute", top: 11, left: 11, fontWeight: 700, fontSize: 10.5 }}>
            <span className="gp-dot-pulse" style={{ background: "#fff" }} /> LIVE
          </span>

          {/* Savings disc */}
          {savings > 0 && (
            <div className="gp-savings-disc">
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: compact ? 13 : 15, fontWeight: 800 }}>{savings}%</div>
                <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: ".06em" }}>OFF</div>
              </div>
            </div>
          )}

          {/* Almost full banner */}
          {isAlmostFull && (
            <div className="gp-almost" data-testid={`urgency-spots-discover-${listing.id}`}>
              🔥 {slotsLeft} spot{slotsLeft === 1 ? "" : "s"} left
            </div>
          )}
        </div>
      </Link>

      {/* Card body */}
      <div style={{ padding: compact ? "14px 13px 13px" : "16px 15px 15px" }}>
        {/* Category + countdown row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
          <span className="gp-chip gp-chip-cat">{listing.category}</span>
          <span
            className="gp-chip"
            style={{
              fontSize: 10,
              background: isUrgent ? "var(--red-50)" : "var(--amber-50)",
              color: isUrgent ? "var(--red-c)" : "var(--amber-c)",
              border: `1px solid ${isUrgent ? "#fdd" : "#fde68a"}`,
            }}
            data-testid={`urgency-expiry-discover-${listing.id}`}
          >
            <Clock size={10} style={{ display: "inline" }} />
            {" "}{timeLabel}
          </span>
        </div>

        {/* Title */}
        <Link href={`/listings/${listing.id}`}>
          <h3 style={{
            margin: "0 0 13px", fontSize: compact ? 14 : 16, fontWeight: 700,
            letterSpacing: "-.02em", lineHeight: 1.25, color: "var(--ink)",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
          }}>
            {listing.title}
          </h3>
        </Link>

        {/* Slot meter */}
        <SlotMeter filled={listing.spotsFilled} total={listing.spotsTotal} />

        {/* Fill count + price */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "11px 0 0" }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>
            <span style={{ color: "var(--v-700)", fontSize: 17, fontWeight: 800 }}>{listing.spotsFilled}</span>
            {" "}<span style={{ color: "var(--muted-c)", fontWeight: 600 }}>in ·</span>{" "}
            {slotsLeft}{" "}
            <span style={{ color: "var(--muted-c)", fontWeight: 600, fontSize: 12 }}>to unlock</span>
          </span>
          <span style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
            {listing.groupPrice > 0 ? (
              <>
                <span style={{ fontSize: 20, fontWeight: 800, color: "var(--v-700)", letterSpacing: "-.02em" }}>
                  ${listing.groupPrice}
                </span>
                {listing.originalPrice > listing.groupPrice && (
                  <span style={{ fontSize: 12, color: "var(--muted-2)", textDecoration: "line-through" }}>
                    ${listing.originalPrice}
                  </span>
                )}
              </>
            ) : (
              <span style={{ fontSize: 13, color: "var(--muted-c)", fontWeight: 600 }}>View deal</span>
            )}
          </span>
        </div>

        {/* Seller + CTA row */}
        <div style={{
          marginTop: 10, paddingTop: 10,
          borderTop: "1px solid var(--line)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--v-500), var(--v-700))",
              color: "#fff", fontWeight: 700, fontSize: 10,
              display: "grid", placeItems: "center", flexShrink: 0,
            }}>
              {listing.seller.name[0]}
            </div>
            <span style={{ fontSize: 12, color: "var(--muted-c)", fontWeight: 500, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {listing.seller.name}
            </span>
            {listing.seller.verified && (
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--emerald)" }}>✓</span>
            )}
          </div>
          <Link href={`/listings/${listing.id}`}>
            <button style={{
              background: "var(--v-700)", color: "#fff", border: "none", borderRadius: 999,
              padding: "5px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 10px -4px rgba(109,40,217,.5)",
              fontFamily: "inherit",
            }}>
              {joinLabel}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
