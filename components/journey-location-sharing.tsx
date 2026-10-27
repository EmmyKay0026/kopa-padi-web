"use client";

import { useEffect, useState } from "react";
import { formatSharingTime, isShareActive, sharingDurationLabel } from "@/lib/journey-sharing";

export type LocationAudience = "TRUSTED_CONTACT" | "CIRCLE";
export type TemporaryLocation = { id: string; audience: LocationAudience; sharedAt: string; expiresAt: string };
export type LocationSharingPolicy = { defaultDurationMinutes: number; maxDurationMinutes: number };

export function useSharingNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    refresh();
    const timer = window.setInterval(refresh, 1000);
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);
  return now;
}

function LocationExpiry({ location, now }: { location?: TemporaryLocation; now: number }) {
  if (!location) return <p className="text-xs text-muted">No temporary location shared yet.</p>;
  if (new Date(location.expiresAt).getTime() <= now) {
    return <p className="text-xs font-bold text-muted">Location expired or withdrawn. Renew to share a fresh location.</p>;
  }
  return <p className="text-xs text-muted">Location visible until <time dateTime={location.expiresAt}>{formatSharingTime(location.expiresAt)}</time>.</p>;
}

export function JourneyLocationSharing({ locations, policy, busy, contactLinks, circle, onShare }: {
  locations: TemporaryLocation[];
  policy: LocationSharingPolicy;
  busy: boolean;
  contactLinks: { status: string; expiresAt: string }[];
  circle: boolean;
  onShare: (audience: LocationAudience, durationMinutes: number) => void;
}) {
  const now = useSharingNow();
  const hasContactLink = contactLinks.some((share) => isShareActive(share, now));
  const [chosenDuration, setChosenDuration] = useState<number | null>(null);
  const duration = chosenDuration ?? policy.defaultDurationMinutes;
  const choices = [...new Set([1, 15, 30, 60, 120, 240, 480, 1440, policy.defaultDurationMinutes])]
    .filter((minutes) => minutes <= policy.maxDurationMinutes).sort((a, b) => a - b);
  const trusted = locations.find((location) => location.audience === "TRUSTED_CONTACT");
  const circleLocation = locations.find((location) => location.audience === "CIRCLE");

  return (
    <section className="mt-4 space-y-3 border-t pt-4" aria-label="Temporary location sharing">
      <h3 className="font-bold">Share a temporary location</h3>
      <p className="text-xs leading-5 text-muted">
        Your location expires after {policy.defaultDurationMinutes} minutes by default. Choose how long it stays visible below.
        Each share captures your current position once. Renew to update your position or restart the timer; renewal is never automatic.
      </p>
      <label className="grid gap-1 text-xs font-bold">
        Location visibility duration
        <select className="field" value={duration} disabled={busy} onChange={(event) => setChosenDuration(Number(event.target.value))}>
          {choices.map((minutes) => <option key={minutes} value={minutes}>{sharingDurationLabel(minutes)}{minutes === policy.defaultDurationMinutes ? " (default)" : ""}</option>)}
        </select>
      </label>
      <div className="space-y-2 rounded-xl bg-background p-3">
        <h4 className="text-sm font-bold">Trusted contacts</h4>
        <LocationExpiry location={trusted} now={now} />
        <button disabled={busy || !hasContactLink} className="btn-primary w-full" onClick={() => onShare("TRUSTED_CONTACT", duration)}>
          {trusted ? "Renew location" : "Share Location"}
        </button>
        {!hasContactLink ? <p className="text-xs text-muted">Create or renew a trusted contact’s Journey link first.</p> : null}
        <p className="text-xs text-muted">All trusted contacts with an active Journey link can view this snapshot. Send them their link yourself.</p>
      </div>
      {circle ? (
        <div className="space-y-2 rounded-xl bg-background p-3">
          <h4 className="text-sm font-bold">Travel Circle</h4>
          <LocationExpiry location={circleLocation} now={now} />
          <button disabled={busy} className="w-full rounded-xl border bg-white p-3 text-sm font-bold text-primary" onClick={() => onShare("CIRCLE", duration)}>
            {circleLocation ? "Renew Circle location" : "Share temporary location with Circle"}
          </button>
        </div>
      ) : null}
      <p className="text-xs leading-5 text-muted">Changing the duration affects your next share. To change an existing expiry, choose a duration and renew. You can withdraw all temporary locations using Your sharing controls.</p>
    </section>
  );
}

export function JourneyLocationGuide() {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm" aria-label="Location sharing instructions">
      <h2 className="text-lg font-black">Keep family informed</h2>
      <details className="mt-3 rounded-xl border p-3">
        <summary className="cursor-pointer text-sm font-bold">Share a Kopa-Padi location snapshot</summary>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
          <li>Add a family member under Trusted Contacts. Select Share (or Renew link), then copy and send them their private Journey link.</li>
          <li>Start your journey. Under Need Help?, choose a location visibility duration, select Share Location and allow browser location access.</li>
          <li>Ask your family member to open their Journey link and select View temporary location to see the snapshot in Google Maps.</li>
          <li>Use Renew location for a fresh position or more time. When your journey ends, use Your sharing controls to withdraw temporary locations and revoke Journey links.</li>
        </ol>
      </details>
      <details className="mt-3 rounded-xl border p-3">
        <summary className="cursor-pointer text-sm font-bold">Share live location using the Google Maps app</summary>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
          <li>On your phone, open Google Maps and sign in to your Google account. Turn on device location.</li>
          <li>Tap your profile picture or initial, then Location sharing → New share.</li>
          <li>Choose a time limit that covers your journey. Select a family member and tap Share, or use the link or messaging option to send a link privately.</li>
          <li>When your journey ends, return to Location sharing, select the person or link you shared with, and tap Stop. Check each active share.</li>
        </ol>
        <p className="mt-3 text-xs leading-5 text-muted">Google Maps uses the duration you select there. Kopa-Padi’s location expiry and revoke controls do not stop Google Maps sharing. Stop it in Google Maps, and revoke your Kopa-Padi Journey links separately.</p>
        <a href="https://support.google.com/maps/answer/15437054" target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-bold text-primary underline">Google Maps sharing instructions</a>
      </details>
    </section>
  );
}
