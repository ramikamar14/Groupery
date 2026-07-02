import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMessages, useSendMessage } from "@/hooks/use-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, MessagesSquare, AlertCircle, RefreshCcw } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";

const GROUP_GAP_MS = 5 * 60 * 1000; // start a new bubble group after a 5-minute gap
const MAX_MESSAGE_LENGTH = 2000;

function senderName(sender: any, fallback: string): string {
  if (!sender) return fallback;
  const last = sender.lastName ? ` ${sender.lastName[0]}.` : "";
  return `${sender.firstName || fallback}${last}`;
}

export function ChatInterface({ listingId, currentUserId }: { listingId: number; currentUserId?: string }) {
  const { t } = useTranslation();
  const { data: messages = [], isLoading, isError, refetch } = useMessages(listingId);
  const sendMessage = useSendMessage();
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dayLabel = (date: Date): string => {
    if (isToday(date)) return t("listing.chatToday", "Today");
    if (isYesterday(date)) return t("listing.chatYesterday", "Yesterday");
    return format(date, "MMMM d, yyyy");
  };

  // Oldest → newest for natural reading order (endpoint returns newest-first)
  const ordered = [...messages].reverse();

  // Auto-scroll to the newest message whenever the count changes.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: ordered.length > 0 ? "smooth" : "auto", block: "nearest" });
  }, [ordered.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || sendMessage.isPending) return;
    sendMessage.mutate({ listingId, content: trimmed }, {
      onSuccess: () => {
        setContent("");
        inputRef.current?.focus();
        requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
      },
    });
  };

  const memberFallback = t("listing.chatMember", "Member");

  return (
    <>
      <div
        className="flex-1 overflow-y-auto p-4"
        role="log"
        aria-live="polite"
        aria-label={t("listing.chatLog", "Group chat messages")}
        data-testid="chat-scroll"
      >
        {isLoading ? (
          <div className="space-y-4" aria-hidden data-testid="chat-loading">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("flex gap-2", i % 2 === 0 ? "justify-start" : "justify-end")}>
                {i % 2 === 0 && <div className="w-7 h-7 rounded-full bg-muted animate-pulse shrink-0" />}
                <div className="space-y-1.5">
                  <div className={cn("h-3 rounded bg-muted animate-pulse", i % 2 === 0 ? "w-24" : "w-16")} />
                  <div className={cn("h-9 rounded-2xl bg-muted animate-pulse", i % 2 === 0 ? "w-44" : "w-32")} />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10" data-testid="chat-error">
            <AlertCircle className="w-10 h-10 text-destructive/60 mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">{t("listing.chatErrorTitle", "Couldn't load messages")}</p>
            <p className="text-xs text-muted-foreground mb-4">{t("listing.chatErrorDesc", "Check your connection and try again.")}</p>
            <Button size="sm" variant="outline" onClick={() => refetch()} data-testid="button-chat-retry">
              <RefreshCcw className="w-3.5 h-3.5 mr-1.5" />
              {t("common.retry", "Retry")}
            </Button>
          </div>
        ) : ordered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10" data-testid="chat-empty">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
              <MessagesSquare className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">{t("listing.chatEmptyTitle", "Start the conversation")}</p>
            <p className="text-xs text-muted-foreground max-w-[220px]">{t("listing.chatEmptyDesc", "Coordinate payment, delivery and timing with the organiser and other members here.")}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {ordered.map((msg: any, i: number) => {
              const isMe = msg.userId === currentUserId;
              const prev = ordered[i - 1];
              const next = ordered[i + 1];
              const createdAt = new Date(msg.createdAt);
              const prevAt = prev ? new Date(prev.createdAt) : null;
              const nextAt = next ? new Date(next.createdAt) : null;

              const showDay = !prevAt || prevAt.toDateString() !== createdAt.toDateString();
              const startsGroup =
                showDay ||
                !prev ||
                prev.userId !== msg.userId ||
                (prevAt ? createdAt.getTime() - prevAt.getTime() > GROUP_GAP_MS : true);
              const endsGroup =
                !next ||
                next.userId !== msg.userId ||
                (nextAt ? nextAt.getTime() - createdAt.getTime() > GROUP_GAP_MS : true) ||
                (nextAt ? nextAt.toDateString() !== createdAt.toDateString() : true);

              return (
                <div key={msg.id}>
                  {showDay && (
                    <div className="flex items-center justify-center my-3" data-testid="chat-day-separator">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted/60 rounded-full px-2.5 py-0.5">
                        {dayLabel(createdAt)}
                      </span>
                    </div>
                  )}
                  <div className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start", startsGroup ? "mt-3" : "mt-0.5")}>
                    {!isMe && (
                      startsGroup ? (
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarImage src={msg.sender?.profileImageUrl || undefined} alt={senderName(msg.sender, memberFallback)} />
                          <AvatarFallback className="text-[10px]">{msg.sender?.firstName?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-7 shrink-0" aria-hidden />
                      )
                    )}
                    <div className={cn("max-w-[78%] flex flex-col", isMe ? "items-end" : "items-start")}>
                      {startsGroup && !isMe && (
                        <span className="text-[11px] font-semibold text-muted-foreground mb-0.5 px-1">{senderName(msg.sender, memberFallback)}</span>
                      )}
                      <div
                        className={cn(
                          "px-3.5 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                            : "bg-muted text-foreground rounded-2xl rounded-bl-md",
                        )}
                        data-testid={`chat-message-${msg.id}`}
                      >
                        {msg.content}
                      </div>
                      {endsGroup && (
                        <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                          {format(createdAt, "h:mm a")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-border bg-background">
        <div className="flex gap-2">
          <label htmlFor={`chat-input-${listingId}`} className="sr-only">{t("listing.typeMessage")}</label>
          <Input
            id={`chat-input-${listingId}`}
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("listing.typeMessage")}
            maxLength={MAX_MESSAGE_LENGTH}
            autoComplete="off"
            className="flex-1 rounded-full bg-muted/50 border-transparent focus:bg-background"
            data-testid="input-chat-message"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full shrink-0"
            disabled={sendMessage.isPending || !content.trim()}
            aria-label={t("listing.sendMessage", "Send message")}
            data-testid="button-send-message"
          >
            {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        {content.length >= MAX_MESSAGE_LENGTH - 100 && (
          <p className="text-[10px] text-muted-foreground text-right mt-1 px-1" data-testid="chat-char-count">
            {content.length}/{MAX_MESSAGE_LENGTH}
          </p>
        )}
      </form>
    </>
  );
}
