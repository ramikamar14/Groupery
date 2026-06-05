import { useState } from "react";
import type { SmtpConfig } from "@shared/types";
import { testSmtp } from "../lib/api";

interface Props {
  smtp: SmtpConfig;
  onChange: (smtp: SmtpConfig) => void;
  onNext: () => void;
}

const PRESETS = [
  { label: "Accor O365 (Standard)", host: "smtp.office365.com", port: 587 },
  { label: "Gmail SMTP", host: "smtp.gmail.com", port: 587 },
  { label: "Custom", host: "", port: 587 },
];

export default function Step1_SmtpConfig({ smtp, onChange, onNext }: Props) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const set = (field: keyof SmtpConfig, value: string | number) =>
    onChange({ ...smtp, [field]: value });

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testSmtp(smtp);
      setTestResult(result);
    } catch {
      setTestResult({ ok: false, error: "Network error" });
    } finally {
      setTesting(false);
    }
  };

  const canProceed = smtp.fromEmail && smtp.password && smtp.host && smtp.port;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="font-serif text-3xl font-semibold text-navy-900 mb-2">Sender Configuration</h2>
        <p className="text-gray-500 text-sm">Connect your Accor / Fairmont email account via O365 SMTP.</p>
      </div>

      {/* Preset selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Preset</label>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => onChange({ ...smtp, host: p.host, port: p.port })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                ${smtp.host === p.host && smtp.port === p.port
                  ? "border-gold-500 bg-gold-50 text-gold-700"
                  : "border-gray-200 text-gray-600 hover:border-gold-300"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        {/* From Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Display Name <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={smtp.fromName}
            onChange={(e) => set("fromName", e.target.value)}
            placeholder="e.g. Rami Kamar — Fairmont Dubai"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
          />
        </div>

        {/* From Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            From Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={smtp.fromEmail}
            onChange={(e) => set("fromEmail", e.target.value)}
            placeholder="your.name@fairmont.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Password / App Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={smtp.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Your O365 password or app password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            If MFA is enabled, generate an App Password from your Microsoft account settings.
          </p>
        </div>

        {/* Host & Port */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">SMTP Host</label>
            <input
              type="text"
              value={smtp.host}
              onChange={(e) => set("host", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Port</label>
            <select
              value={smtp.port}
              onChange={(e) => set("port", parseInt(e.target.value, 10))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white"
            >
              <option value={587}>587 (TLS)</option>
              <option value={465}>465 (SSL)</option>
              <option value={25}>25</option>
            </select>
          </div>
        </div>

        {/* Test result */}
        {testResult && (
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium
              ${testResult.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}
          >
            {testResult.ok ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Connection successful! Ready to send.
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {testResult.error ?? "Connection failed"}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handleTest}
          disabled={!canProceed || testing}
          className="flex items-center gap-2 px-5 py-2.5 border border-gold-500 text-gold-700 rounded-lg text-sm font-medium hover:bg-gold-50 disabled:opacity-40 transition-all"
        >
          {testing ? (
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.06 1.18 2 2 0 012.03 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
            </svg>
          )}
          Test Connection
        </button>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 disabled:opacity-40 transition-all"
        >
          Continue
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
