"use client";

import { BrandLogo } from "@/components/brand-logo";
import { api } from "@/lib/api";
import { intakeLabel, type NyscIntake } from "@/lib/active-intake";
import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { UserMobileMenu } from "./user-navigation";

const navigation = [
  ["State guides", "/admin/state-guides"],
  ["Operations", "/admin/operations"], ["NYSC intakes", "/admin/intakes"],
  ["Verifications", "/admin/verifications"], ["Geography", "/admin/geography"],
  ["Orientation Camps", "/admin/orientation-camps"], ["Journey Guides", "/admin/journey-guides"], ["Safety", "/admin/safety"],
] as const;

export function IntakeAdmin() {
  const [rows, setRows] = useState<NyscIntake[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null);
  const [change, setChange] = useState<{ target: NyscIntake; action: "activate" | "close"; expectedActiveId: string | null } | null>(null);
  const active = rows.find((row) => row.status === "ACTIVE");

  const load = useCallback(async () => {
    try {
      setRows(await api<NyscIntake[]>("/admin/intakes"));
      setFailed(false);
    } catch (error) {
      setFailed(true);
      setNotice({ error: true, text: error instanceof Error ? error.message : "Intakes could not be loaded." });
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setNotice(null);
    try {
      await api("/admin/intakes", { method: "POST", body: JSON.stringify({
        serviceYear: String(data.get("serviceYear")), batch: String(data.get("batch")), stream: String(data.get("stream")),
        orientationStartDate: data.get("orientationStartDate") || null, orientationEndDate: data.get("orientationEndDate") || null,
      }) });
      form.reset();
      await load();
      setNotice({ error: false, text: "Intake added. Activate it when you are ready to open verification and trips." });
    } catch (error) { setNotice({ error: true, text: error instanceof Error ? error.message : "Intake could not be added." }); }
    finally { setBusy(false); }
  }

  async function confirmChange() {
    if (!change || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      await api(`/admin/intakes/${change.target.id}/${change.action}`, { method: "POST", body: JSON.stringify({ expectedActiveId: change.expectedActiveId }) });
      const text = change.action === "activate" ? `${intakeLabel(change.target)} is now open.` : "The intake is closed for new verifications and trips.";
      setChange(null);
      await load();
      setNotice({ error: false, text });
    } catch (error) {
      setChange(null);
      await load();
      setNotice({ error: true, text: error instanceof Error ? error.message : "The active intake could not be changed." });
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r bg-white p-5 lg:block">
        <BrandLogo href="/admin/operations" />
        <p className="mt-2 text-xs text-muted">Admin</p>
        <nav aria-label="Admin navigation" className="mt-8 grid gap-2">
          {navigation.map(([label, href]) => <Link key={href} href={href} aria-current={href === "/admin/intakes" ? "page" : undefined} className={`rounded-xl px-4 py-3 text-sm font-semibold ${href === "/admin/intakes" ? "bg-primary-light/60 text-primary" : "text-muted hover:bg-background"}`}>{label}</Link>)}
        </nav>
      </aside>
      <div className="lg:pl-60">
        <header className="flex min-h-20 items-center justify-between gap-4 border-b bg-white px-5 sm:px-8">
          <div><p className="eyebrow">Administration</p><h1 className="mt-1 text-2xl font-black">NYSC intakes</h1></div>
          <UserMobileMenu admin />
        </header>
        <main className="mx-auto max-w-6xl space-y-6 p-5 pb-16 sm:p-8">
          <p className="max-w-3xl text-sm leading-7 text-muted">Set the service year, batch and stream open for new verifications and trips. Only one intake can be active at a time. Existing trips and verification records keep their original assignment.</p>
          {notice ? <p role={notice.error ? "alert" : "status"} className={`rounded-xl border p-4 text-sm ${notice.error ? "border-red-200 bg-red-50 text-red-800" : "border-primary/20 bg-primary-light/40 text-primary-dark"}`}>{notice.text}</p> : null}
          {loading ? <p role="status">Loading NYSC intakes…</p> : failed ? <button type="button" className="btn-primary" onClick={() => void load()}>Try again</button> : <>
            <section aria-labelledby="active-intake-heading" className="rounded-2xl border border-primary/20 bg-white p-6 shadow-soft">
              <p className="eyebrow">Open for new trips</p>
              <h2 id="active-intake-heading" className="mt-3 text-xl font-black">{active ? intakeLabel(active) : "No active intake"}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{active ? "Users are assigned this intake automatically during verification." : "Activate an intake below to open new verifications and trip planning."}</p>
              {active ? <button type="button" disabled={busy} className="mt-4 min-h-11 rounded-xl border px-4 text-sm font-semibold text-primary disabled:opacity-50" onClick={() => setChange({ target: active, action: "close", expectedActiveId: active.id })}>Close active intake</button> : null}
            </section>
            {change ? <section role="group" aria-label="Confirm intake change" className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h2 className="text-lg font-bold">{change.action === "activate" ? `Activate ${intakeLabel(change.target)}?` : `Close ${intakeLabel(change.target)}?`}</h2>
              <p className="mt-3 text-sm leading-7 text-amber-950">{change.action === "activate" ? "This will close the previous intake for new verifications and trips. Existing trips and journey history will remain available." : "New verifications and trips will pause until an intake is activated. Existing trips can continue."}</p>
              <div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={busy} className="btn-primary disabled:opacity-50" onClick={() => void confirmChange()}>{busy ? "Saving…" : change.action === "activate" ? "Activate intake" : "Close intake"}</button><button type="button" disabled={busy} onClick={() => setChange(null)} className="min-h-12 rounded-xl border bg-white px-5 font-semibold">Cancel</button></div>
            </section> : null}
            <section aria-labelledby="intakes-heading" className="rounded-2xl border bg-white p-6">
              <h2 id="intakes-heading" className="text-lg font-black">All intakes</h2>
              {rows.length ? <ul className="mt-4 divide-y">{rows.map((row) => <li key={row.id} className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"><div><h3 className="font-bold">{intakeLabel(row)}</h3><p className="mt-1 text-xs text-muted">{row.status === "COMPLETED" ? "Closed" : row.status === "ACTIVE" ? "Active" : row.status === "UPCOMING" ? "Upcoming" : "Archived"}{row.orientationStartDate ? ` · Orientation starts ${row.orientationStartDate}` : ""}</p></div>{row.status !== "ACTIVE" ? <button type="button" disabled={busy} aria-label={`Activate ${intakeLabel(row)}`} onClick={() => setChange({ target: row, action: "activate", expectedActiveId: active?.id ?? null })} className="min-h-11 shrink-0 rounded-xl border border-primary/25 px-4 text-sm font-bold text-primary disabled:opacity-50">Set active</button> : <span className="rounded-full bg-primary-light px-3 py-2 text-xs font-bold text-primary">Current intake</span>}</li>)}</ul> : <p className="mt-4 text-sm text-muted">Add the first intake below.</p>}
            </section>
            <section aria-labelledby="new-intake-heading" className="rounded-2xl border bg-white p-6">
              <h2 id="new-intake-heading" className="text-lg font-black">Add an upcoming intake</h2>
              <form className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={(event) => void create(event)}>
                <label className="grid gap-2 text-sm font-semibold">Service year<input className="field" name="serviceYear" type="number" min="2000" max="2099" defaultValue={new Date().getFullYear()} required /></label>
                <label className="grid gap-2 text-sm font-semibold">Batch<select className="field" name="batch" defaultValue="" required><option value="" disabled>Select batch</option>{["Batch A", "Batch B", "Batch C"].map((batch) => <option key={batch}>{batch}</option>)}</select></label>
                <label className="grid gap-2 text-sm font-semibold">Stream<select className="field" name="stream" defaultValue="" required><option value="" disabled>Select stream</option>{["Stream 1", "Stream 2"].map((stream) => <option key={stream}>{stream}</option>)}</select></label>
                <label className="grid gap-2 text-sm font-semibold">Orientation start (optional)<input className="field" name="orientationStartDate" type="date" /></label>
                <label className="grid gap-2 text-sm font-semibold">Orientation end (optional)<input className="field" name="orientationEndDate" type="date" /></label>
                <button className="btn-primary self-end disabled:opacity-50" disabled={busy}>{busy ? "Saving…" : "Add intake"}</button>
              </form>
            </section>
          </>}
        </main>
      </div>
    </div>
  );
}
