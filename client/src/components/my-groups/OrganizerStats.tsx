import { useTranslation } from "react-i18next";

export function OrganizerStats({
  totalGroups,
  totalParticipants,
  fillRatePct,
  completedGroups,
}: {
  totalGroups: number;
  totalParticipants: number;
  fillRatePct: number;
  completedGroups: number;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="organizer-analytics">
      <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
        <p className="text-2xl font-bold text-primary" data-testid="stat-total-groups">
          {totalGroups}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{t("myGroups.totalGroups")}</p>
      </div>
      <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
        <p className="text-2xl font-bold text-primary" data-testid="stat-total-participants">
          {totalParticipants}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{t("myGroups.totalMembers")}</p>
      </div>
      <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="stat-fill-rate">
          {fillRatePct}%
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{t("myGroups.fillRate")}</p>
      </div>
      <div className="bg-card border border-border/50 rounded-xl p-3 text-center">
        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid="stat-completed">
          {completedGroups}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{t("myGroups.completedStat")}</p>
      </div>
    </div>
  );
}
