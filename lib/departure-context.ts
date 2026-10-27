export type DepartureOption = { id: string; name: string };
export type DepartureSelection = {
  originStateId: string;
  originLgaId: string;
  originTownId: string;
};

function singleValue(params: URLSearchParams, key: string) {
  const values = params.getAll(key);
  if (values.length !== 1) return "";
  const value = values[0].trim();
  return value.length <= 100 ? value : "";
}

function normalizedState(value: string) {
  if (!/^[\p{L}\p{N}\s.,()-]+$/u.test(value)) return "";
  const key = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  return ["fct", "abuja", "fctabuja", "abujafct", "federalcapitalterritory", "federalcapitalterritoryabuja"].includes(key)
    ? "federalcapitalterritory"
    : key;
}

export function resolveDepartureState(params: URLSearchParams, states: DepartureOption[]) {
  // Explicit IDs take precedence; an invalid ID must not select an unrelated state.
  if (params.has("originStateId")) {
    const id = singleValue(params, "originStateId");
    return states.find((state) => state.id === id);
  }
  const name = normalizedState(singleValue(params, "state"));
  if (!name) return undefined;
  const matches = states.filter((state) => normalizedState(state.name) === name);
  return matches.length === 1 ? matches[0] : undefined;
}

export async function resolveDepartureContext(
  params: URLSearchParams,
  states: DepartureOption[],
  loadLgas: (stateId: string) => Promise<DepartureOption[]>,
  loadTowns: (lgaId: string) => Promise<DepartureOption[]>,
): Promise<DepartureSelection> {
  const selection = { originStateId: "", originLgaId: "", originTownId: "" };
  const state = resolveDepartureState(params, states);
  if (!state) return selection;
  selection.originStateId = state.id;
  const lgaId = singleValue(params, "originLgaId");
  if (!lgaId) return selection;
  const lgas = await loadLgas(state.id);
  const lga = lgas.find((option) => option.id === lgaId);
  if (!lga) return selection;
  selection.originLgaId = lga.id;
  const townId = singleValue(params, "originTownId");
  if (!townId) return selection;
  const towns = await loadTowns(lga.id);
  selection.originTownId = towns.find((option) => option.id === townId)?.id ?? "";
  return selection;
}

export function departurePlanHref(selection: DepartureSelection) {
  const params = new URLSearchParams({
    originStateId: selection.originStateId,
    originLgaId: selection.originLgaId,
  });
  if (selection.originTownId) params.set("originTownId", selection.originTownId);
  return `/travel-plans?${params}`;
}

/** A state choice selects a camp only when the API offers an unambiguous match. */
export function resolveDestinationCamp(
  params: URLSearchParams,
  camps: { id: string; stateName: string }[],
  preferredCampId?: string,
) {
  if (!params.has("destinationState")) {
    return camps.find((camp) => camp.id === preferredCampId)?.id ?? "";
  }
  const state = normalizedState(singleValue(params, "destinationState"));
  if (!state) return "";
  const matches = camps.filter((camp) => normalizedState(camp.stateName) === state);
  const preferred = matches.find((camp) => camp.id === preferredCampId);
  return preferred?.id ?? (matches.length === 1 ? matches[0].id : "");
}

/** URL selections are hints for a new plan; invalid or repeated values never become form defaults. */
export function resolveTravelSchedule<Window extends string, Mode extends string>(
  params: URLSearchParams,
  today: string,
  options: { departureWindows: readonly Window[]; transportModes: readonly Mode[] },
) {
  const selection: Partial<{ intendedTravelDate: string; departureWindow: Window; transportMode: Mode }> = {};
  const date = singleValue(params, "intendedTravelDate");
  if (/^\d{4}-\d{2}-\d{2}$/.test(date) && date >= today) {
    const parsed = new Date(`${date}T00:00:00Z`);
    if (!Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date) {
      selection.intendedTravelDate = date;
    }
  }
  const window = options.departureWindows.find((value) => value === singleValue(params, "departureWindow"));
  const mode = options.transportModes.find((value) => value === singleValue(params, "transportMode"));
  if (window) selection.departureWindow = window;
  if (mode) selection.transportMode = mode;
  return selection;
}
