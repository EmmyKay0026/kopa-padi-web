import { ArrowLeft, MapPin, Route, Users } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'State Map | Kopa-Padi',
  description: 'View a selected Nigerian state on the map and continue planning your journey.',
};

type PageProps = { searchParams: Promise<{ state?: string }> };

export default async function StateMapPage({ searchParams }: PageProps) {
  const { state: stateParam } = await searchParams;
  const state = stateParam?.trim() || 'Nigeria';
  const encodedState = encodeURIComponent(state);
  const mapQuery = encodeURIComponent(`${state}, Nigeria`);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="container-page flex min-h-20 items-center justify-between gap-4">
          <Link href="/#explore-nigeria" className="inline-flex items-center gap-2 text-sm font-bold text-primary"><ArrowLeft size={18} /> Back to map</Link>
          <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight text-foreground"><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">KP</span>Kopa-Padi</Link>
        </div>
      </header>

      <section className="container-page py-10 sm:py-14">
        <div className="mb-8 max-w-3xl">
          <p className="eyebrow">Explore your journey</p>
          <h1 className="section-title">{state} on the map</h1>
          <p className="mt-4 text-base leading-7 text-muted">See the selected area, then choose your state or create a travel plan to start finding people going your way.</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-soft">
          <iframe
            title={`Google Map showing ${state}, Nigeria`}
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
            className="h-[430px] w-full border-0 sm:h-[560px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <div className="grid gap-5 border-t border-border p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-light text-primary"><MapPin size={22} /></span>
              <div><h2 className="text-xl font-black">{state}, Nigeria</h2><p className="mt-1 text-sm leading-6 text-muted">Use this location as the starting point for your next Kopa-Padi journey.</p></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href={`/locations?state=${encodedState}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-primary/30 bg-white px-5 font-bold text-primary transition hover:bg-primary-light"><Users size={18} /> Choose state</Link>
              <Link href={`/travel-plans?state=${encodedState}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-bold text-white transition hover:bg-primary-dark"><Route size={18} /> Create a plan</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
