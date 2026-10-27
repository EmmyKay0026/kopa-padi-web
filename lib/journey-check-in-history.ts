export type SharedCheckIn = { id: string; type: string; message: string | null; createdAt: string };
export type CheckInHistoryPage = { items: SharedCheckIn[]; nextCursor: string | null };

export const emptyCheckInHistory: CheckInHistoryPage = { items: [], nextCursor: null };

const copy: Record<string, { label: string; icon: "shield" | "route" | "pin" | "warning" | "flag" | "journey" | "check" }> = {
  SAFE: { label: "I’m Safe", icon: "shield" },
  CONNECTION_REACHED: { label: "Connection Reached", icon: "route" },
  NEAR_DESTINATION: { label: "Near Destination", icon: "pin" },
  NEED_HELP: { label: "Need Help", icon: "warning" },
  ARRIVED: { label: "I’ve Arrived", icon: "flag" },
  STARTED: { label: "Journey Started", icon: "journey" },
};

export function checkInPresentation(type: string) {
  return copy[type] ?? { label: type.replaceAll("_", " "), icon: "check" as const };
}

const historyTime = new Intl.DateTimeFormat("en-NG", {
  day: "numeric", month: "short", year: "numeric",
  hour: "2-digit", minute: "2-digit", second: "2-digit",
  hourCycle: "h23", timeZone: "Africa/Lagos",
});

export function formatCheckInTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : historyTime.format(date);
}

function uniqueCheckIns(items: SharedCheckIn[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/** Preserve already loaded older pages while a normal refresh adds newer updates. */
export function refreshCheckInHistory(current: CheckInHistoryPage, latest: CheckInHistoryPage): CheckInHistoryPage {
  const ids = new Set(current.items.map((item) => item.id));
  if (!latest.items.some((item) => ids.has(item.id))) return latest;
  return { items: uniqueCheckIns([...latest.items, ...current.items]), nextCursor: current.nextCursor };
}

export function appendCheckInHistory(current: CheckInHistoryPage, older: CheckInHistoryPage): CheckInHistoryPage {
  return { items: uniqueCheckIns([...current.items, ...older.items]), nextCursor: older.nextCursor };
}
