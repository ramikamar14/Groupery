import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface Prefs {
  dealFilled: boolean;
  dealCompleted: boolean;
  newJoiner: boolean;
  reminders: boolean;
  weeklyDigest: boolean;
}

const DEFAULT_PREFS: Prefs = {
  dealFilled: true,
  dealCompleted: true,
  newJoiner: false,
  reminders: true,
  weeklyDigest: true,
};

const LABELS: { key: keyof Prefs; label: string; desc: string }[] = [
  { key: "dealFilled", label: "Deal filled", desc: "When your group deal reaches the required number of participants" },
  { key: "dealCompleted", label: "Deal completed", desc: "When a deal you joined or organized is completed" },
  { key: "newJoiner", label: "New participant", desc: "When someone joins a deal you organized" },
  { key: "reminders", label: "Reminders", desc: "Deal expiry warnings and payment reminders" },
  { key: "weeklyDigest", label: "Weekly digest", desc: "A summary of trending deals tailored for you" },
];

export function NotificationPreferences({ currentPrefs }: { currentPrefs?: Record<string, boolean> | null }) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [prefs, setPrefs] = useState<Prefs>(() => ({
    ...DEFAULT_PREFS,
    ...(currentPrefs ?? {}),
  }));

  const mutation = useMutation({
    mutationFn: async (updated: Prefs) => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notificationPreferences: updated }),
      });
      if (!res.ok) throw new Error("Failed to save preferences");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: t("profile.changesSaved", "Preferences saved") });
    },
    onError: () => {
      toast({ title: "Failed to save", variant: "destructive" });
    },
  });

  const toggle = (key: keyof Prefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    mutation.mutate(updated);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5" data-testid="notification-preferences">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Bell className="w-4 h-4 text-primary" />
        {t("profile.notificationPreferences", "Notification preferences")}
        {mutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin ml-auto text-muted-foreground" />}
      </h3>
      <div className="space-y-4">
        {LABELS.map(({ key, label, desc }) => (
          <div key={key} className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Label htmlFor={`notif-${key}`} className="text-sm font-medium cursor-pointer">{label}</Label>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
            </div>
            <Switch
              id={`notif-${key}`}
              checked={prefs[key]}
              onCheckedChange={() => toggle(key)}
              disabled={mutation.isPending}
              data-testid={`switch-notif-${key}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
