import { NotificationItem, type Notification } from "./NotificationItem";

interface NotificationGroupProps {
  label: string;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

export function NotificationGroup({
  label,
  notifications,
  onMarkRead,
}: NotificationGroupProps) {
  if (notifications.length === 0) return null;

  return (
    <section aria-label={label}>
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">
        {label}
      </h2>
      <div className="space-y-2">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onMarkRead={onMarkRead} />
        ))}
      </div>
    </section>
  );
}
