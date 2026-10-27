import { BrandLogo } from "@/components/brand-logo";
import { StateGuidePhoto } from "@/components/state-guide-photo";
import { StateLgaList } from "@/components/state-lga-list";
import { formatGuideDate, getStateGuide, googleMapsHref, loadStateGuideContent, loadStateGuideGeography, researchSourceLabels } from "@/lib/state-guides";
import nigeria from "@svg-maps/nigeria";
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Building2, ChevronDown, Compass, ExternalLink, Languages, Mail, MapPin, Phone, Route, Tent, Users, Utensils, Wallet, CloudSun } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, type ReactNode } from "react";

type PageProps = { params: Promise<{ slug: string }> };

// Geography is read from the existing database on every request.
export const dynamic = "force-dynamic";
const readGuide = cache(loadStateGuideContent);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const route = getStateGuide((await params).slug);
  if (!route) return { title: "State not found | Kopa-Padi" };
  const guide = await readGuide(route.stateId).catch(() => null);
  return {
    title: `${guide?.name ?? route.name} NYSC State Guide | Kopa-Padi`,
    description: guide?.information.overview,
    robots: !guide || guide.isDraft ? { index: false, follow: true } : undefined,
  };
}

function ExternalLinkLabel({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{children}<ExternalLink size={13} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>;
}

function sourceName(url: string) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  const names: Record<string, string> = {
    "nysc.gov.ng": "NYSC",
    "gov.uk": "UK government travel advice",
    "nimet.gov.ng": "Nigerian Meteorological Agency",
    "microdata.nigerianstat.gov.ng": "National Bureau of Statistics",
    "visitnigeria.io": "Visit Nigeria",
    "nipc.gov.ng": "Nigerian Investment Promotion Commission",
    "channelstv.com": "Channels Television",
    "nigeriahighcommissionkenya.org": "Nigeria High Commission",
  };
  return names[host] ?? host;
}

function DetailCard({ title, children, icon }: { title: string; children: ReactNode; icon: ReactNode }) {
  return <article className="rounded-2xl border border-border bg-white p-6 sm:p-7"><div className="mb-4 flex items-center gap-3"><span className="text-primary" aria-hidden="true">{icon}</span><h3 className="text-lg font-bold">{title}</h3></div><p className="text-sm leading-7 text-muted">{children}</p></article>;
}

