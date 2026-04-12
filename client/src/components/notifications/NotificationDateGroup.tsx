import { useTranslation } from "react-i18next";

export function NotificationDateGroup({
  dateKey,
  children,
}: {
  dateKey: "today" | "yesterday" | "thisWeek" | "earlier";
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        {t(`notifications.${dateKey}`)}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
