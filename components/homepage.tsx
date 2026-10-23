"use client";
import { GlyphIcon } from "@/components/glyph-icon";
import { BrandLogo } from "@/components/brand-logo";


import Link from "next/link";
import { useEffect, useState } from "react";
import NigeriaTripMap from "./nigeria-trip-map";

const Icon = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    aria-hidden="true"
    className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-lg text-primary ${className}`}
  >
    <GlyphIcon name={String(children)} size={22} />
  </span>
);
const Arrow = () => (
  <span
    aria-hidden="true"
    className="ml-2 transition-transform group-hover:translate-x-1"
  >
    <GlyphIcon name="→" />
  </span>
);

const nav = [
  ["Home", "#top"],
  ["How It Works", "#how-it-works"],
  ["Safety", "#safety"],
  ["Travel Tips", "#blog"],
  ["About", "#why"],
  ["FAQs", "#faq-list"],
];

function Logo({ light = false }: { light?: boolean }) { return <BrandLogo light={light} />;
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all ${scrolled || open ? "border-border bg-white/95 text-foreground shadow-sm backdrop-blur-xl" : "border-transparent bg-transparent text-white"}`}
      onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
    >
      <nav
        aria-label="Main navigation"
        className="container-page flex h-20 items-center justify-between"
      >
        <Logo light={!scrolled && !open} />
        <div className="hidden items-center gap-7 lg:flex">
          {nav.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm font-semibold transition hover:text-primary-light"
            >
              {label}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="px-4 py-3 text-sm font-bold">
            Log In
          </Link>
          <Link href="/register" className="btn-primary">
            Sign Up
          </Link>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
          className="grid h-11 w-11 place-items-center rounded-xl border border-current/20 text-xl lg:hidden"
        >
          {open ? <><GlyphIcon name="×" /></> : <><GlyphIcon name="☰" /></>}
        </button>
      </nav>
      {open && (
        <div
          id="mobile-menu"
          className="border-t bg-white px-5 pb-6 text-foreground lg:hidden"
        >
          {nav.map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block border-b py-4 font-semibold"
            >
              {label}
            </a>
          ))}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href="/login"
              className="grid place-items-center rounded-xl border font-bold"
            >
              Log In
            </Link>
            <Link href="/register" className="btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function TripForm({ compact = false }: { compact?: boolean }) {
  return (
    <form
      action="/travel-plans"
      method="get"
      className={compact ? "grid gap-3 md:grid-cols-[1fr_1fr_auto]" : ""}
    >
      {!compact && (
        <>
          <h2 className="text-2xl font-bold">Plan Your Trip</h2>
          <p className="mt-1 text-sm text-muted">
            Start planning your journey to an NYSC orientation camp.
          </p>
        </>
      )}
      <div className={compact ? "" : "mt-6 grid gap-4 sm:grid-cols-2"}>
        <label className="grid gap-2 text-sm font-bold">
          From
          <input
            className="field"
            placeholder="Departure city"
            required
          />
        </label>
        {!compact && (
          <label className="grid gap-2 text-sm font-bold">
            To
            <input
              className="field"
              placeholder="Destination"
              required
            />
          </label>
        )}
      </div>
      {compact && (
        <label className="grid gap-2 text-sm font-bold text-white">
          To
          <input
            className="field"
            placeholder="Destination"
            required
          />
        </label>
      )}
      {!compact && (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">
              Date
              <input className="field" type="date" required />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Time
              <input className="field" type="time" name="time" required />
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-bold">
            Transport mode
            <select className="field">
              <option>Car</option>
              <option>Bus</option>
              <option>Train</option>
              <option>Flight</option>
              <option>Other</option>
            </select>
          </label>
        </>
      )}
      <button
        className={
          compact
            ? "btn-primary self-end whitespace-nowrap"
            : "btn-primary group mt-6 w-full"
        }
      >
        Open Travel Plan <Arrow />
      </button>
      <p className={compact ? "text-xs text-white/75 md:col-span-3" : "mt-3 text-center text-xs text-muted"}>
        Sign in and verify your PCM status to create a Travel Plan. This preview does not save your entries; enter your route and schedule in the Travel Plan form.
      </p>
    </form>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[940px] bg-cover bg-center text-white lg:min-h-[90vh]"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(5,32,30,.92), rgba(5,32,30,.58)), url('/Lagos Coastal Bridge Traffic Panorama.webp')",
      }}
    >
      <Header />
      <div className="container-page grid min-h-[940px] items-center gap-12 pb-20 pt-32 lg:min-h-[90vh] lg:grid-cols-[1.15fr_.85fr]">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-primary-light">
            Travel together. Go further.
          </p>
          <h1 className="mt-5 text-5xl font-black leading-[1.03] tracking-[-.045em] sm:text-6xl lg:text-7xl">
            Travel safer, smarter,{" "}
            <span className="text-teal-200">and together.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
            Find compatible travelers going your way, connect before your
            journey, and travel with more confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary group">
              Find a Padi <Arrow />
            </Link>
            <a href="#how-it-works" className="btn-secondary">
              How It Works
            </a>
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-white/40 bg-white/95 p-6 text-foreground shadow-2xl backdrop-blur sm:p-8">
          <TripForm />
        </div>
      </div>
    </section>
  );
}