export default async function StateGuidePage({ params }: PageProps) {
  const route = getStateGuide((await params).slug);
  if (!route) notFound();
  const [content, geography] = await Promise.all([
    readGuide(route.stateId),
    loadStateGuideGeography(route.stateId).catch(() => {
      console.error("State guide geography unavailable", { stateId: route.stateId });
      return null;
    }),
  ]);
  const guide = { ...route, ...content };
  const name = geography?.state.name ?? guide.name;
  const info = guide.information;
  const isFct = guide.slug === "federal-capital-territory";
  const areaLabel = isFct ? "Area councils" : "Local government areas";
  const mapStateId = isFct ? "fct" : guide.slug === "nasarawa" ? "nassarawa" : guide.slug;
  const reviewedDate = formatGuideDate(guide.research.reviewedOn);
  const travelHref = `/travel-plans?destinationState=${encodeURIComponent(name)}`;
  const navItems = [["Camp & contacts", "camp"], ["Life in the state", "life"], ["Travel & budget", "travel"], ["What to expect", "expectations"], [areaLabel, "local-government"], ["Photos", "photos"], ["Sources", "sources"]].filter(([, id]) => (id !== "photos" || guide.photos.length > 0) && (id !== "expectations" || guide.expectations.length > 0));

  return (
    <main id="state-guide" className="min-h-screen bg-background">
      <a href="#camp" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-xl focus:bg-white focus:p-4">Skip to state information</a>
      <header className="border-b border-border bg-white">
        <div className="container-page flex min-h-20 items-center justify-between gap-4">
          <BrandLogo />
          <Link href="/#explore-nigeria" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary focus-visible:outline-primary"><ArrowLeft size={17} aria-hidden="true" /> Back to map</Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#eef8f5]">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-primary-light/60 blur-3xl" />
        <div className="container-page relative grid items-center gap-9 py-10 sm:py-14 lg:grid-cols-[1fr_.95fr] lg:gap-14 lg:py-16">
          <div>
            <p className="eyebrow flex items-center gap-2"><Compass size={17} aria-hidden="true" /> Your NYSC state guide</p>
            <p className="mt-7 text-lg font-semibold text-primary-dark">Get to know</p>
            <h1 className="mt-2 break-words text-5xl font-black leading-[1.08] tracking-[-.04em] sm:text-6xl lg:text-7xl">{name}<span className="text-primary">.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">{info.overview}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-bold text-primary-dark">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3 py-2"><MapPin size={14} aria-hidden="true" /> Capital: {info.capital}</span>
              <span className="rounded-full border border-primary/15 bg-white/80 px-3 py-2">{info.geopoliticalZone}</span>
              {geography ? <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3 py-2"><Users size={14} aria-hidden="true" /> {geography.lgas.length} {areaLabel.toLowerCase()}</span> : null}
            </div>
            <a href="#camp" className="btn-primary mt-7 gap-2">Explore the essentials <ArrowRight size={17} aria-hidden="true" /></a>
            <p className="mt-5 text-xs leading-6 text-muted">Guide reviewed <time dateTime={guide.research.reviewedOn}>{reviewedDate}</time>. <a href="#sources" className="font-bold text-primary underline underline-offset-4">Read the sources</a></p>
          </div>
          <figure className="rounded-3xl border border-primary/10 bg-white/90 p-6 shadow-soft sm:p-8">
            <p className="eyebrow">Find your bearings</p>
            <h2 className="mt-2 text-xl font-black">{name} in Nigeria</h2>
            <svg viewBox={nigeria.viewBox} role="img" aria-labelledby="state-map-title state-map-description" className="my-5 h-56 w-full sm:h-64">
              <title id="state-map-title">{`Location of ${name} in Nigeria`}</title>
              <desc id="state-map-description">{`${name} is highlighted in green on the map of Nigeria.`}</desc>
              {(nigeria.locations as { id: string; path: string }[]).map(location => <path key={location.id} d={location.path} className={location.id === mapStateId ? "fill-primary" : "fill-[#d7ebe6]"} stroke="white" strokeWidth={1.5} aria-hidden="true" />)}
            </svg>
            <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
              <span className="inline-flex items-center gap-2 font-bold"><span className="h-3 w-3 rounded-full bg-primary" aria-hidden="true" />{name}</span>
              <span className="text-muted">Capital: {info.capital}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <nav aria-label="On this page" className="border-y border-border bg-white">
        <div className="container-page flex gap-6 overflow-x-auto py-1 text-sm font-bold text-muted sm:gap-8">
          {navItems.map(([label, id]) => <a key={id} href={`#${id}`} className="inline-flex min-h-14 shrink-0 items-center border-b-2 border-transparent transition hover:border-primary hover:text-primary focus-visible:outline-primary">{label}</a>)}
        </div>
      </nav>

      <div className="container-page py-8 sm:py-12">
        <div className="grid items-start gap-7 lg:grid-cols-[1.15fr_1fr]">
          <section id="camp" aria-labelledby="camp-heading" className="scroll-mt-6 rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-light text-primary"><Tent size={22} aria-hidden="true" /></span><h2 id="camp-heading" className="text-xl font-black sm:text-2xl">Your orientation venue</h2></div>
            {geography ? geography.camps.length ? geography.camps.map(camp => (
              <div key={camp.id} className="mt-6 border-b border-border pb-5 last:border-0 last:pb-0">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">{camp.status === "TEMPORARY" ? "Temporary orientation venue" : "NYSC orientation venue"}</p>
                <h3 className="mt-2 text-lg font-bold">{camp.name}</h3>
                {camp.address ? <address className="mt-3 text-sm not-italic leading-7 text-muted">{camp.address}</address> : null}
                {camp.lga ? <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-background px-3 py-2 text-xs font-semibold"><MapPin size={14} aria-hidden="true" /> {camp.lga} {isFct ? "Area Council" : "LGA"}</p> : null}
                <div className="mt-4"><ExternalLinkLabel href={googleMapsHref(camp.latitude !== null && camp.longitude !== null ? `${camp.latitude},${camp.longitude}` : `${camp.address ?? camp.name}, ${name}`)}><MapPin size={15} aria-hidden="true" /> View venue on map</ExternalLinkLabel></div>
              </div>
            )) : <p className="mt-6 text-sm leading-7 text-muted">No operational camp is currently listed. Confirm your reporting venue with NYSC.</p> : <p role="status" className="mt-6 rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-950">Camp details are temporarily unavailable. Please try again shortly or contact the state secretariat.</p>}
            <p className="mt-5 border-t border-border pt-5 text-xs leading-6 text-muted">Confirm the active venue and reporting instructions on your call-up letter before travelling.</p>
          </section>

          <section id="secretariat" aria-labelledby="secretariat-heading" className="scroll-mt-6 rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-light text-primary"><Building2 size={22} aria-hidden="true" /></span><h2 id="secretariat-heading" className="text-xl font-black sm:text-2xl">NYSC state secretariat</h2></div>
            <p className="mt-4 text-sm leading-6 text-muted">Your state contact for NYSC enquiries.</p>
            <dl className="mt-6 space-y-5 text-sm">
              <div><dt className="flex items-center gap-2 text-xs font-bold text-muted"><Phone size={15} aria-hidden="true" /> Phone number</dt><dd className="mt-2 font-bold"><a href={`tel:${guide.secretariat.phoneNumber.replace(/[^+\d]/g, "")}`} className="inline-flex min-h-8 items-center text-primary hover:underline">{guide.secretariat.phoneNumber}</a></dd></div>
              <div><dt className="flex items-center gap-2 text-xs font-bold text-muted"><Mail size={15} aria-hidden="true" /> Email address</dt><dd className="mt-2 break-all font-bold"><a href={`mailto:${guide.secretariat.email}`} className="inline-flex min-h-8 items-center text-primary hover:underline">{guide.secretariat.email}</a></dd></div>
              <div><dt className="flex items-center gap-2 text-xs font-bold text-muted"><MapPin size={15} aria-hidden="true" /> Office address</dt><dd className="mt-2"><address className="not-italic leading-7 text-muted">{guide.secretariat.address}</address></dd></div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-x-5 border-t border-border pt-3">{guide.secretariat.googleMapsUrl ? <ExternalLinkLabel href={guide.secretariat.googleMapsUrl}><MapPin size={15} aria-hidden="true" /> View office on map</ExternalLinkLabel> : null}{guide.secretariat.sourceUrl ? <ExternalLinkLabel href={guide.secretariat.sourceUrl}>NYSC contact directory</ExternalLinkLabel> : null}</div>
          </section>
        </div>

        <section id="life" aria-labelledby="life-heading" className="scroll-mt-6 pt-12 sm:pt-16">
          <p className="eyebrow">Know your new surroundings</p>
          <h2 id="life-heading" className="mt-3 text-3xl font-black tracking-tight">Life in {name}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">A first introduction to the people, food and heritage of the state.</p>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <DetailCard title="Languages you'll hear" icon={<Languages size={22} />}>{info.spokenLanguages}</DetailCard>
            <DetailCard title="Culture & community" icon={<Users size={22} />}>{info.culturalHighlights}</DetailCard>
            <DetailCard title="Local food" icon={<Utensils size={22} />}>{info.localFood}</DetailCard>
            <DetailCard title="Places & heritage" icon={<Compass size={22} />}>{info.placesToVisit}</DetailCard>
          </div>
        </section>

        <section id="travel" aria-labelledby="travel-heading" className="scroll-mt-6 pt-12 sm:pt-16">
          <p className="eyebrow">Prepare for the journey</p>
          <h2 id="travel-heading" className="mt-3 text-3xl font-black tracking-tight">Travel, weather & your budget</h2>
          <aside aria-labelledby="safety-heading" className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950 sm:p-7">
            <h3 id="safety-heading" className="flex items-center gap-3 text-lg font-bold"><AlertTriangle size={22} className="shrink-0" aria-hidden="true" /> Before you travel</h3>
            <p className="mt-4 text-sm leading-7">{info.travelSafetyNotes}</p>
            <p className="mt-5 text-sm font-bold">For prospective corps members</p>
            <p className="mt-2 text-sm leading-7">{info.pcmTips}</p>
            <div className="mt-4 flex flex-wrap gap-x-6">{guide.research.sources.travelSafetyNotes?.map(url => <ExternalLinkLabel key={url} href={url}>{sourceName(url)}</ExternalLinkLabel>)}</div>
            <p className="mt-2 text-xs leading-6">Source review: <time dateTime={guide.research.reviewedOn}>{reviewedDate}</time>. Confirm current local conditions with NYSC.</p>
          </aside>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <DetailCard title="Weather & packing" icon={<CloudSun size={22} />}>{info.weatherAndClimate}</DetailCard>
            <DetailCard title="Getting around" icon={<Route size={22} />}>{info.transportOptions}</DetailCard>
            <div className="md:col-span-2"><DetailCard title="Everyday costs & budgeting" icon={<Wallet size={22} />}>{info.costOfLiving}</DetailCard></div>
          </div>
        </section>

        <section id="expectations" hidden={guide.expectations.length === 0} aria-labelledby="expectations-heading" className="scroll-mt-6 pt-12 sm:pt-16">
          <p className="eyebrow">Your first few days</p>
          <h2 id="expectations-heading" className="mt-3 text-3xl font-black tracking-tight">What to expect</h2>
          <p className="mt-3 text-sm leading-7 text-muted">Practical pointers for arriving and settling in.</p>
          <div className="mt-7 space-y-3">
            {guide.expectations.map((item, index) => <details key={`${index}-${item.title}`} className="group rounded-2xl border border-border bg-white"><summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 rounded-2xl p-5 focus-visible:outline-primary sm:px-6"><span className="text-xs font-black text-primary/60" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h3 className="flex-1 text-base font-bold">{item.title}</h3><ChevronDown size={18} className="shrink-0 text-primary transition group-open:rotate-180" aria-hidden="true" /></summary><p className="px-6 pb-6 text-sm leading-7 text-muted sm:pl-14">{item.description}</p></details>)}
          </div>
        </section>

        <section id="local-government" aria-labelledby="lga-heading" className="mt-12 scroll-mt-6 rounded-3xl border border-border bg-white p-6 sm:mt-16 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div><p className="eyebrow">Explore the communities</p><h2 id="lga-heading" className="mt-2 text-2xl font-black">{areaLabel}</h2><p className="mt-3 text-sm leading-6 text-muted">{geography ? `Explore all ${geography.lgas.length} ${areaLabel.toLowerCase()} in ${name}.` : 'Local government details are temporarily unavailable. Please try again shortly.'}</p></div>
            {geography ? <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-light text-lg font-black text-primary">{geography.lgas.length}</span> : null}
          </div>
          {geography ? <StateLgaList key={guide.slug} names={geography.lgas.map(lga => lga.name)} isFct={isFct} /> : null}
        </section>

        {guide.photos.length ? <section id="photos" aria-labelledby="photos-heading" className="scroll-mt-6 pt-12 sm:pt-16">
          <p className="eyebrow">Picture your next chapter</p>
          <h2 id="photos-heading" className="mt-3 text-3xl font-black tracking-tight">A little inspiration</h2>
          <p className="mt-3 text-sm leading-7 text-muted">{guide.photos.some(photo => photo.illustrative) ? `These are illustrative placeholders, not verified photographs of ${name}.` : `A first look at ${name}.`}</p>
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {guide.photos.map((photo, index) => <figure key={`${index}-${photo.src}`} className="overflow-hidden rounded-2xl border border-border bg-white"><div className="relative aspect-[4/3] bg-primary-light"><StateGuidePhoto src={photo.src} alt={photo.alt} sizes="(max-width: 639px) 100vw, 50vw" /></div><figcaption className="px-5 py-4"><p className="text-sm leading-6 font-bold">{photo.caption}</p>{photo.illustrative ? <p className="mt-2 text-xs text-muted">Illustrative photo · Location not verified</p> : null}</figcaption></figure>)}
          </div>
        </section> : null}

        <section id="sources" aria-labelledby="sources-heading" className="mt-12 scroll-mt-6 rounded-3xl border border-border bg-white p-6 sm:mt-16 sm:p-8">
          <div className="flex items-center gap-3"><BookOpen size={22} className="text-primary" aria-hidden="true" /><h2 id="sources-heading" className="text-xl font-black">About this guide</h2></div>
          <p className="mt-4 text-sm leading-7 text-muted">Reviewed <time dateTime={guide.research.reviewedOn}>{reviewedDate}</time>. {guide.isDraft ? "Local details still require confirmation." : ""}</p>
          <p className="mt-3 text-sm leading-7 text-muted">{guide.research.notes}</p>
          {guide.research.sourceCaveats.map((note, index) => <p key={index} className="mt-3 text-sm leading-7 text-muted">{note}</p>)}
          <details className="group mt-5 border-t border-border pt-2"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 font-bold text-primary focus-visible:outline-primary">Research sources<ChevronDown size={18} className="transition group-open:rotate-180" aria-hidden="true" /></summary><div className="mt-4 grid gap-6 sm:grid-cols-2">{Object.entries(guide.research.sources).filter(([, urls]) => urls.length > 0).map(([category, urls]) => <div key={category}><h3 className="text-sm font-bold">{researchSourceLabels[category] ?? category}</h3><ul className="mt-2">{[...new Set(urls)].map(url => <li key={url}><ExternalLinkLabel href={url}>{sourceName(url)}</ExternalLinkLabel></li>)}</ul></div>)}</div></details>
        </section>

        <section aria-labelledby="plan-heading" className="mt-12 rounded-3xl bg-primary-dark p-7 text-white sm:mt-16 sm:p-10">
          <div className="flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[.2em] text-primary-light">The road is better together</p><h2 id="plan-heading" className="mt-3 text-2xl font-black sm:text-3xl">Find a Padi for the journey.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-white/75">Explore travel plans and connect with people heading to {name}.</p></div>
            <Link href={travelHref} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-primary-dark transition hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"><Route size={18} aria-hidden="true" /> Create a plan <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </section>
      </div>

      <footer className="border-t border-border bg-white py-7"><div className="container-page flex flex-col justify-between gap-4 text-xs leading-6 text-muted sm:flex-row"><p>Kopa-Padi · Travel together. Go further.</p><p>Administrative names adapted from <a href="https://github.com/open-admin-data/nigeria-administrative-divisions" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">Nigeria Administrative Divisions</a> (CC BY 4.0).</p></div></footer>
    </main>
  );
}
