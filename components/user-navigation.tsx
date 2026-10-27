"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { Menu, Search } from "lucide-react";

export const userNavigation = [
  ["Dashboard", "/app"], ["My Trips", "/travel-plans"], ["Matches", "/matching"],
  ["Travel Circle", "/circle"], ["Messages", "/circle#circle-chat"],
  ["Journey Safety", "/journey"], ["Safety Centre", "/safety"],
  ["Departure Location", "/locations"], ["Profile", "/profile"], ["Verification", "/verification"],
] as const;

export const adminNavigation = [
  ["State guides", "/admin/state-guides"],
  ["NYSC intakes", "/admin/intakes"],
  ["Operations", "/admin/operations"], ["Bug reports", "/admin/bug-reports"], ["Verifications", "/admin/verifications"],
  ["Geography", "/admin/geography"], ["Orientation Camps", "/admin/orientation-camps"],
  ["Journey Guides", "/admin/journey-guides"], ["Safety", "/admin/safety"], ["Back to app", "/app"],
] as const;

export function UserMobileMenu({ admin = false }: { admin?: boolean }) {
  const details = useRef<HTMLDetailsElement>(null);
  return <details ref={details} className="relative text-foreground lg:hidden" onKeyDown={(event) => {
    if (event.key === "Escape" && details.current) { details.current.open = false; details.current.querySelector("summary")?.focus(); }
  }}>
    <summary aria-label={admin ? "Admin menu" : "Application menu"} className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-xl border border-border bg-white [&::-webkit-details-marker]:hidden"><Menu size={20} aria-hidden="true" /></summary>
    <nav aria-label={admin ? "Mobile admin navigation" : "Mobile application navigation"} className="absolute right-0 top-12 z-50 grid max-h-[70vh] w-60 gap-1 overflow-y-auto rounded-xl border border-border bg-white p-3 shadow-xl">
      {(admin ? adminNavigation : userNavigation).map(([label, href]) => <Link key={href} href={href} className="rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-primary-light" onClick={() => { if (details.current) details.current.open = false; }}>{label}</Link>)}
    </nav>
  </details>;
}

export function UserNavigationSearch() {
  const id = useId();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const results = userNavigation.filter(([label]) => label.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="relative w-full max-w-md text-foreground" onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
  }}>
    <label htmlFor={id} className="sr-only">Find a page</label>
    <Search size={19} aria-hidden="true" className="pointer-events-none absolute left-4 top-3.5 text-muted" />
    <input id={id} type="search" className="field pl-12" placeholder="Find trips, matches or messages…" value={query} onFocus={() => setFocused(true)} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setFocused(false); }} aria-controls={`${id}-results`} aria-expanded={focused} />
    {focused ? <nav id={`${id}-results`} aria-label="Page search results" className="absolute inset-x-0 top-full z-50 mt-1 max-h-72 overflow-auto rounded-xl border bg-white p-2 shadow-lg">
      {results.length ? results.map(([label, href]) => <Link key={href} href={href} className="block rounded-lg p-2 text-sm hover:bg-primary-light" onClick={() => { setFocused(false); setQuery(""); }}>{label}</Link>) : <p className="p-2 text-sm text-muted">No matching page.</p>}
    </nav> : null}
  </div>;
}
