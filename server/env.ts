/**
 * Central environment validation.
 * Import `env` from here instead of reading process.env directly.
 * Fails fast at startup with a readable error listing every missing / malformed var.
 */
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),

  // Public app origin — used for CORS, email links, etc.
  APP_ORIGIN: z.string().url().default("https://grouperry.com"),

  // Primary admin — only required in production; dev can run without it.
  PRIMARY_ADMIN_EMAIL: z.string().email().optional(),

  // External services — all optional so local dev boots without them
  RESEND_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  GCS_BUCKET_NAME: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  PORT: z.string().default("5000"),
});

function parseEnv() {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error(`\n❌  Environment validation failed:\n${missing}\n`);
    process.exit(1);
  }

  const data = result.data;

  // In production, PRIMARY_ADMIN_EMAIL is mandatory.
  if (data.NODE_ENV === "production" && !data.PRIMARY_ADMIN_EMAIL) {
    console.error("\n❌  PRIMARY_ADMIN_EMAIL is required in production.\n");
    process.exit(1);
  }

  return data;
}

export const env = parseEnv();
