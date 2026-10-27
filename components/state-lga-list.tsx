"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

export function StateLgaList({ names, isFct = false }: { names: string[]; isFct?: boolean }) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLocaleLowerCase("en-NG");
  const filtered = term ? names.filter((name) => name.toLocaleLowerCase("en-NG").includes(term)) : names;
  const label = isFct ? "area councils" : "local government areas";

  return (
    <div>
      <label htmlFor="lga-search" className="sr-only">Search {label}</label>
      <div className="relative">
        <Search size={19} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id="lga-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${label}`}
          className="field pl-12 pr-14"
          aria-controls="state-lga-results"
          autoComplete="off"
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-primary-light focus-visible:outline-primary">
            <X size={17} aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 text-xs text-muted">
        Showing {filtered.length} of {names.length} {label}
      </p>
      <div id="state-lga-results">
        {filtered.length ? (
          <ul className="mt-5 grid gap-x-6 gap-y-1 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((name) => (
              <li key={name} className="flex items-center gap-3 border-b border-border/70 py-3 text-sm font-semibold">
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                {name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl bg-background p-6 text-sm text-muted">No {label} match “{query.trim()}”. Try another name or clear your search.</p>
        )}
      </div>
    </div>
  );
}
