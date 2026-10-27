"use client";
import Link from "next/link";

export default function StateGuideError({ reset }: { reset: () => void }) {
  return <main className="container-page grid min-h-[70vh] content-center justify-items-start gap-5 py-16"><h1 className="text-3xl font-black">This state guide is temporarily unavailable</h1><p className="text-muted">Please try again to load the latest guide details.</p><div className="flex flex-wrap gap-4"><button className="btn-primary" onClick={reset}>Try again</button><Link className="btn-secondary" href="/#explore-nigeria">Back to map</Link></div></main>;
}
