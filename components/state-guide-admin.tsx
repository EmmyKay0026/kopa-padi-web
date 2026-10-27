"use client";

import { BrandLogo } from "@/components/brand-logo";
import { StateGuidePhoto } from "@/components/state-guide-photo";
import { adminNavigation, UserMobileMenu } from "@/components/user-navigation";
import { api } from "@/lib/api";
import { formatGuideDate, researchSourceLabels, stateGuidePayload, type GuideContent, type StateGuideRecord } from "@/lib/state-guides";
import directory from "@/lib/data/state-directory.json";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";

type StateRow = { stateId: string; name: string; isActive: boolean; version: number | null; updatedAt: string | null; reviewedOn: string | null; reviewStatus: string | null };
const tabs = [["overview", "Overview"], ["secretariat", "Secretariat"], ["life", "Local life"], ["travel", "Travel & budget"], ["expectations", "Expectations"], ["photos", "Photos"], ["research", "Review & sources"]] as const;
type Tab = typeof tabs[number][0];
type InfoKey = keyof GuideContent["information"];
const infoFields: Record<"overview" | "life" | "travel", { key: InfoKey; label: string; short?: boolean }[]> = {
  overview: [{ key: "capital", label: "Capital", short: true }, { key: "geopoliticalZone", label: "Geopolitical zone", short: true }, { key: "overview", label: "State introduction" }],
  life: [{ key: "spokenLanguages", label: "Spoken languages" }, { key: "culturalHighlights", label: "Culture & community" }, { key: "localFood", label: "Local food" }, { key: "placesToVisit", label: "Places & heritage" }],
  travel: [{ key: "weatherAndClimate", label: "Weather & climate" }, { key: "transportOptions", label: "Getting around" }, { key: "travelSafetyNotes", label: "Travel & safety notes" }, { key: "costOfLiving", label: "Everyday costs & budgeting" }, { key: "pcmTips", label: "Tips for prospective corps members" }],
};
const contactFields = [{ key: "address", label: "Office address", type: "text" }, { key: "phoneNumber", label: "Phone number", type: "tel" }, { key: "email", label: "Email address", type: "email" }, { key: "googleMapsUrl", label: "Office map link", type: "url" }, { key: "sourceUrl", label: "Contact source link", type: "url" }] as const;
const refreshFields = ["travelSafetyNotes", "costOfLiving", "transportOptions", "pcmTips", "weatherAndClimate"] as const;
const refreshLabels: Record<string, string> = { travelSafetyNotes: "Travel & safety", costOfLiving: "Costs", transportOptions: "Transport", pcmTips: "Arrival tips", weatherAndClimate: "Weather" };
const lines = (text: string) => text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="grid min-w-0 gap-2 text-sm font-semibold"><span>{label}</span>{children}{hint ? <span className="text-xs font-normal leading-5 text-muted">{hint}</span> : null}</label>;
}

function canPreview(src: string) {
  if (/^\/(?!\/)/.test(src) && !src.includes("\\")) return true;
  try { const url = new URL(src); return url.protocol === "https:" && (url.hostname === "images.unsplash.com" || (url.hostname === "picsum.photos" && url.pathname.startsWith("/seed/"))); } catch { return false; }
}

