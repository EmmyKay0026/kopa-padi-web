"use client";

import nigeria from "@svg-maps/nigeria";
import {
  ArrowRight,
  ExternalLink,
  MapPin,
  Route,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";

const featuredRoutes: Record<string, string[]> = {
  lagos: ["Ibadan", "Abeokuta", "Benin City"],
  "federal-capital-territory": ["Kaduna", "Lokoja", "Jos"],
  rivers: ["Owerri", "Uyo", "Yenagoa"],
  oyo: ["Lagos", "Ilorin", "Abeokuta"],
  kano: ["Kaduna", "Katsina", "Bauchi"],
  imo: ["Port Harcourt", "Enugu", "Umuahia"],
  kaduna: ["Abuja", "Kano", "Jos"],
  enugu: ["Awka", "Umuahia", "Owerri"],
};

const shortLabels: Record<string, string> = {
  "federal-capital-territory": "FCT",
  "akwa-ibom": "Akwa Ibom",
  "cross-river": "Cross River",
};

type MapLocation = { id: string; name: string; path: string };
type LabelPosition = { x: number; y: number; fontSize: number };
const mapLocations = nigeria.locations as MapLocation[];

function stateHref(path: string, state: string) {
  return `${path}?state=${encodeURIComponent(state)}`;
}

export default function NigeriaTripMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [labelPositions, setLabelPositions] = useState<
    Record<string, LabelPosition>
  >({});
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const selected = selectedId
    ? (mapLocations.find((location) => location.id === selectedId) ?? null)
    : null;
  const routes = selected
    ? (featuredRoutes[selected.id] ?? [
        "nearby cities",
        "interstate hubs",
        "popular destinations",
      ])
    : [];

  useLayoutEffect(() => {
    const positions: Record<string, LabelPosition> = {};
    mapLocations.forEach((location) => {
      const path = pathRefs.current[location.id];
      if (!path) return;
      const bounds = path.getBBox();
      positions[location.id] = {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
        fontSize: Math.max(6, Math.min(11, bounds.width / 5.5)),
      };
    });
    setLabelPositions(positions);
  }, []);

  const chooseState = (location: MapLocation) => {
    setSelectedId(location.id);
    setHoveredId(null);
  };

  return (
    <section
      id="explore-nigeria"
      className="relative overflow-hidden bg-[#eef8f5] py-20 sm:py-24"
    >
      <div className="pointer-events-none absolute -left-32 top-16 h-72 w-72 rounded-full bg-primary-light/70 blur-3xl" />
      <div className="container-page relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
          <div>
            <div className="mb-5 flex items-center justify-between gap-4 lg:hidden">
              <p className="eyebrow">Explore Nigeria</p>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary shadow-sm">
                36 states + FCT
              </span>
            </div>

            <div className="relative mx-auto max-w-[760px]">
              <svg
                viewBox={nigeria.viewBox}
                role="img"
                aria-labelledby="nigeria-map-title nigeria-map-description"
                className="h-auto w-full drop-shadow-[0_20px_35px_rgba(15,118,110,0.13)]"
              >
                <title id="nigeria-map-title">Interactive map of Nigeria</title>
                <desc id="nigeria-map-description">
                  Select a state to explore travel options with Kopa-Padi.
                </desc>
                <g>
                  {mapLocations.map((location) => {
                    const active = location.id === selectedId;
                    const hovered = location.id === hoveredId;
                    return (
                      <path
                        key={location.id}
                        ref={(path) => {
                          pathRefs.current[location.id] = path;
                        }}
                        id={`map-${location.id}`}
                        d={location.path}
                        tabIndex={0}
                        role="button"
                        aria-label={`Explore travel options in ${location.name}`}
                        aria-pressed={active}
                        onClick={() => chooseState(location)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            chooseState(location);
                          }
                        }}
                        onMouseEnter={() => setHoveredId(location.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onFocus={() => setHoveredId(location.id)}
                        onBlur={() => setHoveredId(null)}
                        className="cursor-pointer stroke-white transition-all duration-200 focus:outline-none"
                        style={{
                          fill: active
                            ? "#14b8a6"
                            : hovered
                              ? "#2dd4bf"
                              : "#0f766e",
                          strokeWidth: active || hovered ? 2.8 : 1.6,
                          filter: active
                            ? "drop-shadow(0 5px 7px rgba(13, 94, 89, .28))"
                            : undefined,
                        }}
                      >
                        <title>{location.name}</title>
                      </path>
                    );
                  })}
                </g>
                <g
                  aria-hidden="true"
                  className="pointer-events-none select-none"
                >
                  {mapLocations.map((location) => {
                    const position = labelPositions[location.id];
                    if (!position) return null;
                    return (
                      <text
                        key={location.id}
                        x={position.x}
                        y={position.y}
                        dy="0.35em"
                        textAnchor="middle"
                        fill="white"
                        fontSize={position.fontSize}
                        fontWeight="800"
                        stroke="rgba(5, 55, 51, .45)"
                        strokeWidth="1.7"
                        paintOrder="stroke"
                      >
                        {shortLabels[location.id] ?? location.name}
                      </text>
                    );
                  })}
                </g>
              </svg>

              {selected ? (
                <article
                  className="absolute bottom-3 left-1/2 w-[min(92%,440px)] -translate-x-1/2 rounded-2xl border border-white/80 bg-white/95 p-5 shadow-2xl backdrop-blur-md sm:bottom-8 sm:p-6"
                  aria-live="polite"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[.2em] text-primary">
                        Selected state
                      </p>
                      <h3 className="mt-1 text-2xl font-black tracking-tight">
                        {selected.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      aria-label="Close state details"
                      className="grid h-9 w-9 place-items-center rounded-full bg-primary-light text-primary transition hover:bg-primary hover:text-white"
                    >
                      <X size={17} />
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    Popular connections include {routes.join(", ")}.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <Link
                      href={stateHref("/map", selected.name)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-dark sm:col-span-2"
                    >
                      View on map <ExternalLink size={15} />
                    </Link>
                    <Link
                      href={stateHref("/locations", selected.name)}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary/25 bg-white px-4 text-sm font-bold text-primary transition hover:bg-primary-light"
                    >
                      Choose state
                    </Link>
                    <Link
                      href={stateHref("/travel-plans", selected.name)}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary/25 bg-white px-4 text-sm font-bold text-primary transition hover:bg-primary-light"
                    >
                      Create a plan
                    </Link>
                  </div>
                </article>
              ) : null}
            </div>
          </div>

          <div className="max-w-xl">
            <div className="hidden items-center justify-between gap-4 lg:flex">
              <p className="eyebrow">Explore Nigeria</p>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary shadow-sm">
                36 states + FCT
              </span>
            </div>
            <h2 className="section-title text-4xl sm:text-5xl lg:text-6xl">
              Find a Padi, wherever the road takes you.
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted">
              Tap any state to discover travel possibilities, choose your
              departure area and start planning a safer shared journey.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                [MapPin, "Pick a state", "Start with your location"],
                [Route, "Plan a route", "Set where you are going"],
                [Users, "Meet your Padi", "Match with travelers"],
              ].map(([ItemIcon, title, copy]) => (
                <div
                  key={String(title)}
                  className="rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur"
                >
                  <ItemIcon
                    className="text-primary"
                    size={22}
                    aria-hidden="true"
                  />
                  <h3 className="mt-3 text-sm font-black">{String(title)}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {String(copy)}
                  </p>
                </div>
              ))}
            </div>
            <Link href="/travel-plans" className="btn-primary group mt-8">
              Join a travel plan{" "}
              <ArrowRight
                className="ml-2 transition-transform group-hover:translate-x-1"
                size={18}
              />
            </Link>
            <p className="mt-4 text-xs leading-5 text-muted">
              Map boundaries are for trip discovery and do not imply exact
              pickup locations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
