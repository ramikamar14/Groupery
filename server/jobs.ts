import { nanoid } from "nanoid";
import type { JobStatus, SendJobRequest, SendResult } from "../shared/types.js";
import { createTransporter, substituteVariables } from "./email.js";

const jobs = new Map<string, JobStatus>();

export function getJob(id: string): JobStatus | undefined {
  return jobs.get(id);
}

export function startSendJob(req: SendJobRequest): string {
  const id = nanoid();
  const total = req.contacts.length;

  const job: JobStatus = {
    id,
    total,
    processed: 0,
    sent: 0,
    failed: 0,
    done: false,
    results: [],
    startedAt: new Date().toISOString(),
  };

  jobs.set(id, job);

  processSendJob(id, req).catch((err) => {
    const j = jobs.get(id);
    if (j) {
      j.done = true;
      j.error = err instanceof Error ? err.message : String(err);
    }
  });

  return id;
}

async function processSendJob(jobId: string, req: SendJobRequest): Promise<void> {
  const job = jobs.get(jobId)!;
  const transporter = createTransporter(req.smtp);

  const fromAddress = req.smtp.fromName
    ? `"${req.smtp.fromName}" <${req.smtp.fromEmail}>`
    : req.smtp.fromEmail;

  for (const contact of req.contacts) {
    const email = contact[req.fieldMapping.emailField]?.trim();
    if (!email) {
      job.processed++;
      job.failed++;
      job.results.push({ email: "(missing)", name: "", status: "failed", error: "No email address" });
      continue;
    }

    const firstName = req.fieldMapping.firstNameField ? contact[req.fieldMapping.firstNameField] ?? "" : "";
    const lastName = req.fieldMapping.lastNameField ? contact[req.fieldMapping.lastNameField] ?? "" : "";
    const name = [firstName, lastName].filter(Boolean).join(" ") || email;

    const personalizedHtml = substituteVariables(req.html, contact, req.fieldMapping);
    const personalizedSubject = substituteVariables(req.subject, contact, req.fieldMapping);

    const mailOptions: Record<string, unknown> = {
      from: fromAddress,
      to: email,
      subject: personalizedSubject,
      html: personalizedHtml,
    };

    if (req.replyTo) {
      mailOptions.replyTo = req.replyTo;
    }

    const result: SendResult = { email, name, status: "sent" };

    try {
      await transporter.sendMail(mailOptions);
      job.sent++;
    } catch (err) {
      result.status = "failed";
      result.error = err instanceof Error ? err.message : String(err);
      job.failed++;
    }

    job.processed++;
    job.results.push(result);

    // Throttle: 3 emails/second to avoid hitting O365 rate limits
    await new Promise((r) => setTimeout(r, 333));
  }

  job.done = true;

  // Keep job in memory for 1 hour then clean up
  setTimeout(() => jobs.delete(jobId), 60 * 60 * 1000);
}