export function StateGuideAdmin() {
  const [states, setStates] = useState<StateRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [guide, setGuide] = useState<StateGuideRecord | null>(null);
  const [baseline, setBaseline] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null);
  const dirty = guide !== null && JSON.stringify(stateGuidePayload(guide)) !== baseline;

  const loadStates = useCallback(async (signal?: AbortSignal) => {
    setListLoading(true);
    try {
      const rows = await api<StateRow[]>("/admin/state-guides", { signal });
      if (signal?.aborted) return;
      setStates(rows);
      setSelectedId(current => current || rows.find(row => row.stateId === new URLSearchParams(window.location.search).get("state"))?.stateId || rows[0]?.stateId || "");
    } catch (error) { if (!signal?.aborted) setNotice({ error: true, text: error instanceof Error ? error.message : "States could not be loaded." }); }
    finally { if (!signal?.aborted) setListLoading(false); }
  }, []);
  useEffect(() => { const controller = new AbortController(); void loadStates(controller.signal); return () => controller.abort(); }, [loadStates]);

  const loadGuide = useCallback(async (stateId: string, signal?: AbortSignal) => {
    setLoading(true);
    setNotice(null);
    try {
      const record = await api<StateGuideRecord>(`/admin/state-guides/${encodeURIComponent(stateId)}`, { signal });
      if (signal?.aborted) return;
      setGuide(record);
      setBaseline(JSON.stringify(stateGuidePayload(record)));
    } catch (error) { if (!signal?.aborted) { setGuide(null); setNotice({ error: true, text: error instanceof Error ? error.message : "Guide details could not be loaded." }); } }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);
  useEffect(() => { if (!selectedId) return; const controller = new AbortController(); setGuide(null); void loadGuide(selectedId, controller.signal); return () => controller.abort(); }, [selectedId, loadGuide]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const navigate = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest("a");
      if (!link || link.target === "_blank" || link.href === window.location.href) return;
      if (!window.confirm("Discard your unsaved guide changes?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", navigate, true);
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("click", navigate, true); };
  }, [dirty]);

  function choose(stateId: string) {
    if (stateId === selectedId || busy) return;
    if (dirty && !window.confirm("Discard your unsaved guide changes?")) return;
    setSelectedId(stateId); setTab("overview");
    window.history.replaceState(null, "", `/admin/state-guides?state=${encodeURIComponent(stateId)}`);
  }
  function info(key: InfoKey, value: string) { setGuide(current => current && ({ ...current, information: { ...current.information, [key]: value } })); }
  function contact(key: keyof GuideContent["secretariat"], value: string) { setGuide(current => current && ({ ...current, secretariat: { ...current.secretariat, [key]: value } })); }
  function research<K extends keyof GuideContent["research"]>(key: K, value: GuideContent["research"][K]) { setGuide(current => current && ({ ...current, research: { ...current.research, [key]: value } })); }
  function move(kind: "photos" | "expectations", index: number, offset: number) {
    setGuide(current => { if (!current) return current; const entries = [...current[kind]]; const target = index + offset; if (target < 0 || target >= entries.length) return current; [entries[index], entries[target]] = [entries[target], entries[index]]; return { ...current, [kind]: entries }; });
  }
  function incomplete(): { tab: Tab; text: string } | null {
    if (!guide) return null;
    for (const category of ["overview", "life", "travel"] as const) for (const field of infoFields[category]) if (!guide.information[field.key].trim()) return { tab: category, text: `Please complete ${field.label.toLowerCase()}.` };
    for (const field of contactFields) if (field.type !== "url" && !guide.secretariat[field.key].trim()) return { tab: "secretariat", text: `Please complete ${field.label.toLowerCase()}.` };
    for (const key of ["sourceUrl", "googleMapsUrl"] as const) {
      if (!guide.secretariat[key].trim()) continue;
      try { if (new URL(guide.secretariat[key]).protocol !== "https:") throw new Error(); }
      catch { return { tab: "secretariat", text: "Please use complete HTTPS links for the contact source and map." }; }
    }
    for (const urls of Object.values(guide.research.sources)) for (const url of lines(urls.join("\n"))) {
      try { if (new URL(url).protocol !== "https:") throw new Error(); }
      catch { return { tab: "research", text: "Please use complete HTTPS URLs for research sources, one per line." }; }
    }
    if (guide.photos.some(photo => !canPreview(photo.src) || !photo.alt.trim() || !photo.caption.trim())) return { tab: "photos", text: "Each photo needs a supported image URL, alternative text and a caption." };
    if (guide.expectations.some(item => !item.title.trim() || !item.description.trim())) return { tab: "expectations", text: "Each expectation needs a title and description." };
    if (!guide.research.reviewedOn || !guide.research.notes.trim()) return { tab: "research", text: "Please complete the review date and research notes." };
    return null;
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!guide || busy) return;
    const missing = incomplete();
    if (missing) { setTab(missing.tab); setNotice({ error: true, text: missing.text }); return; }
    setBusy(true); setNotice(null);
    try {
      const payload = stateGuidePayload(guide);
      payload.research = { ...payload.research, sourceCaveats: lines(payload.research.sourceCaveats.join("\n")), sources: Object.fromEntries(Object.entries(payload.research.sources).map(([category, urls]) => [category, lines(urls.join("\n"))])) };
      const saved = await api<StateGuideRecord>(`/admin/state-guides/${encodeURIComponent(guide.stateId)}`, { method: "PUT", body: JSON.stringify(payload) });
      setGuide(saved); setBaseline(JSON.stringify(stateGuidePayload(saved)));
      setStates(rows => rows.map(row => row.stateId === saved.stateId ? { ...row, version: saved.version, updatedAt: saved.updatedAt, reviewedOn: saved.research.reviewedOn, reviewStatus: saved.research.status } : row));
      setNotice({ error: false, text: `${saved.name} guide saved. The public page now uses these details.` });
    } catch (error) { setNotice({ error: true, text: error instanceof Error ? `${error.message}${error.message === "Validation failed" ? " Check required fields, valid email addresses and HTTPS source links." : ""}` : "The guide could not be saved. Your changes are still here." }); }
    finally { setBusy(false); }
  }
  const visibleStates = states.filter(state => state.name.toLowerCase().includes(search.trim().toLowerCase()));
  const slug = directory.states.find(state => state.stateId === selectedId)?.slug;

  return <div className="min-h-screen bg-background text-foreground">
    <aside className="fixed inset-y-0 left-0 hidden w-60 overflow-y-auto border-r border-border bg-white p-5 lg:block"><BrandLogo /><p className="mb-3 mt-9 text-xs font-bold uppercase tracking-wider text-muted">Administration</p><nav aria-label="Admin navigation" className="grid gap-1">{adminNavigation.map(([label, href]) => <Link key={href} href={href} aria-current={href === "/admin/state-guides" ? "page" : undefined} className={`rounded-xl px-3 py-3 text-sm font-semibold ${href === "/admin/state-guides" ? "bg-primary-light text-primary" : "text-muted hover:bg-background"}`}>{label}</Link>)}</nav></aside>
    <div className="lg:ml-60"><header className="flex min-h-20 items-center justify-between gap-4 border-b border-border bg-white px-5 sm:px-8"><span className="text-sm font-bold text-primary">Content administration</span><div className="flex items-center gap-4"><Link href="/admin/geography" className="text-sm font-semibold text-primary">Manage geography</Link><UserMobileMenu admin /></div></header>
      <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8"><h1 className="text-3xl font-black tracking-tight">State guides</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-muted">Manage the information corps members see on each state page. Select a state, edit a category, then save your changes.</p>
        <div className="mt-7 grid items-start gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
          <section aria-label="Select a state" className="rounded-2xl border border-border bg-white p-4"><label className="grid gap-2 text-sm font-bold">Find a state<input className="field" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search states…" /></label><p className="mt-3 text-xs text-muted">{states.length} existing states / FCT</p>{listLoading ? <p role="status" className="py-5 text-sm text-muted">Loading states…</p> : <><div className="mt-3 max-h-72 space-y-1 overflow-y-auto xl:max-h-[65vh]">{visibleStates.map(state => <button key={state.stateId} type="button" disabled={busy} onClick={() => choose(state.stateId)} aria-pressed={selectedId === state.stateId} className={`flex min-h-12 w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm ${selectedId === state.stateId ? "bg-primary-light font-bold text-primary" : "hover:bg-background"}`}><span>{state.name}</span>{state.version === null ? <span className="text-[10px] text-muted">New</span> : null}</button>)}{!visibleStates.length ? <p className="py-4 text-sm text-muted">No matching state.</p> : null}</div>{!states.length ? <button className="mt-3 text-sm font-bold text-primary" onClick={() => void loadStates()}>Retry loading states</button> : null}</>}</section>
          <section className="min-w-0" aria-label="State guide editor">
            {notice ? <div role={notice.error ? "alert" : "status"} className={`mb-5 rounded-xl border p-4 text-sm leading-6 ${notice.error ? "border-red-200 bg-red-50 text-red-900" : "border-emerald-200 bg-emerald-50 text-emerald-950"}`}>{notice.text}</div> : null}
            {loading ? <div role="status" className="rounded-2xl border bg-white p-8 text-muted">Loading guide details…</div> : guide ? <form onSubmit={save} className="overflow-hidden rounded-2xl border border-border bg-white">
              <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-7"><div><h2 className="text-2xl font-black">{guide.name}</h2><p className="mt-2 text-xs leading-6 text-muted">{guide.version ? `Reviewed ${formatGuideDate(guide.research.reviewedOn)}` : "New guide"}{dirty ? " · Unsaved changes" : " · Changes saved"}</p></div>{slug ? <a href={`/states/${slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary">View public page<ExternalLink size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a> : null}</div>
              <div role="group" aria-label="Guide categories" className="flex overflow-x-auto border-y border-border px-3 sm:px-5">{tabs.map(([id, label]) => <button key={id} type="button" aria-pressed={tab === id} onClick={() => setTab(id)} className={`min-h-14 shrink-0 border-b-2 px-3 text-sm font-bold ${tab === id ? "border-primary text-primary" : "border-transparent text-muted hover:text-primary"}`}>{label}</button>)}</div>
              <fieldset disabled={busy} className="min-w-0 space-y-6 p-5 sm:p-7"><legend className="sr-only">{tabs.find(([id]) => id === tab)?.[1]}</legend>
                {tab === "overview" || tab === "life" || tab === "travel" ? infoFields[tab].map(field => <Field key={field.key} label={field.label}>{field.short ? <input className="field" required maxLength={300} value={guide.information[field.key]} onChange={event => info(field.key, event.target.value)} /> : <textarea className="field min-h-32 resize-y leading-7" required maxLength={12000} rows={field.key === "overview" ? 5 : 4} value={guide.information[field.key]} onChange={event => info(field.key, event.target.value)} />}</Field>) : null}
                {tab === "secretariat" ? contactFields.map(field => <Field key={field.key} label={field.label} hint={field.type === "url" ? "Use a complete HTTPS link." : undefined}>{field.key === "address" ? <textarea className="field min-h-28 resize-y" required maxLength={12000} value={guide.secretariat[field.key]} onChange={event => contact(field.key, event.target.value)} /> : <input className="field" type={field.type} required={field.type !== "url"} maxLength={field.key === "phoneNumber" ? 100 : field.key === "email" ? 254 : 2048} value={guide.secretariat[field.key]} onChange={event => contact(field.key, event.target.value)} />}</Field>) : null}
                {tab === "expectations" ? <><p className="text-sm leading-7 text-muted">Add practical arrival tips. The order here is the order shown on the public page.</p>{guide.expectations.map((item, index) => <div key={index} className="space-y-4 rounded-xl border border-border p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-bold">Expectation {index + 1}</h3><div className="flex gap-1"><button type="button" className="grid h-10 w-10 place-items-center rounded-lg hover:bg-background disabled:opacity-30" disabled={index === 0} aria-label={`Move expectation ${index + 1} up`} onClick={() => move("expectations", index, -1)}><ArrowUp size={17} /></button><button type="button" className="grid h-10 w-10 place-items-center rounded-lg hover:bg-background disabled:opacity-30" disabled={index === guide.expectations.length - 1} aria-label={`Move expectation ${index + 1} down`} onClick={() => move("expectations", index, 1)}><ArrowDown size={17} /></button><button type="button" className="grid h-10 w-10 place-items-center rounded-lg text-red-700 hover:bg-red-50" aria-label={`Remove expectation ${index + 1}`} onClick={() => setGuide({ ...guide, expectations: guide.expectations.filter((_, i) => i !== index) })}><Trash2 size={17} /></button></div></div><Field label="Title"><input className="field" required maxLength={300} value={item.title} onChange={event => setGuide({ ...guide, expectations: guide.expectations.map((entry, i) => i === index ? { ...entry, title: event.target.value } : entry) })} /></Field><Field label="Description"><textarea className="field min-h-28 resize-y" required maxLength={12000} value={item.description} onChange={event => setGuide({ ...guide, expectations: guide.expectations.map((entry, i) => i === index ? { ...entry, description: event.target.value } : entry) })} /></Field></div>)}<button type="button" disabled={guide.expectations.length >= 30} className="btn-secondary gap-2" onClick={() => setGuide({ ...guide, expectations: [...guide.expectations, { title: "", description: "" }] })}><Plus size={17} />Add expectation</button></> : null}
                {tab === "photos" ? <><p className="text-sm leading-7 text-muted">Use a local image path, an images.unsplash.com URL, or a picsum.photos/seed/ URL. Keep illustrative photos labelled until their location is verified.</p>{guide.photos.map((photo, index) => <div key={index} className="space-y-4 rounded-xl border border-border p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-bold">Photo {index + 1}</h3><div className="flex gap-1"><button type="button" className="grid h-10 w-10 place-items-center rounded-lg hover:bg-background disabled:opacity-30" disabled={index === 0} aria-label={`Move photo ${index + 1} up`} onClick={() => move("photos", index, -1)}><ArrowUp size={17} /></button><button type="button" className="grid h-10 w-10 place-items-center rounded-lg hover:bg-background disabled:opacity-30" disabled={index === guide.photos.length - 1} aria-label={`Move photo ${index + 1} down`} onClick={() => move("photos", index, 1)}><ArrowDown size={17} /></button><button type="button" className="grid h-10 w-10 place-items-center rounded-lg text-red-700 hover:bg-red-50" aria-label={`Remove photo ${index + 1}`} onClick={() => setGuide({ ...guide, photos: guide.photos.filter((_, i) => i !== index) })}><Trash2 size={17} /></button></div></div>{canPreview(photo.src) ? <div className="relative aspect-[4/3] max-w-sm overflow-hidden rounded-xl bg-background"><StateGuidePhoto src={photo.src} alt={photo.alt || "Photo preview"} sizes="360px" /></div> : null}{([['src', 'Image URL or local path'], ['alt', 'Alternative text'], ['caption', 'Caption']] as const).map(([key, label]) => <Field key={key} label={label}><input className="field" required maxLength={key === "alt" ? 300 : key === "caption" ? 2000 : 2048} value={photo[key]} onChange={event => setGuide({ ...guide, photos: guide.photos.map((entry, i) => i === index ? { ...entry, [key]: event.target.value } : entry) })} /></Field>)}<label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-4 w-4 accent-primary" checked={photo.illustrative} onChange={event => setGuide({ ...guide, photos: guide.photos.map((entry, i) => i === index ? { ...entry, illustrative: event.target.checked } : entry) })} /><span>Illustrative photo — the location has not been verified</span></label></div>)}<button type="button" disabled={guide.photos.length >= 20} className="btn-secondary gap-2" onClick={() => setGuide({ ...guide, photos: [...guide.photos, { src: "", alt: "", caption: "", illustrative: true }] })}><Plus size={17} />Add photo</button></> : null}
                {tab === "research" ? <><div className="grid gap-5 sm:grid-cols-2"><Field label="Review date"><input className="field" type="date" required value={guide.research.reviewedOn} onChange={event => research("reviewedOn", event.target.value)} /></Field><Field label="Review status"><select className="field" value={guide.research.status} onChange={event => research("status", event.target.value)}><option value="draft">Draft</option><option value="researched_editorial_draft_requires_local_verification">Needs local verification</option><option value="verified">Verified</option></select></Field></div><p className="text-xs leading-6 text-muted">Draft and unverified guides remain visible with their review notes and are excluded from search indexing.</p><Field label="Research notes"><textarea className="field min-h-32 resize-y" required maxLength={12000} value={guide.research.notes} onChange={event => research("notes", event.target.value)} /></Field><Field label="Source caveats" hint="One note per line. Leave empty if there are no caveats."><textarea className="field min-h-24 resize-y" value={guide.research.sourceCaveats.join("\n")} onChange={event => research("sourceCaveats", event.target.value.split(/\r?\n/))} /></Field><fieldset><legend className="text-sm font-semibold">Details that need regular updates</legend><div className="mt-3 flex flex-wrap gap-4">{refreshFields.map(key => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-primary" checked={guide.research.dynamicFieldsRequireRefresh.includes(key)} onChange={event => research("dynamicFieldsRequireRefresh", event.target.checked ? [...guide.research.dynamicFieldsRequireRefresh, key] : guide.research.dynamicFieldsRequireRefresh.filter(field => field !== key))} />{refreshLabels[key]}</label>)}</div></fieldset><h3 className="border-t border-border pt-5 text-lg font-bold">Research sources</h3>{[...new Set([...Object.keys(researchSourceLabels), ...Object.keys(guide.research.sources)])].map(category => <Field key={category} label={researchSourceLabels[category] ?? category} hint="One HTTPS source link per line."><textarea className="field min-h-24 resize-y" value={(guide.research.sources[category] ?? []).join("\n")} onChange={event => research("sources", { ...guide.research.sources, [category]: event.target.value.split(/\r?\n/) })} /></Field>)}</> : null}
              </fieldset>
              <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-background/60 p-5 sm:px-7"><p className="max-w-md text-xs leading-6 text-muted">Saving updates the public guide. Camp locations and LGAs are managed in <Link href="/admin/geography" className="font-bold text-primary underline">Geography</Link>.</p><div className="flex items-center gap-4"><button type="button" disabled={busy} className="text-sm font-bold text-primary disabled:opacity-50" onClick={() => { if (!dirty || window.confirm("Discard your changes and reload the latest saved guide?")) void loadGuide(selectedId); }}>Reload saved</button><button type="submit" disabled={busy || !dirty} className="btn-primary gap-2 disabled:opacity-50"><Save size={17} aria-hidden="true" />{busy ? "Saving…" : "Save changes"}</button></div></footer>
            </form> : <div className="rounded-2xl border border-border bg-white p-8 text-sm text-muted">{selectedId ? <button className="font-bold text-primary" onClick={() => void loadGuide(selectedId)}>Retry loading this guide</button> : "Select a state to manage its guide."}</div>}
          </section>
        </div>
      </main>
    </div>
  </div>;
}
