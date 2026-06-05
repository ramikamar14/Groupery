import { useState, useEffect, useRef } from "react";
import type { JobStatus } from "@shared/types";
import type { WizardState } from "../App";
import { startSendJob, pollJob } from "../lib/api";
import { substituteVariables } from "../lib/substitute";

interface Props {
  state: WizardState;
  onBack: () => void;
}

export default function Step4_Send({ state, onBack }: Props) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const firstContact = state.contacts[0] ?? {};
  const previewHtml = substituteVariables(state.html, firstContact, state.fieldMapping);
  const previewSubject = substituteVariables(state.subject, firstContact, state.fieldMapping);

  const startSend = async () => {
    setSending(true);
    setError("");
    try {
      const { jobId: id } = await startSendJob({
        smtp: state.smtp,
        subject: state.subject,
        html: state.html,
        contacts: state.contacts,
        fieldMapping: state.fieldMapping,
        replyTo: state.replyTo || undefined,
      });
      setJobId(id);

      pollRef.current = setInterval(async () => {
        const status = await pollJob(id);
        setJobStatus(status);
        if (status.done) {
          clearInterval(pollRef.current!);
          setSending(false);
        }
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start sending");
      setSending(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const pct = jobStatus ? Math.round((jobStatus.processed / jobStatus.total) * 100) : 0;
  const done = jobStatus?.done ?? false;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="font-serif text-3xl font-semibold text-navy-900 mb-2">Review & Send</h2>
        <p className="text-gray-500 text-sm">Check the summary below, preview the personalised email, then send.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "From", value: state.smtp.fromEmail, icon: "📤" },
          { label: "Recipients", value: `${state.contacts.length} contacts`, icon: "👥" },
          { label: "Subject", value: state.subject || "(no subject)", icon: "✉️" },
          { label: "SMTP", value: `${state.smtp.host}:${state.smtp.port}`, icon: "🔌" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="text-xl mb-1">{c.icon}</div>
            <p className="text-xs text-gray-400 mb-0.5">{c.label}</p>
            <p className="text-sm font-semibold text-navy-900 truncate" title={c.value}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Preview toggle */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
        <button
          onClick={() => setPreview((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Preview email (personalised for first recipient)
            {firstContact[state.fieldMapping.firstNameField ?? ""] && (
              <span className="text-xs bg-gold-50 text-gold-700 px-2 py-0.5 rounded-full border border-gold-200">
                {firstContact[state.fieldMapping.firstNameField ?? ""] || "Recipient 1"}
              </span>
            )}
          </div>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`transition-transform ${preview ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {preview && (
          <div className="border-t border-gray-100">
            <div className="px-5 py-2.5 border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
              Subject: <span className="font-medium text-gray-800">{previewSubject || "(no subject)"}</span>
            </div>
            <iframe
              srcDoc={previewHtml || "<p style='color:#aaa;padding:16px;font-family:sans-serif;'>No content</p>"}
              className="w-full"
              style={{ height: "420px" }}
              sandbox="allow-same-origin"
              title="Email preview"
            />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700 mb-5">
          {error}
        </div>
      )}

      {/* Progress */}
      {jobStatus && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-800">
              {done ? "Send Complete" : "Sending…"}
            </span>
            <span className="text-sm text-gray-500">
              {jobStatus.processed} / {jobStatus.total}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ${done ? "bg-green-500" : "bg-gold-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-navy-900">{jobStatus.processed}</p>
              <p className="text-xs text-gray-500 mt-0.5">Processed</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{jobStatus.sent}</p>
              <p className="text-xs text-green-600 mt-0.5">Sent</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-700">{jobStatus.failed}</p>
              <p className="text-xs text-red-500 mt-0.5">Failed</p>
            </div>
          </div>

          {/* Results log */}
          {jobStatus.results.length > 0 && (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-100">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-500 font-medium">Recipient</th>
                    <th className="px-3 py-2 text-left text-gray-500 font-medium">Email</th>
                    <th className="px-3 py-2 text-left text-gray-500 font-medium">Status</th>
                    <th className="px-3 py-2 text-left text-gray-500 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {jobStatus.results.map((r, i) => (
                    <tr key={i} className="border-t border-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-700">{r.name || "—"}</td>
                      <td className="px-3 py-2 text-gray-500">{r.email}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium
                          ${r.status === "sent" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {r.status === "sent" ? "✓ Sent" : "✗ Failed"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-400 truncate max-w-[200px]">{r.error ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Download results */}
          {done && (
            <button
              onClick={() => {
                const csv = [
                  "Name,Email,Status,Error",
                  ...jobStatus.results.map(
                    (r) => `"${r.name}","${r.email}","${r.status}","${r.error ?? ""}"`
                  ),
                ].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `send-results-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
              }}
              className="mt-4 flex items-center gap-2 px-4 py-2 border border-gold-300 text-gold-700 rounded-lg text-xs font-medium hover:bg-gold-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Results CSV
            </button>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={sending}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        {!jobId ? (
          <button
            onClick={startSend}
            disabled={sending}
            className="flex items-center gap-2 px-7 py-2.5 bg-gold-500 text-white rounded-lg text-sm font-bold hover:bg-gold-600 shadow-lg shadow-gold-200 disabled:opacity-40 transition-all"
          >
            {sending ? (
              <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
            Send {state.contacts.length} Emails
          </button>
        ) : done ? (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Completed — {jobStatus?.sent}/{jobStatus?.total} sent
          </div>
        ) : (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-white rounded-lg text-sm font-semibold animate-pulse">
            Sending {pct}%…
          </div>
        )}
      </div>
    </div>
  );
}
