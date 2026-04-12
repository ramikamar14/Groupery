import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMessages, useSendMessage } from "@/hooks/use-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function ChatInterface({ listingId, currentUserId }: { listingId: number; currentUserId?: string }) {
  const { t } = useTranslation();
  const { data: messages = [] } = useMessages(listingId);
  const sendMessage = useSendMessage();
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    sendMessage.mutate({ listingId, content }, {
      onSuccess: () => setContent("")
    });
  };

  return (
    <>
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {[...messages].reverse().map((msg: any) => {
            const isMe = msg.userId === currentUserId;
            return (
              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2",
                  isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"
                )}>
                  <p>{msg.content}</p>
                  <span className="text-[10px] opacity-70 block mt-1 text-right">
                    {format(new Date(msg.createdAt), "HH:mm")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <form onSubmit={handleSend} className="p-3 border-t border-border bg-background">
        <div className="flex gap-2">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("listing.typeMessage")}
            className="flex-1 rounded-full bg-muted/50 border-transparent focus:bg-background"
            data-testid="input-chat-message"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full shrink-0"
            disabled={sendMessage.isPending || !content.trim()}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </>
  );
}