const trust = [
  ["shield", "Verified Travelers", "Travel with more confidence"],
  ["route", "Smart Route Matching", "Find people going your way"],
  ["chat", "Chat Before Travel", "Get to know your Padi"],
  ["shield", "Safety-Focused", "Tools for a safer journey"],
];
function TrustStrip() {
  return (
    <section
      aria-label="Why travelers trust Kopa-Padi"
      className="border-b bg-white"
    >
      <div className="container-page grid grid-cols-2 gap-7 py-9 lg:grid-cols-4">
        {trust.map(([icon, title, copy]) => (
          <div key={title} className="flex gap-3">
            <Icon>{icon}</Icon>
            <div>
              <h3 className="text-sm font-bold">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-muted">{copy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const steps = [
  {
    title: "Create Your Trip",
    label: "Tell us where you're going",
    heading: "Create Your Trip",
    copy: "Tell us where you're going, when you're leaving and how you're travelling. It only takes a minute.",
    details: [
      "Set your departure and destination",
      "Choose date and time",
      "Select transport mode",
      "Add preferences (optional)",
    ],
    cta: "Create a Trip",
    href: "/travel-plans",
    image:
      "/1b349eb7-56c3-4152-bb64-d7c5697bd1be.webp",
  },
  {
    title: "Get Matched",
    label: "Find travelers going your way",
    heading: "Find Travelers Going Your Way",
    copy: "Kopa-Padi compares routes, departure times, transport modes and travel preferences to find compatible travelers.",
    details: [
      "Similar routes",
      "Nearby departure points",
      "Compatible travel time",
      "Relevant transport mode",
    ],
    cta: "See How Matching Works",
    href: "/matching",
    image:
      "/Lagos Travelers Among Yellow Danfos.webp",
  },
  {
    title: "Connect Safely",
    label: "Chat and agree on the details",
    heading: "Connect Before You Travel",
    copy: "Review traveler profiles, check important details and chat before deciding whether someone is the right Padi for your journey.",
    details: [
      "View traveler profiles",
      "Check verification",
      "Chat inside Kopa-Padi",
      "Agree on travel details",
    ],
    cta: "Learn About Safety",
    href: "#safety",
    image:
      "/Joyful Ride Through Lagos Traffic.webp",
  },
  {
    title: "Travel Together",
    label: "Enjoy a safer journey",
    heading: "Travel With More Confidence",
    copy: "Once you've found the right Padi, stay connected, share your journey and use Kopa-Padi's safety tools while travelling.",
    details: [
      "Share trip information",
      "Stay connected",
      "Journey check-ins",
      "Emergency support tools",
    ],
    cta: "Start Your Trip",
    href: "/register",
    image:
      "/Highway to the Granite Monolith.webp",
  },
];
function HowItWorks() {
  const [active, setActive] = useState(0);
  const step = steps[active];
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-primary-dark bg-cover bg-center py-24 text-white transition-[background-image] duration-500"
      style={{
        backgroundImage: `linear-gradient(90deg,rgba(4,34,31,.94),rgba(4,34,31,.74)),url('${step.image}')`,
      }}
    >
      <div className="container-page">
        <p className="text-xs font-bold tracking-[.22em] text-teal-200">
          HOW IT WORKS
        </p>
        <h2 className="mt-3 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
          From travel plans to travel companions.
        </h2>
        <p className="mt-4 text-white/70">
          Kopa-Padi makes finding someone going your way simple.
        </p>
        <div className="mt-12 grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
          <div
            role="tablist"
            aria-label="How Kopa-Padi works"
            className="space-y-3"
          >
            {steps.map((s, i) => (
              <button
                key={s.title}
                type="button"
                role="tab"
                aria-selected={active === i}
                aria-controls="step-panel"
                onClick={() => setActive(i)}
                className={`w-full rounded-2xl border p-5 text-left transition ${active === i ? "border-teal-200 bg-white/15" : "border-white/10 bg-black/10 text-white/60 hover:bg-white/10"}`}
              >
                <span className="mr-4 text-sm font-black text-teal-200">
                  0{i + 1}
                </span>
                <span className="font-bold">{s.title}</span>
                <span className="mt-1 block pl-10 text-sm">{s.label}</span>
              </button>
            ))}
          </div>
          <div
            id="step-panel"
            role="tabpanel"
            className="rounded-3xl border border-white/20 bg-black/20 p-7 backdrop-blur-sm sm:p-10"
          >
            <p className="text-sm font-bold text-teal-200">STEP {active + 1}</p>
            <h3 className="mt-3 text-3xl font-black">{step.heading}</h3>
            <p className="mt-4 max-w-xl leading-7 text-white/75">{step.copy}</p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {step.details.map((d) => (
                <li key={d} className="flex gap-2 text-sm">
                  <span className="text-teal-200">OK</span>
                  {d}
                </li>
              ))}
            </ul>
            <a href={step.href} className="btn-primary group mt-8">
              {step.cta}
              <Arrow />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const why = [
  [
    "shield",
    "Verified Travelers",
    "Know more about the person you're connecting with.",
  ],
  ["route", "Smarter Matches", "Match based on route, time and travel preferences."],
  [
    "chat",
    "Connect Before Travel",
    "Chat before deciding if someone is the right Padi.",
  ],
  ["shield", "Safety First", "Access tools designed to make shared journeys safer."],
];
function Why() {
  return (
    <section id="why" className="py-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <p className="eyebrow">Why Kopa-Padi</p>
          <h2 className="section-title">
            More than a trip.
            <br />A better way to travel.
          </h2>
          <p className="mt-5 max-w-lg leading-7 text-muted">
            Kopa-Padi helps you connect with real people, travel with
            confidence, and be part of a trusted community.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {why.map(([i, t, c]) => (
            <article
              key={t}
              className="card-soft p-6 transition hover:-translate-y-1"
            >
              <Icon>{i}</Icon>
              <h3 className="mt-5 text-lg font-bold">{t}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{c}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Matching() {
  const considered = [
    "Departure location",
    "Destination",
    "Distance between travelers",
    "Departure time",
    "Transport mode",
    "Travel preferences",
  ];
  return (
    <section className="bg-primary-light/45 py-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-3">
        <div>
          <p className="eyebrow">Smart matching</p>
          <h2 className="section-title">We find travelers going your way.</h2>
          <p className="mt-5 leading-7 text-muted">
            Our matching engine looks at your route, timing, transport mode and
            preferences to suggest the most relevant travelers.
          </p>
          <Link
            href="/matching"
            className="group mt-6 inline-flex font-bold text-primary"
          >
            Learn more <Arrow />
          </Link>
        </div>
        <div className="card-soft p-6">
          <p className="text-xs font-black tracking-widest text-muted">
            YOUR TRIP
          </p>
          <div className="mt-3 flex items-center justify-between font-bold">
            <span>Lagos</span>
            <span className="mx-4 h-px flex-1 bg-primary"></span>
            <span>Ibadan</span>
          </div>
          <p className="mt-2 text-sm text-muted">7:30 AM <GlyphIcon name="car" /> Car</p>
          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="rounded-full bg-primary px-4 py-2 text-xs font-black text-white">
              MATCH
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="flex items-center justify-between font-bold">
            <span>Lagos</span>
            <span className="mx-4 h-px flex-1 bg-primary"></span>
            <span>Ibadan</span>
          </div>
          <p className="mt-2 text-sm text-muted">7:45 AM <GlyphIcon name="car" /> Car</p>
          <div className="mt-5 rounded-xl bg-primary-light p-3 text-center font-black text-primary-dark">
            94% demo match
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold">We consider:</h3>
          <ul className="mt-5 space-y-3">
            {considered.map((x) => (
              <li key={x} className="flex gap-3">
                <span className="text-primary">OK</span>
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const safety = [
  ["Traveler Verification", "Profiles can display verification status."],
  ["Emergency Contacts", "Keep trusted people connected."],
  ["Trip Sharing", "Share your journey with someone you trust."],
  [
    "Journey Check-ins",
    "Confirm when key parts of your journey are completed.",
  ],
  ["Block & Report", "Control who can contact you."],
  ["Safe Communication", "Chat in-app before exchanging personal details."],
];
function Safety() {
  return (
    <section id="safety" className="py-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[.9fr_.7fr_1fr]">
        <div>
          <p className="eyebrow">Safety & trust</p>
          <h2 className="section-title">
            Safety should not be an afterthought.
          </h2>
          <p className="mt-5 leading-7 text-muted">
            Kopa-Padi gives you tools to make informed decisions about who you
            travel with and helps you stay connected during your journey.
          </p>
          <a
            href="#safety-list"
            className="group mt-6 inline-flex font-bold text-primary"
          >
            Learn about our safety features <Arrow />
          </a>
        </div>
        <div className="mx-auto w-full max-w-[290px] rounded-[2.5rem] border-[8px] border-foreground bg-white p-5 shadow-2xl">
          <div className="mx-auto mb-6 h-1.5 w-16 rounded-full bg-foreground/20" />
          <p className="text-xs font-bold text-muted">ACTIVE TRIP</p>
          <h3 className="mt-2 text-xl font-black">
            Lagos <span className="text-primary">-&gt;</span> Ibadan
          </h3>
          <div className="mt-6 rounded-2xl bg-primary-light p-4">
            <p className="text-xs font-bold text-muted">TRIP STATUS</p>
            <p className="mt-1 font-black text-primary-dark"><GlyphIcon name="✓" /> On track</p>
          </div>
          <Link href="/journey" className="mt-6 block w-full rounded-xl border p-3 text-center font-bold">
            Open Journey Sharing
          </Link>
          <Link href="/journey#emergency" className="mt-3 block w-full rounded-xl bg-danger p-3 text-center font-black text-white">
            Open Emergency Tools
          </Link>
        </div>
        <div id="safety-list" className="space-y-5">
          {safety.map(([t, c]) => (
            <div key={t} className="border-b pb-4">
              <h3 className="font-bold">{t}</h3>
              <p className="mt-1 text-sm text-muted">{c}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const routes = [
  [
    "Lagos",
    "Ibadan",
    "Intercity road trip",
    "/Hazy Bridge Traffic Over City Waters.webp",
  ],
  [
    "Lagos",
    "Abeokuta",
    "Road journey",
    "/Busy West African Roundabout Traffic.webp",
  ],
  [
    "Abuja",
    "Kaduna",
    "Intercity route",
    "/Highway to the Granite Monolith.webp",
  ],
  [
    "Port Harcourt",
    "Owerri",
    "Road journey",
    "/Rain-Kissed Campus Aerial View.webp",
  ],
];
function PopularRoutes() {
  return (
    <section className="bg-white py-24">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Explore</p>
            <h2 className="section-title">Popular Routes</h2>
            <p className="mt-4 text-muted">
              Explore common routes travelers may use on Kopa-Padi.
            </p>
          </div>
          <Link className="btn-primary group" href="/travel-plans">
            Explore Trips <Arrow />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {routes.map(([a, b, c, img]) => (
            <article key={b} className="card-soft overflow-hidden">
              <div
                className="h-44 bg-cover bg-center"
                style={{ backgroundImage: `url('${img}')` }}
              />
              <div className="p-5">
                <h3 className="text-lg font-black">
                  {a} <span className="text-primary">-&gt;</span> {b}
                </h3>
                <p className="mt-2 text-sm text-muted">Route: {c}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const articles = [
  [
    "Safety",
    "What should you check before travelling with someone new?",
    "A practical checklist for reviewing profiles, planning meeting points and staying connected.",
    "5 min read",
    "/Joyful Ride Through Lagos Traffic.webp",
  ],
  [
    "Planning",
    "7 things to do before an intercity trip",
    "Simple preparation that can make a journey smoother and safer.",
    "4 min read",
    "/1b349eb7-56c3-4152-bb64-d7c5697bd1be.webp",
  ],
  [
    "Travel Companions",
    "How to choose the right travel companion",
    "What to look for before agreeing to travel together.",
    "6 min read",
    "/Lagos Travelers Among Yellow Danfos.webp",
  ],
];
function Blog() {
  return (
    <section id="blog" className="py-24">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">Travel tips</p>
          <h2 className="section-title">Travel Smarter</h2>
          <p className="mt-4 text-muted">
            Practical advice for safer journeys, better planning and more
            confident travel.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {articles.map(([cat, title, copy, time, img]) => (
            <article
              key={title}
              className="card-soft overflow-hidden transition hover:-translate-y-1"
            >
              <div
                className="h-52 bg-cover bg-center"
                style={{ backgroundImage: `url('${img}')` }}
              />
              <div className="p-6">
                <p className="eyebrow">{cat}</p>
                <h3 className="mt-3 text-xl font-black leading-snug">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted">{copy}</p>
                <p className="mt-5 text-xs font-bold text-muted">{time}</p>
              </div>
            </article>
          ))}
        </div>
        <Link
          href="/#faq-list"
          className="group mt-8 inline-flex font-bold text-primary"
        >
          Read travel FAQs <Arrow />
        </Link>
      </div>
    </section>
  );
}

const faqs = [
  [
    "What is Kopa-Padi?",
    "Kopa-Padi helps people find compatible travel companions with similar routes, timing and preferences.",
  ],
  [
    "Does Kopa-Padi provide transportation?",
    "No. Kopa-Padi is a companion matching platform and does not operate transportation services.",
  ],
  [
    "How are matches calculated?",
    "Matches consider route, departure time, transport mode, proximity and travel preferences.",
  ],
  [
    "Do I have to travel with someone I'm matched with?",
    "No. You always choose whether to connect or travel with a suggested Padi.",
  ],
  [
    "How does traveler verification work?",
    "Travelers can submit identity information for review so their profiles can display verification status.",
  ],
  [
    "Can I report another traveler?",
    "Yes. You can block and report concerning behavior through the platform.",
  ],
  [
    "What happens if my travel plans change?",
    "You can update or cancel your travel plan before the journey.",
  ],
  [
    "Is Kopa-Padi free?",
    "Creating an account is free. Any future paid features will be clearly disclosed.",
  ],
];
function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-white py-24">
      <div className="container-page grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
        <div>
          <p className="eyebrow">FAQ</p>
          <h2 className="section-title">Questions? We have got you.</h2>
          <p className="mt-4 text-muted">
            Find answers to common questions about Kopa-Padi.
          </p>
          <a
            href="#faq-list"
            className="group mt-6 inline-flex font-bold text-primary"
          >
            View all FAQs <Arrow />
          </a>
        </div>
        <div id="faq-list">
          {faqs.map(([q, a], i) => (
            <div key={q} className="border-b">
              <h3>
                <button
                  type="button"
                  aria-expanded={open === i}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="flex w-full items-center justify-between gap-5 py-5 text-left font-bold"
                >
                  {q}
                  <span className="text-2xl text-primary">
                    <GlyphIcon name={open === i ? "minus" : "+"} />
                  </span>
                </button>
              </h3>
              {open === i && (
                <div
                  id={`faq-${i}`}
                  className="pb-5 pr-8 text-sm leading-6 text-muted"
                >
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section
      className="bg-primary-dark bg-cover bg-center py-20 text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(9,65,61,.9),rgba(9,65,61,.9)),url('/4e44bb4f-a63c-49be-a08d-8157a5fe0b42.webp')",
      }}
    >
      <div className="container-page">
        <h2 className="text-4xl font-black sm:text-5xl">
          Ready to travel together?
        </h2>
        <p className="mt-3 text-white/75">
          Your next journey might already have a Padi.
        </p>
        <div className="mt-8">
          <TripForm compact />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const groups = {
    Product: [["How It Works", "/#how-it-works"], ["Matching Status", "/matching"], ["Travel Plan", "/travel-plans"], ["Journey Safety", "/journey"]],
    Discover: [["About Kopa-Padi", "/#why"], ["Travel Tips", "/#blog"], ["Explore Nigeria", "/#explore-nigeria"]],
    Support: [["FAQs", "/#faq-list"], ["Safety Centre", "/safety"], ["Report a Concern", "/safety"]],
    Account: [["Profile", "/profile"], ["Verification", "/verification"], ["Log In", "/login"], ["Sign Up", "/register"]],
  };
  return (
    <footer id="footer" className="bg-[#0b211f] py-16 text-white">
      <div className="container-page grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <Logo light />
          <p className="mt-4 text-sm text-white/60">
            Travel together. Go further.
          </p>
        </div>
        {Object.entries(groups).map(([title, links]) => (
          <div key={title}>
            <h3 className="font-bold">{title}</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              {links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-page mt-12 border-t border-white/10 pt-6 text-xs text-white/50">
        © {new Date().getFullYear()} Kopa-Padi. All rights reserved.
      </div>
    </footer>
  );
}

export default function Homepage() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <TrustStrip />
      <NigeriaTripMap />
      <HowItWorks />
      <Why />
      <Matching />
      <Safety />
      <PopularRoutes />
      <Blog />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
