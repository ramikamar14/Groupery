type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  category: string;
  message: string;
  meta?: Record<string, any>;
  timestamp: string;
}

const PII_KEYS = new Set([
  "email", "phone", "firstName", "lastName", "bio", "location",
  "otp", "token", "password", "address", "lat", "lng",
  "latitude", "longitude", "profileImageUrl", "ip",
  "paymentDetails", "paymentNotes", "paymentMethod",
]);

function sanitizeValue(k: string, v: any): any {
  if (PII_KEYS.has(k)) return "[REDACTED]";
  if (v === null || v === undefined) return v;
  if (Array.isArray(v)) return v.map((item) =>
    item !== null && typeof item === "object" && !Array.isArray(item)
      ? sanitizeMeta(item as Record<string, any>)
      : item
  );
  if (typeof v === "object") return sanitizeMeta(v as Record<string, any>);
  return v;
}

function sanitizeMeta(meta?: Record<string, any>): Record<string, any> | undefined {
  if (!meta) return undefined;
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(meta)) {
    cleaned[k] = sanitizeValue(k, v);
  }
  return cleaned;
}

function formatLog(entry: LogEntry): string {
  const meta = entry.meta ? ` | ${JSON.stringify(entry.meta)}` : "";
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.category}] ${entry.message}${meta}`;
}

function log(level: LogLevel, category: string, message: string, meta?: Record<string, any>) {
  const entry: LogEntry = {
    level,
    category,
    message,
    meta: sanitizeMeta(meta),
    timestamp: new Date().toISOString(),
  };
  const formatted = formatLog(entry);
  if (level === "error") {
    console.error(formatted);
  } else if (level === "warn") {
    console.warn(formatted);
  } else {
    console.log(formatted);
  }
}

// Allow callers to pass either (category, message, meta) or the looser
// (category, meta) form where the second argument is the metadata object.
type MsgOrMeta = string | Record<string, any> | undefined;
function normalize(messageOrMeta: MsgOrMeta, meta?: Record<string, any>): { message: string; meta?: Record<string, any> } {
  if (typeof messageOrMeta === "string") return { message: messageOrMeta, meta };
  return { message: "", meta: messageOrMeta ?? meta };
}

export const logger = {
  info: (category: string, messageOrMeta?: MsgOrMeta, meta?: Record<string, any>) => {
    const n = normalize(messageOrMeta, meta); log("info", category, n.message, n.meta);
  },
  warn: (category: string, messageOrMeta?: MsgOrMeta, meta?: Record<string, any>) => {
    const n = normalize(messageOrMeta, meta); log("warn", category, n.message, n.meta);
  },
  error: (category: string, messageOrMeta?: MsgOrMeta, meta?: Record<string, any>) => {
    const n = normalize(messageOrMeta, meta); log("error", category, n.message, n.meta);
  },
  debug: (category: string, messageOrMeta?: MsgOrMeta, meta?: Record<string, any>) => {
    if (process.env.NODE_ENV !== "production") { const n = normalize(messageOrMeta, meta); log("debug", category, n.message, n.meta); }
  },

  adminAction: (adminId: string, action: string, meta?: Record<string, any>) =>
    log("info", "ADMIN", action, { adminId, ...meta }),

  aiUsage: (model: string, endpoint: string, durationMs: number, meta?: Record<string, any>) =>
    log("info", "AI", `${endpoint} → ${model}`, { durationMs, ...meta }),

  apiError: (method: string, path: string, statusCode: number, message: string, meta?: Record<string, any>) =>
    log("error", "API", `${method} ${path} → ${statusCode}`, { message, ...meta }),

  security: (event: string, meta?: Record<string, any>) =>
    log("warn", "SECURITY", event, meta),
};
