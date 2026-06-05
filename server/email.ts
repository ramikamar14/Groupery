import nodemailer from "nodemailer";
import type { SmtpConfig } from "../shared/types.js";

export function createTransporter(cfg: SmtpConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    requireTLS: cfg.port === 587,
    auth: { user: cfg.fromEmail, pass: cfg.password },
    tls: { rejectUnauthorized: false },
  });
}

export async function testSmtp(cfg: SmtpConfig): Promise<{ ok: boolean; error?: string }> {
  try {
    const transport = createTransporter(cfg);
    await transport.verify();
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function substituteVariables(
  html: string,
  contact: Record<string, string>,
  mapping: { emailField: string; firstNameField?: string; lastNameField?: string; customFields?: Record<string, string> }
): string {
  let result = html;

  const email = contact[mapping.emailField] ?? "";
  const firstName = mapping.firstNameField ? (contact[mapping.firstNameField] ?? "") : "";
  const lastName = mapping.lastNameField ? (contact[mapping.lastNameField] ?? "") : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || email;

  result = result
    .replace(/\{\{email\}\}/gi, email)
    .replace(/\{\{firstName\}\}/gi, firstName)
    .replace(/\{\{first_name\}\}/gi, firstName)
    .replace(/\{\{lastName\}\}/gi, lastName)
    .replace(/\{\{last_name\}\}/gi, lastName)
    .replace(/\{\{name\}\}/gi, fullName)
    .replace(/\{\{fullName\}\}/gi, fullName)
    .replace(/\{\{full_name\}\}/gi, fullName);

  if (mapping.customFields) {
    for (const [placeholder, colName] of Object.entries(mapping.customFields)) {
      const value = contact[colName] ?? "";
      result = result.replace(new RegExp(`\\{\\{${placeholder}\\}\\}`, "gi"), value);
    }
  }

  // Replace any remaining mapped column names directly
  for (const [key, value] of Object.entries(contact)) {
    const safe = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(`\\{\\{${safe}\\}\\}`, "gi"), value);
  }

  return result;
}
