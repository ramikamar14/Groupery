import { useMemo } from "react";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export interface CompletenessUser {
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  country?: string | null;
  city?: string | null;
  phone?: string | null;
  phoneVerified?: boolean | null;
  verificationStatus?: string | null;
}

interface Task {
  key: string;
  label: string;
  done: boolean;
  action?: () => void;
}

/**
 * Profile completeness meter — a NEW client-side feature that nudges users to
 * finish their profile. Purely derived from existing user fields (no new API).
 */
export function ProfileCompleteness({
  user,
  onEditProfile,
  onVerifyIdentity,
  onAddPhone,
}: {
  user: CompletenessUser;
  onEditProfile?: () => void;
  onVerifyIdentity?: () => void;
  onAddPhone?: () => void;
}) {
  const { t } = useTranslation();

  const tasks = useMemo<Task[]>(() => {
    const hasName = Boolean(user.firstName?.trim() && user.lastName?.trim());
    const hasPhoto = Boolean(user.profileImageUrl);
    const hasBio = Boolean(user.bio?.trim());
    const hasLocation = Boolean(user.country?.trim());
    const hasPhone = Boolean(user.phone?.trim() && user.phoneVerified);
    const isVerified = user.verificationStatus === "verified" || user.verificationStatus === "pending";

    return [
      { key: "name", label: t("completeness.addName", "Add your name"), done: hasName, action: onEditProfile },
      { key: "photo", label: t("completeness.addPhoto", "Upload a profile photo"), done: hasPhoto, action: onEditProfile },
      { key: "location", label: t("completeness.addLocation", "Set your country"), done: hasLocation, action: onEditProfile },
      { key: "bio", label: t("completeness.addBio", "Write a short bio"), done: hasBio, action: onEditProfile },
      { key: "phone", label: t("completeness.verifyPhone", "Verify your phone"), done: hasPhone, action: onAddPhone },
      { key: "identity", label: t("completeness.verifyIdentity", "Verify your identity"), done: isVerified, action: onVerifyIdentity },
    ];
  }, [user, t, onEditProfile, onVerifyIdentity, onAddPhone]);

  const doneCount = tasks.filter((task) => task.done).length;
  const pct = Math.round((doneCount / tasks.length) * 100);
  const nextTask = tasks.find((task) => !task.done);

  if (pct === 100) return null;

  return (
    <div
      className="rounded-2xl border border-border bg-card p-5"
      data-testid="profile-completeness"
      aria-label={t("completeness.title", "Profile completeness")}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          {t("completeness.title", "Profile completeness")}
        </h3>
        <span className="text-sm font-bold tabular-nums text-primary" data-testid="completeness-pct">{pct}%</span>
      </div>

      <div
        className="h-2 bg-muted rounded-full overflow-hidden mb-4"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        {t("completeness.summary", "{{done}} of {{total}} steps done", { done: doneCount, total: tasks.length })}
        {nextTask ? ` — ${t("completeness.next", "next")}: ${nextTask.label}` : ""}
      </p>

      <ul className="space-y-1.5">
        {tasks.map((task) => (
          <li key={task.key}>
            <button
              type="button"
              onClick={task.done ? undefined : task.action}
              disabled={task.done || !task.action}
              className={cn(
                "w-full flex items-center gap-2 text-sm rounded-lg px-2 py-1.5 -mx-2 text-left transition-colors",
                task.done
                  ? "text-muted-foreground cursor-default"
                  : "text-foreground hover:bg-muted/60 cursor-pointer"
              )}
              data-testid={`completeness-task-${task.key}`}
            >
              {task.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground/50 shrink-0" aria-hidden />
              )}
              <span className={cn(task.done && "line-through")}>{task.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
