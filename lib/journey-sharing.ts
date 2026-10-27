export type JourneyShare = {
  trustedContactId: string;
  status: string;
  expiresAt: string;
};

export function isShareActive(share: { status: string; expiresAt: string }, now: number) {
  return share.status === "ACTIVE" && new Date(share.expiresAt).getTime() > now;
}

export function contactShareState(shares: JourneyShare[], contactId: string, now: number) {
  const matching = shares.filter((share) => share.trustedContactId === contactId);
  const active = matching.find((share) => isShareActive(share, now));
  if (active) return { status: "active" as const, share: active };
  if (matching.some((share) => share.status === "EXPIRED" || (share.status === "ACTIVE" && new Date(share.expiresAt).getTime() <= now))) {
    return { status: "expired" as const, share: null };
  }
  return { status: "inactive" as const, share: null };
}

export function formatSharingTime(value: string) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "medium" }).format(new Date(value));
}

export function sharingDurationLabel(minutes: number) {
  if (minutes < 60 || minutes % 60 !== 0) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = minutes / 60;
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}
