"use client";

import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Gift, Copy, CheckCheck, ExternalLink, Clock, Tag, ShieldCheck, Loader2, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type Voucher = {
  id: number;
  code: string;
  listingId: number;
  listingTitle: string;
  offerType: "percent_off" | "fixed_off" | "bogo" | "gift" | "coupon";
  discountValue?: number;
  description: string;
  status: "active" | "redeemed" | "expired";
  expiresAt?: string | null;
  redeemUrl?: string | null;
  issuedAt: string;
};

function VoucherCard({ voucher }: { voucher: Voucher }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(voucher.code).then(() => {
      setCopied(true);
      toast({ title: "Code copied!", description: voucher.code });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const statusColor =
    voucher.status === "active"
      ? { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", label: "Active" }
      : voucher.status === "redeemed"
      ? { bg: "#f9fafb", border: "#e5e7eb", text: "#6b7280", label: "Redeemed" }
      : { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", label: "Expired" };

  const offerLabel =
    voucher.offerType === "percent_off" && voucher.discountValue
      ? `${voucher.discountValue}% off`
      : voucher.offerType === "fixed_off" && voucher.discountValue
      ? `$${(voucher.discountValue / 100).toFixed(2)} off`
      : voucher.offerType === "bogo"
      ? "Buy 1 Get 1"
      : voucher.offerType === "gift"
      ? "Gift"
      : "Coupon";

  return (
    <div
      style={{
        background: voucher.status === "redeemed" ? "#f9fafb" : "#fff",
        border: "1px solid #ede9fe",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: voucher.status === "active" ? "0 4px 20px -6px rgba(109,40,217,0.15)" : "none",
        opacity: voucher.status === "redeemed" ? 0.7 : 1,
      }}
      data-testid={`voucher-card-${voucher.id}`}
    >
      {/* Top strip */}
      <div style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Gift style={{ width: 18, height: 18, color: "#fff", flexShrink: 0 }} />
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{offerLabel}</span>
        </div>
        <span
          style={{ fontSize: 11, fontWeight: 700, background: statusColor.bg, color: statusColor.text, border: `1px solid ${statusColor.border}`, borderRadius: 999, padding: "2px 10px" }}
        >
          {statusColor.label}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 20px" }}>
        <p style={{ fontSize: 12, color: "#9b95a6", marginBottom: 6, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {voucher.listingTitle}
        </p>
        <p style={{ fontSize: 14, color: "#191320", marginBottom: 14, lineHeight: 1.5 }}>{voucher.description}</p>

        {/* Code box */}
        <div
          style={{ background: "#f5f3ff", border: "1.5px dashed #c4b5fd", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}
        >
          <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 18, color: "#6d28d9", letterSpacing: "0.12em" }}>
            {voucher.code}
          </span>
          {voucher.status === "active" && (
            <button
              onClick={handleCopy}
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#6d28d9", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8, transition: "background 0.15s" }}
              data-testid={`button-copy-code-${voucher.id}`}
            >
              {copied ? <CheckCheck style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>

        {/* Footer row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "#9b95a6" }}>
            <Clock style={{ width: 12, height: 12 }} />
            {voucher.expiresAt
              ? `Expires ${new Date(voucher.expiresAt).toLocaleDateString()}`
              : "No expiry"}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href={`/listings/${voucher.listingId}`}
              style={{ fontSize: 12, fontWeight: 600, color: "#6d28d9", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}
            >
              View deal <ChevronRight style={{ width: 12, height: 12 }} />
            </Link>
            {voucher.redeemUrl && voucher.status === "active" && (
              <a
                href={voucher.redeemUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#059669,#0d9488)", padding: "4px 12px", borderRadius: 999, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                data-testid={`button-redeem-${voucher.id}`}
              >
                Redeem <ExternalLink style={{ width: 11, height: 11 }} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Vouchers() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: vouchers = [], isLoading, error } = useQuery<Voucher[]>({
    queryKey: ["/api/vouchers"],
    queryFn: async () => {
      const res = await fetch("/api/vouchers", { credentials: "include" });
      if (res.status === 404) return [];
      if (!res.ok) throw new Error("Failed to load vouchers");
      return res.json();
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const activeVouchers = vouchers.filter((v) => v.status === "active");
  const redeemedVouchers = vouchers.filter((v) => v.status === "redeemed" || v.status === "expired");

  return (
    <Layout>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Tag style={{ width: 22, height: 22, color: "#fff" }} />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#191320", margin: 0, letterSpacing: "-0.02em" }}>
                My Vouchers
              </h1>
              <p style={{ fontSize: 13, color: "#9b95a6", margin: 0 }}>
                Unlock rewards when your group deals complete
              </p>
            </div>
          </div>

          {/* Trust banner */}
          <div style={{ background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 16, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10, marginTop: 16 }}>
            <ShieldCheck style={{ width: 18, height: 18, color: "#6d28d9", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#4c1d95", margin: "0 0 2px" }}>
                How Grouperry Vouchers work
              </p>
              <p style={{ fontSize: 12, color: "#7c3aed", margin: 0, lineHeight: 1.5 }}>
                When a group deal completes and the seller offers a voucher or BOGO deal, you'll receive a unique GRPY-XXXX code here. Use it online or in-store to redeem your discount.
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <Loader2 style={{ width: 32, height: 32, color: "#6d28d9", margin: "0 auto" }} className="animate-spin" />
          </div>
        )}

        {/* No vouchers — empty state */}
        {!isLoading && vouchers.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#f5f3ff,#ede9fe)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Gift style={{ width: 36, height: 36, color: "#7c3aed" }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#191320", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              No vouchers yet
            </h2>
            <p style={{ fontSize: 14, color: "#9b95a6", maxWidth: 320, margin: "0 auto 28px", lineHeight: 1.6 }}>
              Join a group deal with a voucher or BOGO offer. When the group completes, your unique redemption code will appear here.
            </p>
            <Link
              href="/"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", fontWeight: 700, fontSize: 15, padding: "13px 28px", borderRadius: 999, textDecoration: "none", boxShadow: "0 8px 24px -6px rgba(109,40,217,0.4)" }}
              data-testid="button-explore-deals"
            >
              Browse deals with vouchers <ChevronRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        )}

        {/* Active vouchers */}
        {!isLoading && activeVouchers.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#191320", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#059669", display: "inline-block" }} />
              Active ({activeVouchers.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {activeVouchers.map((v) => <VoucherCard key={v.id} voucher={v} />)}
            </div>
          </div>
        )}

        {/* Redeemed / expired vouchers */}
        {!isLoading && redeemedVouchers.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#9b95a6", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#d1d5db", display: "inline-block" }} />
              Past vouchers ({redeemedVouchers.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {redeemedVouchers.map((v) => <VoucherCard key={v.id} voucher={v} />)}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
