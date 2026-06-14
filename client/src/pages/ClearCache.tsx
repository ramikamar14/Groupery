import { useEffect, useState } from "react";
import { LogoIcon } from "@/components/Logo";

export default function ClearCache() {
  const [status, setStatus] = useState<"working" | "done" | "error">("working");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function run() {
      try {
        const steps: string[] = [];

        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const reg of regs) await reg.unregister();
          steps.push(`${regs.length} SW unregistered`);
        }

        if ("caches" in window) {
          const keys = await caches.keys();
          for (const key of keys) await caches.delete(key);
          steps.push(`${keys.length} caches cleared`);
        }

        try { sessionStorage.clear(); } catch (_) {}

        setMessage(steps.length ? steps.join(", ") : "Nothing to clear");
        setStatus("done");
        setTimeout(() => { window.location.replace("/"); }, 1500);
      } catch (e: any) {
        setMessage(e?.message ?? "Unknown error");
        setStatus("error");
      }
    }
    run();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="bg-card border border-border rounded-2xl shadow-lg p-10 max-w-sm w-full text-center space-y-4">
        <LogoIcon size={40} className="mx-auto" />
        <h1 className="text-xl font-bold font-display">
          {status === "working" ? "Clearing cache…" : status === "done" ? "All clear!" : "Error"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {status === "working"
            ? "Removing old files so you get the latest version."
            : status === "done"
            ? `Done — ${message}. Redirecting…`
            : message}
        </p>
        {status === "done" && (
          <a href="/" className="inline-block bg-primary text-primary-foreground font-semibold text-sm px-6 py-2.5 rounded-full">
            Go to Grouperry
          </a>
        )}
        {status === "error" && (
          <a href="/" className="inline-block bg-primary text-primary-foreground font-semibold text-sm px-6 py-2.5 rounded-full">
            Go home anyway
          </a>
        )}
      </div>
    </div>
  );
}
