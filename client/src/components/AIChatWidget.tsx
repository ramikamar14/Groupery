import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, Info, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useListingContext } from "@/hooks/use-listing-context";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

interface Message {
  role: "user" | "assistant";
  content: string;
  model?: string;
  provider?: string;
}

function ProviderBadge({ provider, model }: { provider?: string; model?: string }) {
  if (!model || model === "fallback" || model === "none") return null;

  const label = provider === "openai" ? "GPT-4o mini"
    : model === "claude-sonnet-4-5" ? "Claude Sonnet 4.5"
    : model === "claude-haiku-4-5" ? "Claude Haiku 4.5"
    : model?.includes("haiku") ? "Claude Haiku"
    : model?.includes("sonnet") ? "Claude Sonnet"
    : model ?? "AI";

  const color = provider === "openai"
    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
    : "text-primary dark:text-violet-400 bg-primary/10";

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 ${color}`}>
      <Zap className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

export function AIChatWidget() {
  const { isAuthenticated } = useAuth();
  const { listingCtx } = useListingContext();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  if (!isAuthenticated) return null;

  const QUICK_PROMPTS = [
    t("ai.generalQ1"),
    t("ai.generalQ2"),
    t("ai.generalQ3"),
    t("ai.generalQ4"),
  ];

  const LISTING_QUICK_PROMPTS = [
    t("ai.listingQ1"),
    t("ai.listingQ2"),
    t("ai.listingQ3"),
    t("ai.listingQ4"),
  ];

  async function sendMessage(question: string) {
    if (!question.trim() || loading) return;
    const q = question.trim();

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const body: Record<string, any> = { question: q, history };

      if (listingCtx?.title) {
        body.context = `The user is currently viewing a group deal listing:\n- Title: ${listingCtx.title}\n- Category: ${listingCtx.category ?? "unknown"}\n- Slots remaining: ${listingCtx.slotsLeft ?? "unknown"} of ${listingCtx.totalSlots ?? "unknown"}\n${listingCtx.location ? `- Location: ${listingCtx.location}\n` : ""}${listingCtx.pricePerSlot ? `- Group price: $${(listingCtx.pricePerSlot / 100).toFixed(2)}/slot\n` : ""}${listingCtx.marketPrice ? `- Market price: $${(listingCtx.marketPrice / 100).toFixed(2)}\n` : ""}${listingCtx.expiresAt ? `- Expires: ${new Date(listingCtx.expiresAt).toLocaleDateString()}\n` : ""}`;
      }

      const res = await apiRequest("POST", "/api/ai", body);
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, model: data.model, provider: data.provider },
      ]);
    } catch (err) {
      let message = t("ai.error");
      if (err instanceof Error) {
        if (err.message.includes("401")) message = "Please log in to use AI chat";
        else if (err.message.includes("429")) message = "AI chat is temporarily unavailable due to high demand";
        else if (err.message.includes("500")) message = "AI service is currently unavailable";
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: message },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const quickPrompts = listingCtx?.title ? LISTING_QUICK_PROMPTS : QUICK_PROMPTS;
  const showEmptyState = messages.length === 0;

  return (
    <div className="fixed bottom-20 right-4 sm:right-5 md:bottom-8 md:right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[340px] sm:w-[390px] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold text-sm">{t("ai.assistant")}</span>
              {listingCtx?.title && (
                <span className="text-[10px] opacity-70 hidden sm:block truncate max-w-[120px]">· {listingCtx.title}</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-primary-foreground hover:bg-primary/80"
              onClick={() => setOpen(false)}
              data-testid="button-chat-close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Listing context notice */}
          {listingCtx?.title && messages.length === 0 && (
            <div className="px-3 pt-2">
              <div className="flex items-start gap-1.5 bg-primary/5 border border-primary/15 rounded-lg px-2.5 py-2 text-[11px] text-muted-foreground">
                <Info className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
                <span>{t("ai.iKnowAbout")} <strong className="text-foreground">{listingCtx.title}</strong> {t("ai.askAnything")}</span>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[260px] max-h-[360px]">
            {showEmptyState && (
              <div className="text-center text-muted-foreground py-6 px-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {listingCtx?.title ? t("ai.askAboutDeal") : t("ai.greeting")}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {listingCtx?.title ? t("ai.dealInfo") : t("ai.generalInfo")}
                </p>
                <div className="flex flex-col gap-1.5">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-xs text-left px-3 py-2 rounded-lg border border-border/60 bg-muted/40 hover:bg-primary/5 hover:border-primary/30 transition-all duration-150 text-foreground/80 hover:text-foreground"
                      data-testid={`quick-prompt-${prompt.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                data-testid={`msg-${msg.role}-${i}`}
              >
                <div className={`max-w-[82%] ${msg.role === "user" ? "" : ""}`}>
                  <div
                    className={`rounded-xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "assistant" && (
                    <ProviderBadge provider={msg.provider} model={msg.model} />
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl rounded-bl-none px-3 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t flex gap-2 items-end bg-muted/20">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("ai.placeholder")}
              className="resize-none min-h-[40px] max-h-[100px] text-sm bg-background"
              rows={1}
              data-testid="input-chat-message"
            />
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="shrink-0"
              data-testid="button-chat-send"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Toggle button with pulsing dot when closed */}
      <div className="relative">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-xl"
          onClick={() => setOpen((v) => !v)}
          data-testid="button-chat-toggle"
        >
          {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>
        {!open && (
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
        )}
      </div>
    </div>
  );
}
