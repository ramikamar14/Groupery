import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { track } from "@/lib/analytics";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * Lets a committed buyer open a dispute on their order for the given listing.
 * The server resolves the buyer's order and files a "dispute" report for admins.
 */
export function DisputeButton({ listingId }: { listingId: number }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (reason.trim().length < 5) {
      toast({ title: t("dispute.tooShort", "Please describe the problem (min 5 characters)"), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // Find this user's order for the listing, then dispute it
      const ordersRes = await apiRequest("GET", "/api/orders");
      const orders: Array<{ id: number; listingId: number }> = await ordersRes.json();
      const order = orders.find((o) => o.listingId === listingId);
      if (!order) {
        toast({ title: t("dispute.noOrder", "No order found to dispute"), variant: "destructive" });
        return;
      }
      await apiRequest("POST", `/api/orders/${order.id}/dispute`, { reason: reason.trim() });
      track("order_disputed", { listingId });
      toast({ title: t("dispute.submitted", "Dispute submitted. Our team will review it shortly.") });
      setOpen(false);
      setReason("");
    } catch (e: any) {
      toast({ title: t("dispute.failed", "Could not submit dispute"), description: e?.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors" data-testid="button-open-dispute">
          <AlertTriangle className="w-3.5 h-3.5" />
          {t("dispute.report", "Report a problem with this deal")}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dispute.title", "Report a problem")}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("dispute.desc", "Tell us what went wrong. Our team will review your order and may issue a refund.")}
        </p>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("dispute.placeholder", "Describe the issue (e.g. item not delivered, wrong item, organizer unresponsive)…") as string}
          rows={4}
          data-testid="input-dispute-reason"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button onClick={submit} disabled={submitting} data-testid="button-submit-dispute">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("dispute.submit", "Submit dispute")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
