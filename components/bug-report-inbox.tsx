"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bug, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { UserMobileMenu } from "./user-navigation";

type Report = { id: string; title: string; description: string; reporterUserId: string; status: "OPEN" | "RESOLVED"; createdAt: string };
export function BugReportInbox() {
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setReports(await api<Report[]>("/admin/bug-reports")); }
    catch { setError("Unable to load reports. An active admin account is required."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 text-foreground">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div><Link href="/admin/operations" className="text-sm font-bold text-primary">Back to operations</Link><h1 className="mt-3 flex items-center gap-2 text-2xl font-bold"><Bug aria-hidden="true" />Bug reports</h1></div>
      <UserMobileMenu admin />
      <button type="button" disabled={loading || saving} onClick={() => void load()} className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 font-bold disabled:opacity-50"><RefreshCw size={18} aria-hidden="true" />Refresh</button>
    </header>
    <p className="mb-5 text-sm text-muted">Latest 100 reports, newest first. Reports remain available when test mode is off.</p>
    {error ? <p role="alert" className="mb-4 text-red-700">{error}</p> : null}
    {loading ? <p role="status">Loading reports...</p> : !error && !reports.length ? <p>No bug reports yet.</p> : null}
    <div className="grid gap-4">{reports.map(report => <article key={report.id} className="min-w-0 rounded-xl border border-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><h2 className="break-words text-lg font-bold">{report.title}</h2><span className="text-xs font-bold">{report.status}</span></div>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm">{report.description}</p>
      <p className="mt-4 break-all text-xs text-muted">Reference: {report.id}<br />Reporter: {report.reporterUserId}<br />Submitted: {new Date(report.createdAt).toLocaleString()}</p>
      <button type="button" disabled={saving || loading} className="mt-4 min-h-11 rounded-lg border border-border px-3 text-sm font-bold disabled:opacity-50" onClick={async () => {
        setSaving(true); setError("");
        try {
          const updated = await api<Report>(`/admin/bug-reports/${report.id}`, { method: "PATCH", body: JSON.stringify({ status: report.status === "OPEN" ? "RESOLVED" : "OPEN" }) });
          setReports(current => current.map(row => row.id === updated.id ? updated : row));
        } catch { setError("Could not update the report. Please try again."); }
        finally { setSaving(false); }
      }}>{report.status === "OPEN" ? "Mark resolved" : "Reopen"}</button>
    </article>)}</div>
  </main>;
}
