import type { SmtpConfig, ExcelParseResult, MsgParseResult, SendJobRequest, JobStatus } from "@shared/types";

const BASE = "/api";

export async function testSmtp(cfg: SmtpConfig): Promise<{ ok: boolean; error?: string }> {
  const r = await fetch(`${BASE}/smtp/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cfg),
  });
  return r.json();
}

export async function parseExcel(file: File): Promise<ExcelParseResult> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${BASE}/contacts/parse-excel`, { method: "POST", body: fd });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: "Failed to parse Excel" }));
    throw new Error(err.error);
  }
  return r.json();
}

export async function parseMsgFile(file: File): Promise<MsgParseResult> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${BASE}/email/parse-msg`, { method: "POST", body: fd });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: "Failed to parse MSG" }));
    throw new Error(err.error);
  }
  return r.json();
}

export async function startSendJob(req: SendJobRequest): Promise<{ jobId: string }> {
  const r = await fetch(`${BASE}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: "Failed to start job" }));
    throw new Error(err.error);
  }
  return r.json();
}

export async function pollJob(jobId: string): Promise<JobStatus> {
  const r = await fetch(`${BASE}/jobs/${jobId}`);
  if (!r.ok) throw new Error("Job not found");
  return r.json();
}
