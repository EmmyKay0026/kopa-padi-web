"use client";

import { useEffect, useRef, useState } from "react";
import { Bug, Send, X } from "lucide-react";
import Link from "next/link";
import { api, API_URL } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export function BugReportWidget() {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const session = authClient.useSession();
  useEffect(() => {
    const controller = new AbortController();
    let request: AbortController | undefined;
    const refresh = async () => {
      request?.abort();
      const currentRequest = new AbortController();
      request = currentRequest;
      const signal = AbortSignal.any([controller.signal, currentRequest.signal, AbortSignal.timeout(8000)]);
      try {
        const response = await fetch(`${API_URL}/api/test-mode`, { cache: "no-store", signal });
        const config = response.ok ? await response.json() : null;
        if (!signal.aborted) setEnabled(config?.enabled === true);
      } catch { if (!controller.signal.aborted && !currentRequest.signal.aborted) setEnabled(false); }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60000);
    window.addEventListener("focus", refresh);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);
  useEffect(() => { if (!enabled) dialog.current?.close(); }, [enabled]);
  if (!enabled) return null;
  return <>
    <button type="button" onClick={() => { setMessage(""); setError(""); dialog.current?.showModal(); }}
      className="fixed bottom-24 right-4 z-40 flex min-h-12 items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg lg:bottom-6"
      aria-haspopup="dialog"><Bug size={20} aria-hidden="true" />Report a bug</button>
    <dialog ref={dialog} aria-labelledby="bug-report-title" className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-border bg-white p-6 text-foreground shadow-xl backdrop:bg-black/40">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="bug-report-title" className="text-xl font-bold">Report a bug</h2>
        <button type="button" aria-label="Close bug report" className="grid h-11 w-11 place-items-center rounded-lg" onClick={() => dialog.current?.close()}><X size={20} aria-hidden="true" /></button>
      </div>
      {session.isPending ? <p role="status">Checking your session...</p> : !session.data ? <p>Please <Link className="font-bold text-primary underline" href="/login" onClick={() => dialog.current?.close()}>sign in</Link> to send a report to the admin team.</p> : message ? <p role="status">{message}</p> : <form className="grid gap-4" onSubmit={async event => {
        event.preventDefault();
        if (busy) return;
        const form = event.currentTarget;
        const data = new FormData(form);
        setBusy(true); setError("");
        try {
          const result = await api<{ id: string }>("/bug-reports", { method: "POST", body: JSON.stringify({ title: data.get("title"), description: data.get("description") }) });
          form.reset(); setMessage(`Report received. Reference: ${result.id}`);
        } catch { setError("Your report was not confirmed. Please try again. Reporting may have been disabled."); }
        finally { setBusy(false); }
      }}>
        <p className="text-sm text-muted">Tell us what went wrong and how to reproduce it. Reports are visible to administrators. Do not include passwords, tokens, documents or precise locations. For safety concerns, use the Safety Centre.</p>
        <label className="grid gap-1 text-sm font-semibold">Summary<input name="title" required minLength={5} maxLength={160} className="field" autoFocus /></label>
        <label className="grid gap-1 text-sm font-semibold">What happened?<textarea name="description" required minLength={10} maxLength={4000} rows={6} className="field" placeholder="Steps to reproduce, what you expected, and what actually happened. Include the page name if helpful." /></label>
        {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
        <button type="submit" disabled={busy} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-white disabled:opacity-50"><Send size={18} aria-hidden="true" />{busy ? "Sending..." : "Send report"}</button>
      </form>}
    </dialog>
  </>;
}
