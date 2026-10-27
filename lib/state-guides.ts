import directory from "./data/state-directory.json" with { type: "json" };

export type StatePhoto = { src: string; alt: string; caption: string; illustrative: boolean };
export type GuideContent = {
  secretariat: { address: string; phoneNumber: string; email: string; sourceUrl: string; googleMapsUrl: string };
  information: {
    capital: string;
    geopoliticalZone: string;
    overview: string;
    spokenLanguages: string;
    culturalHighlights: string;
    localFood: string;
    weatherAndClimate: string;
    transportOptions: string;
    travelSafetyNotes: string;
    costOfLiving: string;
    placesToVisit: string;
    pcmTips: string;
  };
  research: {
    reviewedOn: string;
    status: string;
    notes: string;
    sources: Record<string, string[]>;
    sourceCaveats: string[];
    dynamicFieldsRequireRefresh: string[];
  };
  photos: StatePhoto[];
  expectations: { title: string; description: string }[];
};

export type StateGuideGeography = {
  state: { id: string; name: string };
  lgas: { id: string; name: string }[];
  camps: { id: string; name: string; address: string | null; lga: string | null; latitude: number | null; longitude: number | null; status: string }[];
};

export type StateGuideRecord = GuideContent & { stateId: string; name: string; version: number; updatedAt: string | null };
export type StateGuideInput = GuideContent & { version: number };
export const stateSlugs = directory.states.map(state => state.slug);

/** Editorial content joins the existing geography records through stateId. */
export function getStateGuide(slug: string) {
  const state = directory.states.find((entry) => entry.slug === slug);
  if (!state) return undefined;
  return state;
}

export function stateGuidePayload(guide: StateGuideRecord): StateGuideInput {
  const { version, information, secretariat, research, photos, expectations } = guide;
  return { version, information, secretariat, research, photos, expectations };
}

export async function loadStateGuideContent(stateId: string, fetcher: typeof fetch = fetch) {
  const origin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const response = await fetcher(`${origin}/api/state-guides/${encodeURIComponent(stateId)}`, { cache: "no-store", signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error("The state guide is temporarily unavailable");
  const content = await response.json() as StateGuideRecord;
  if (content.stateId !== stateId) throw new Error("State guide does not match the selected state");
  return { ...content, isDraft: content.research.status !== "verified" };
}

export async function loadStateGuideGeography(stateId: string, fetcher: typeof fetch = fetch): Promise<StateGuideGeography> {
  const origin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const response = await fetcher(`${origin}/api/state-guides/${encodeURIComponent(stateId)}/geography`, {
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error("State geography is temporarily unavailable");
  const geography = await response.json() as StateGuideGeography;
  if (geography.state.id !== stateId) throw new Error("State geography does not match the guide");
  return geography;
}

export function googleMapsHref(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function formatGuideDate(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime())) return "Not reviewed";
  return new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(parsed);
}

export const researchSourceLabels: Record<string, string> = {
  overviewCultureAttractions: "State profile, culture & heritage",
  geopoliticalZone: "Geopolitical zone",
  weatherAndClimate: "Weather & climate",
  travelSafetyNotes: "Travel & safety",
  costOfLiving: "Transport costs & budgeting",
  pcmTips: "NYSC arrival guidance",
  communityAnecdotes: "Community perspectives",
};
