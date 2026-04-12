import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Flag, ShieldAlert, ShieldOff, UserX, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

function WarnUserDialog({ onWarn, isPending }: { onWarn: (reason?: string) => void; isPending: boolean }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleWarn = () => {
    onWarn(reason);
    setOpen(false);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 hover:bg-amber-50" data-testid="button-warn">
          <AlertTriangle className="w-4 h-4 mr-1" />
          {t("listing.warn")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("listing.sendWarning")}</DialogTitle>
          <DialogDescription>
            {t("listing.warnDialogDesc")}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder={t("listing.warnReasonPlaceholder")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          data-testid="input-warn-reason"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("listing.cancel")}</Button>
          <Button onClick={handleWarn} disabled={isPending} className="bg-amber-500 hover:bg-amber-600" data-testid="button-confirm-warn">
            {isPending ? t("listing.sending") : t("listing.sendWarning")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReportUserDialog({ reportedUserId, reportedUserName }: { reportedUserId: string; reportedUserName: string }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState("fraud");

  const reportMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/reports", { reportedUserId, reason, category });
    },
    onSuccess: () => {
      toast({
        title: t("listing.reportUserSuccess"),
        description: t("listing.reportUserSuccessDesc")
      });
      setOpen(false);
      setReason("");
      setCategory("fraud");
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("listing.reportUserReason"), variant: "destructive" });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30" data-testid={`button-report-${reportedUserId}`}>
          <Flag className="w-4 h-4 mr-1" />
          {t("listing.reportUser")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("listing.reportUser")}</DialogTitle>
          <DialogDescription>
            {t("listing.reportUserReason")} — {reportedUserName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="select-report-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fraud">{t("listing.reportCategoryFraud", "Fraud / Scam")}</SelectItem>
              <SelectItem value="spam">{t("listing.reportCategorySpam", "Spam")}</SelectItem>
              <SelectItem value="harassment">{t("listing.reportCategoryHarassment", "Harassment")}</SelectItem>
              <SelectItem value="fake">{t("listing.reportCategoryFake", "Fake Identity")}</SelectItem>
              <SelectItem value="other">{t("listing.reportCategoryOther", "Other")}</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder={t("listing.reportReasonPlaceholder", "Describe what happened...")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            data-testid="input-report-reason"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("listing.cancel")}</Button>
          <Button
            variant="destructive"
            onClick={() => reportMutation.mutate()}
            disabled={reportMutation.isPending || !reason.trim()}
            data-testid="button-confirm-report"
          >
            {reportMutation.isPending ? t("listing.sending") : t("listing.reportUser")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ParticipantsManagement({ listing, isCreator }: { listing: any; isCreator: boolean }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: warnings = [] } = useQuery({
    queryKey: ["/api/listings", listing.id, "warnings"],
    queryFn: () => fetch(`/api/listings/${listing.id}/warnings`, { credentials: "include" }).then(r => r.json())
  });

  const warnMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      const res = await fetch(`/api/listings/${listing.id}/warn/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
        credentials: "include"
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listing.id, "warnings"] });
      toast({ title: t("listing.warningSent"), description: t("listing.warningSentDesc") });
    },
    onError: (err: Error) => {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  });

  const kickMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/listings/${listing.id}/kick/${userId}`, {
        method: "POST",
        credentials: "include"
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listing.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listing.id, "warnings"] });
      toast({ title: t("listing.userKicked"), description: t("listing.userKickedDesc") });
    },
    onError: (err: Error) => {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  });

  const promoteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/listings/${listing.id}/co-organizer/${userId}`, {
        method: "POST",
        credentials: "include"
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listing.id] });
      toast({ title: t("listing.promotedTitle"), description: t("listing.promotedDesc") });
    },
    onError: (err: Error) => {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  });

  const demoteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/listings/${listing.id}/co-organizer/${userId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listing.id] });
      toast({ title: t("listing.demoteSuccess"), description: t("listing.demoteSuccessDesc") });
    },
    onError: (err: Error) => {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  });

  const getWarningForUser = (userId: string) => {
    return warnings.find((w: any) => w.warnedUserId === userId && !w.kicked);
  };

  const canKick = (warning: any) => {
    return new Date() >= new Date(warning.kickableAt);
  };

  return (
    <div className="bg-card rounded-3xl shadow-sm border border-border/50 p-6">
      <h3 className="font-bold font-display text-lg mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2" />
        {t("listing.participants")} ({listing.participants.length})
      </h3>
      <div className="space-y-3">
        {listing.participants.map((p: any) => {
          const warning = getWarningForUser(p.userId);
          const isCoOrg = p.role === "co-organizer";
          const userName = `${p.user?.firstName || ""} ${p.user?.lastName || ""}`.trim() || "User";

          return (
            <div key={p.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <div className="flex items-center gap-3 flex-wrap">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={p.user?.profileImageUrl} />
                  <AvatarFallback>{p.user?.firstName?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{userName}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("listing.joinedAgo", { time: formatDistanceToNow(new Date(p.joinedAt)) })}
                  </p>
                </div>
                {isCoOrg && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs rounded-full flex items-center" data-testid={`badge-co-organizer-${p.userId}`}>
                    <ShieldAlert className="w-3 h-3 mr-1" />
                    {t("listing.coOrganizer")}
                  </span>
                )}
                {warning && (
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {t("listing.warned")}
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {isCreator && !isCoOrg && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => promoteMutation.mutate(p.userId)}
                    disabled={promoteMutation.isPending}
                    data-testid={`button-promote-${p.userId}`}
                  >
                    <ShieldAlert className="w-4 h-4 mr-1" />
                    {t("listing.promote")}
                  </Button>
                )}
                {isCreator && isCoOrg && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => demoteMutation.mutate(p.userId)}
                    disabled={demoteMutation.isPending}
                    data-testid={`button-demote-${p.userId}`}
                    className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  >
                    <ShieldOff className="w-4 h-4 mr-1" />
                    {t("listing.demote")}
                  </Button>
                )}
                {!warning ? (
                  <WarnUserDialog
                    onWarn={(reason) => warnMutation.mutate({ userId: p.userId, reason })}
                    isPending={warnMutation.isPending}
                  />
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => kickMutation.mutate(p.userId)}
                    disabled={!canKick(warning) || kickMutation.isPending}
                    data-testid={`button-kick-${p.userId}`}
                  >
                    <UserX className="w-4 h-4 mr-1" />
                    {canKick(warning) ? t("listing.kick") : t("listing.waitMinutes", { minutes: Math.ceil((new Date(warning.kickableAt).getTime() - Date.now()) / 60000) })}
                  </Button>
                )}
                <ReportUserDialog reportedUserId={p.userId} reportedUserName={userName} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
