import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

// ─── Client Initialisation ────────────────────────────────────────────────────

const openaiApiKey = process.env.OPENAI_API_KEY;
const anthropicApiKey = process.env.SONNET || process.env.ANTHROPIC_API_KEY;

export const openai = new OpenAI({ apiKey: openaiApiKey || "not-configured" });
export const anthropic = new Anthropic({ apiKey: anthropicApiKey || "not-configured" });

// ─── Types ────────────────────────────────────────────────────────────────────

export type AIProvider = "claude" | "openai";

export interface AIResult {
  provider: AIProvider;
  model: string;
  text: string;
}

// ─── Unavailability Cache ─────────────────────────────────────────────────────
// Tracks models that failed so we don't retry them in the same session.
// Cleared every 6 hours so newly granted access is picked up automatically.

const unavailable = new Set<string>();
let resetTimer: ReturnType<typeof setInterval> | null = null;

function ensureResetTimer() {
  if (!resetTimer) {
    resetTimer = setInterval(() => {
      unavailable.clear();
      console.log("[AI] Availability cache cleared — retrying preferred providers.");
    }, 6 * 60 * 60 * 1000);
    resetTimer.unref?.();
  }
}

// ─── Provider Implementations ─────────────────────────────────────────────────

async function tryClaude(prompt: string, maxTokens: number): Promise<AIResult> {
  if (!anthropicApiKey) throw new Error("Anthropic API key not configured");

  const models = [
    "claude-sonnet-4-5", // Primary — Claude Sonnet as specified by user
    "claude-sonnet-4-0", // Fallback Sonnet
  ];

  for (const model of models) {
    if (unavailable.has(`claude:${model}`)) continue;

    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      });
      const text = (response.content[0] as { type: string; text: string }).text;
      console.log(`[AI] Provider: claude | Model: ${model}`);
      return { provider: "claude", model, text };
    } catch (err) {
      const status = (err as any)?.status;
      const msg = String((err as any)?.message || "").toLowerCase();
      if (status === 404 || status === 403 || msg.includes("not found")) {
        console.warn(`[AI] Claude model ${model} unavailable — trying next…`);
        unavailable.add(`claude:${model}`);
        continue;
      }
      throw err;
    }
  }

  throw new Error("No Claude models available on this API key.");
}

async function tryOpenAI(prompt: string): Promise<AIResult> {
  if (!openaiApiKey) throw new Error("OPENAI_API_KEY not configured");
  if (unavailable.has("openai:gpt-4o-mini")) throw new Error("gpt-4o-mini marked unavailable");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.choices[0].message.content || "";
    console.log("[AI] Provider: openai | Model: gpt-4o-mini");
    return { provider: "openai", model: "gpt-4o-mini", text };
  } catch (err) {
    const status = (err as any)?.status;
    if (status === 404 || status === 403) {
      unavailable.add("openai:gpt-4o-mini");
    }
    throw err;
  }
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export async function callAI(
  prompt: string,
  maxTokens = 1024,
  _task = ""
): Promise<AIResult> {
  ensureResetTimer();

  // 1. Try Claude (primary)
  if (anthropicApiKey) {
    try {
      return await tryClaude(prompt, maxTokens);
    } catch (err) {
      console.warn(`[AI] Claude failed — falling back to OpenAI. Reason: ${(err as any)?.message}`);
    }
  }

  // 2. Try OpenAI (secondary)
  if (openaiApiKey) {
    try {
      return await tryOpenAI(prompt);
    } catch (err) {
      console.warn(`[AI] OpenAI failed. Reason: ${(err as any)?.message}`);
    }
  }

  // All providers exhausted
  console.error("[AI] All providers failed — returning fallback response.");
  return { provider: "claude", model: "none", text: "AI is not available right now. Please try again later." };
}
