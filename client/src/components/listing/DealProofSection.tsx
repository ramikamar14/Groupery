import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, CheckCircle2, ImageIcon, ShieldCheck, FolderOpen, Link2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DealProofSectionProps {
  listingId: number;
  isCreator: boolean;
  isParticipant: boolean;
  currentUserId?: string;
}

export function DealProofSection({ listingId, isCreator, isParticipant, currentUserId }: DealProofSectionProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: t("common.error"), description: t("upload.imageTooLarge"), variant: "destructive" });
      return;
    }
    setUploadingFile(true);
    try {
      const dataUrl = await toBase64(file);
      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataUrl, name: file.name }),
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      uploadMutation.mutate(url);
    } catch {
      toast({ title: t("upload.uploadFailed"), description: t("upload.uploadFailedDesc"), variant: "destructive" });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const { data: proofs = [], isLoading, isError } = useQuery<any[]>({
    queryKey: ["/api/listings", listingId, "proofs"],
    queryFn: async () => {
      const res = await fetch(`/api/listings/${listingId}/proofs`, {
        credentials: "include",
      });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error(`Failed to load proofs: ${res.status}`);
      return res.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (url?: string) => {
      const res = await apiRequest("POST", `/api/listings/${listingId}/proofs`, { imageUrl: url ?? imageUrl });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      setImageUrl("");
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listingId, "proofs"] });
      toast({ title: t("proof.uploadedTitle", "Proof uploaded"), description: t("proof.uploadedDesc", "Your deal proof has been submitted.") });
    },
    onError: (e: any) => {
      toast({ title: t("common.error"), description: e.message, variant: "destructive" });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (proofId: number) => {
      const res = await apiRequest("PATCH", `/api/listings/${listingId}/proofs/${proofId}/confirm`, {});
      if (!res.ok) throw new Error("Failed to confirm");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings", listingId, "proofs"] });
      toast({ title: t("proof.confirmedTitle", "Proof confirmed") });
    },
    onError: (e: any) => {
      toast({ title: t("common.error"), description: e.message, variant: "destructive" });
    },
  });

  const canUpload = isCreator || isParticipant;
  const alreadyUploaded = proofs.some((p: any) => p.userId === currentUserId);

  if (isLoading) {
    return (
      <div className="bg-card rounded-3xl shadow-sm border border-border/50 p-6 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card rounded-3xl shadow-sm border border-border/50 p-6 text-center text-sm text-muted-foreground">
        <ShieldCheck className="w-6 h-6 mx-auto mb-2 opacity-30" />
        {t("proof.loadError", "Could not load deal proofs. Please refresh.")}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl shadow-sm border border-border/50 p-6" data-testid="section-deal-proofs">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <h3 className="font-bold font-display text-base">{t("proof.sectionTitle", "Deal Completion Proofs")}</h3>
        {proofs.length > 0 && (
          <Badge variant="secondary" className="ml-auto">{proofs.length}</Badge>
        )}
      </div>

      {canUpload && !alreadyUploaded && (
        <div className="mb-4 space-y-2" data-testid="form-upload-proof">
          {/* Mode toggle */}
          <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setUploadMode("file")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${uploadMode === "file" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              {t("proof.fromDevice", "From device")}
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("url")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${uploadMode === "url" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Link2 className="w-3.5 h-3.5" />
              {t("proof.pasteUrl", "Paste URL")}
            </button>
          </div>

          {uploadMode === "file" ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                data-testid="input-proof-file"
              />
              <Button
                variant="outline"
                className="w-full h-20 flex-col gap-2 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile || uploadMutation.isPending}
                data-testid="button-upload-proof-file"
              >
                {uploadingFile || uploadMutation.isPending
                  ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  : <>
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{t("proof.tapToUpload", "Tap to choose a photo")}</span>
                    </>}
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder={t("proof.imageUrlPlaceholder", "Paste an image URL as your proof…")}
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1"
                data-testid="input-proof-url"
              />
              <Button
                size="sm"
                onClick={() => uploadMutation.mutate(undefined)}
                disabled={!imageUrl.trim() || uploadMutation.isPending}
                data-testid="button-upload-proof"
              >
                {uploadMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><Upload className="w-4 h-4 mr-1" />{t("proof.upload", "Upload")}</>}
              </Button>
            </div>
          )}
        </div>
      )}

      {alreadyUploaded && (
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          {t("proof.alreadyUploaded", "You have already submitted a proof for this deal.")}
        </p>
      )}

      {proofs.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
          {t("proof.noProofsYet", "No proofs submitted yet.")}
        </div>
      ) : (
        <div className="space-y-3">
          {proofs.map((proof: any) => (
            <div
              key={proof.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/50"
              data-testid={`proof-item-${proof.id}`}
            >
              <img
                src={proof.imageUrl}
                alt={t("proof.proofAlt", "Deal proof")}
                className="w-16 h-16 rounded-lg object-cover border border-border/50 shrink-0 bg-muted"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={proof.user?.profileImageUrl} />
                    <AvatarFallback className="text-[10px]">{proof.user?.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {proof.user?.firstName} {proof.user?.lastName}
                  </span>
                  {proof.confirmed && (
                    <Badge className="text-[10px] gap-0.5 px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300 border-green-200 dark:border-green-800" variant="outline">
                      <CheckCircle2 className="w-3 h-3" />
                      {t("proof.confirmed", "Confirmed")}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {proof.createdAt ? format(new Date(proof.createdAt), "MMM d, yyyy") : ""}
                </p>
              </div>
              {isCreator && !proof.confirmed && (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 text-xs"
                  onClick={() => confirmMutation.mutate(proof.id)}
                  disabled={confirmMutation.isPending}
                  data-testid={`button-confirm-proof-${proof.id}`}
                >
                  {t("proof.confirm", "Confirm")}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
