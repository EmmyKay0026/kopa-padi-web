"use client";
import { GlyphIcon } from "@/components/glyph-icon";

import { api } from "@/lib/api";
import { activeCatalogIntake } from "@/lib/active-intake";
import { formatDateOfBirth, type VerificationDetails } from "@/lib/verification-details";
import Link from "next/link";
import { UserMobileMenu } from "./user-navigation";
import { UserSidebar } from "./user-sidebar";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Intake = {
  id: string;
  serviceYear: string;
  batch: string;
  stream: string;
};
type Camp = { id: string; stateName: string; campName: string };
type Catalog = { intakes: Intake[]; activeIntake?: Intake | null; camps: Camp[] };
type Status = {
  verification: {
    status: string;
    userSafeReason?: string;
    submittedAt?: string;
    verifiedAt?: string;
    dateOfBirth?: string | null;
    matriculationNumber?: string | null;
  };
  intake?: Intake;
  camp?: Camp;
};
type Profile = {
  firstName: string;
  lastNamePrivate: string;
  displayName: string;
};
const nav = [
  ["⌂", "Dashboard", "/app"],
  ["▣", "My Trips", "/travel-plans"],
  ["⌘", "Matches", "/matching"],
  ["♟", "Travel Circle", "/circle"],
  ["✉", "Messages", "/circle"],
  ["♢", "Journey Safety", "/journey"],
  ["⚕", "Safety Centre", "/safety"],
  ["⌖", "Travel Plans", "/travel-plans"],
  ["✓", "Verification", "/verification"],
  ["♙", "Profile", "/profile"],
];
const steps = ["Profile", "NYSC assignment", "Upload document", "Review"];
const size = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <UserSidebar active="Verification" />
      <div className="lg:pl-60">
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-5 lg:hidden">
          <Link href="/app" aria-label="Back">
            <GlyphIcon name="←" />
          </Link>
          <Link href="/" className="font-black text-primary">
            <GlyphIcon name="♟" /> Kopa-Padi
          </Link>
          <UserMobileMenu />
        </header>
        {children}
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-white px-2 py-2 lg:hidden">
          {nav
            .slice(0, 4)
            .concat([nav[8]])
            .map(([icon, label, href]) => (
              <Link
                key={label}
                href={href}
                className={`flex min-h-11 flex-col items-center justify-center text-[9px] font-bold ${label === "Verification" ? "text-primary" : "text-muted"}`}
              >
                <span className="text-base"><GlyphIcon name={icon} /></span>
                {label === "Verification" ? "Verify" : label.replace("My ", "")}
              </Link>
            ))}
        </nav>
      </div>
    </div>
  );
}
function Header() {
  return (
    <header className="border-b border-border bg-surface px-5 py-5 sm:px-8">
      <h1 className="text-2xl font-black tracking-[-.04em]">
        PCM verification
      </h1>
      <p className="mt-1 max-w-lg text-xs leading-5 text-muted">
        Verify your NYSC status to access travel planning and matching features.
      </p>
    </header>
  );
}
function Progress({ step }: { step: number }) {
  return (
    <ol
      className="mx-auto flex max-w-3xl px-5 py-5"
      aria-label={`Step ${step} of 4: ${steps[step - 1]}`}
    >
      {steps.map((label, i) => (
        <li
          key={label}
          className={`relative flex flex-1 flex-col items-center gap-1 text-center text-[8px] font-bold ${i + 1 <= step ? "text-primary" : "text-muted"}`}
        >
          <span
            className={`z-10 grid h-6 w-6 place-items-center rounded-full border ${i + 1 < step ? "border-success bg-success text-white" : i + 1 === step ? "border-primary bg-primary text-white" : "border-border bg-surface"}`}
          >
            {i + 1 < step ? <><GlyphIcon name="✓" /></> : i + 1}
          </span>
          {label}
          {i < 3 && (
            <i
              className={`absolute left-1/2 top-3 h-px w-full ${i + 1 < step ? "bg-success" : "bg-border"}`}
            />
          )}
        </li>
      ))}
    </ol>
  );
}
function StatusCard({ kind, reason }: { kind: string; reason?: string }) {
  const map: Record<string, [string, string, string]> = {
    UNVERIFIED: [
      "Unverified",
      "Complete the steps below to verify your NYSC status.",
      "bg-danger/5 border-danger/15",
    ],
    SUBMITTED: [
      "Submitted — under review",
      "Your verification has been received and is being reviewed.",
      "bg-primary-light/30 border-primary/15",
    ],
    UNDER_REVIEW: [
      "Submitted — under review",
      "Your verification is currently being reviewed.",
      "bg-primary-light/30 border-primary/15",
    ],
    VERIFIED: [
      "Verified",
      "You can access travel planning and matching features.",
      "bg-success/10 border-success/20",
    ],
    RESUBMISSION_REQUIRED: [
      "Resubmission required",
      "Please review the feedback and resubmit.",
      "bg-warning/10 border-warning/25",
    ],
    REJECTED: [
      "Verification not approved",
      "Review the feedback below for next steps.",
      "bg-danger/5 border-danger/20",
    ],
    REVOKED: [
      "Verification unavailable",
      "Contact support if you believe this is incorrect.",
      "bg-danger/5 border-danger/20",
    ],
  };
  const [title, copy, color] = map[kind] ?? map.UNVERIFIED;
  return (
    <section className={`rounded-2xl border p-4 ${color}`}>
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-primary">
          <GlyphIcon name="♢" />
        </span>
        <div>
          <h2 className="text-sm font-black">{title}</h2>
          <p className="mt-1 text-[10px] text-muted">{copy}</p>
        </div>
      </div>
      {reason && (
        <p className="mt-3 rounded-xl bg-white/70 p-3 text-xs text-foreground">
          <b>Reviewer feedback</b>
          <br />
          {reason}
        </p>
      )}
    </section>
  );
}
function Loading() {
  return (
    <Shell>
      <Header />
      <main className="mx-auto max-w-3xl animate-pulse space-y-4 px-5 py-6">
        <div className="h-20 rounded-2xl bg-slate-100" />
        <div className="h-10 rounded-xl bg-slate-100" />
        <div className="h-72 rounded-2xl bg-slate-100" />
        <div className="h-12 rounded-xl bg-slate-100" />
        <span className="sr-only" role="status">
          Loading verification
        </span>
      </main>
    </Shell>
  );
}
function FilePicker({
  file,
  setFile,
  error,
  setError,
}: {
  file: File | null;
  setFile: (f: File | null) => void;
  error: string;
  setError: (v: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  function check(candidate?: File) {
    if (!candidate) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(candidate.type)) {
      setError("File must be PDF, JPG or PNG.");
      return;
    }
    if (candidate.size > 5 * 1024 * 1024) {
      setError("File must be 5 MB or smaller.");
      return;
    }
    setError("");
    setFile(candidate);
  }
  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => ref.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            ref.current?.click();
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e: DragEvent) => {
          e.preventDefault();
          check(e.dataTransfer.files[0]);
        }}
        className="grid min-h-44 cursor-pointer place-items-center rounded-2xl border border-dashed border-primary/40 bg-primary-light/10 p-5 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        <div>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-light/60 text-2xl text-primary">
            ↥
          </span>
          <b className="mt-3 block text-sm">Drag and drop your file here</b>
          <span className="mt-3 inline-grid min-h-11 place-items-center rounded-xl border border-primary px-5 text-xs font-bold text-primary">
            Choose file
          </span>
        </div>
        <input
          ref={ref}
          className="sr-only"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            check(e.target.files?.[0])
          }
        />
      </div>
      {file && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary-light/20 p-3">
          <span><GlyphIcon name="▧" /></span>
          <p className="min-w-0 flex-1">
            <b className="block truncate text-xs">{file.name}</b>
            <small className="text-muted">
              {file.type} · {size(file.size)}
            </small>
          </p>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="text-xs font-bold text-primary"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="text-xs font-bold text-danger"
          >
            Remove
          </button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs font-bold text-danger">
          {error}
        </p>
      )}
      <p className="mt-3 text-[10px] leading-5 text-muted">
        Accepted formats: PDF, JPG, JPEG, PNG
        <br />
        Maximum file size: 5 MB. Do not upload unrelated identity documents.
      </p>
    </>
  );
}
function Privacy() {
  return (
    <section className="mt-5 rounded-xl bg-primary-light/30 p-4 text-[10px] leading-5 text-muted">
      <b className="text-primary-dark"><GlyphIcon name="▣" /> &nbsp; Your verification details are private</b>
      <p>
        Your document, date of birth and matriculation number are only available
        to you and authorized Kopa-Padi reviewers. Other travelers cannot access
        them. Your private last name is not public, and your
        verified camp becomes your trusted Travel Plan destination.
      </p>
    </section>
  );
}

function SenateListFields({ details, onChange, disabled = false }: {
  details: VerificationDetails;
  onChange: (key: keyof VerificationDetails, value: string) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="mt-4">
      <legend className="text-sm font-bold">NYSC Senate list details</legend>
      <p className="mb-3 mt-1 text-xs leading-5 text-muted">
        Enter these exactly as recorded with your institution. Only authorized
        reviewers can use them to check your NYSC Senate list record.
      </p>
      <label className="travel-label">
        Date of birth *
        <input className="field" name="dateOfBirth" type="date" required
          autoComplete="bday" min="0001-01-01" max={new Date().toISOString().slice(0, 10)}
          value={details.dateOfBirth} onChange={(e) => onChange("dateOfBirth", e.target.value)} />
      </label>
      <label className="travel-label">
        Matriculation number *
        <input className="field" name="matriculationNumber" type="text" required
          maxLength={80} autoCapitalize="none" spellCheck={false}
          aria-describedby="matriculation-number-help"
          value={details.matriculationNumber} onChange={(e) => onChange("matriculationNumber", e.target.value)} />
        <small id="matriculation-number-help">Use your institution&apos;s matriculation number, including any letters, slashes or leading zeros.</small>
      </label>
    </fieldset>
  );
}

export function VerificationFlow() {
  const [catalog, setCatalog] = useState<Catalog>({ intakes: [], camps: [] }),
    [status, setStatus] = useState<Status>(),
    [loading, setLoading] = useState(true),
    [step, setStep] = useState(1),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [fileError, setFileError] = useState(""),
    [file, setFile] = useState<File | null>(null),
    [details, setDetails] = useState<VerificationDetails>({ dateOfBirth: "", matriculationNumber: "" }),
    [profile, setProfile] = useState<Profile>({
      firstName: "",
      lastNamePrivate: "",
      displayName: "",
    }),
    [campId, setCampId] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [c, s] = await Promise.all([
        api<Catalog>("/catalog"),
        api<Status>("/verification/status"),
      ]);
      setCatalog(c);
      setStatus(s);
      setDetails((previous) => ({
        dateOfBirth: s.verification.dateOfBirth ?? previous.dateOfBirth,
        matriculationNumber: s.verification.matriculationNumber ?? previous.matriculationNumber,
      }));
      if (s.camp) setCampId(s.camp.id);
    } catch {
      setError("We couldn't load verification right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  if (loading) return <Loading />;
  const state = status?.verification.status ?? "UNVERIFIED";
  const pending = state === "SUBMITTED" || state === "UNDER_REVIEW";
  const intake = activeCatalogIntake(catalog);
  const year = intake?.serviceYear ?? "";
  const batch = intake?.batch ?? "";
  const stream = intake?.stream ?? "";
  const camp = catalog.camps.find((x) => x.id === campId);
  function changeDetails(key: keyof VerificationDetails, value: string) {
    setDetails((previous) => ({ ...previous, [key]: value }));
  }
  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (
      !profile.firstName.trim() ||
      !profile.lastNamePrivate.trim() ||
      !profile.displayName.trim() ||
      !details.dateOfBirth ||
      !details.matriculationNumber.trim()
    ) {
      setError("Complete all profile fields.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api("/me/profile", {
        method: "PUT",
        body: JSON.stringify(profile),
      });
      setStep(2);
    } catch {
      setError("We couldn't save your profile right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  function assignmentNext() {
    if (!intake) {
      setError("No NYSC batch and stream are currently open. Please check back later.");
      return;
    }
    if (!campId) {
      setError("Select your assigned orientation camp.");
      return;
    }
    setError("");
    setStep(3);
  }
  function documentNext() {
    if (!file) {
      setFileError("Choose your NYSC call-up letter.");
      return;
    }
    setStep(4);
  }
  async function submit() {
    const assignment = state === "RESUBMISSION_REQUIRED" ? status?.intake : intake;
    const assignedCampId = state === "RESUBMISSION_REQUIRED" ? status?.camp?.id : campId;
    if (!file || !assignment || !assignedCampId || busy) return;
    if (!details.dateOfBirth || !details.matriculationNumber.trim()) {
      setError("Enter your date of birth and matriculation number.");
      return;
    }
    setBusy(true);
    setError("");
    const body = new FormData();
    body.set("nyscIntakeId", assignment.id);
    body.set("orientationCampId", assignedCampId);
    body.set("dateOfBirth", details.dateOfBirth);
    body.set("matriculationNumber", details.matriculationNumber.trim());
    body.set("document", file);
    try {
      await api("/verification", { method: "POST", body });
      await load();
    } catch (error) {
      if (error instanceof Error && error.message === "The active NYSC intake has changed. Refresh and try again.") {
        await load();
        setStep(2);
        setFile(null);
      }
      setError(
        error instanceof Error ? error.message : "We couldn't submit your verification right now. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (pending)
    return (
      <Shell>
        <Header />
        <main className="mx-auto max-w-2xl space-y-4 px-5 pb-28 pt-6">
          <StatusCard kind={state} />
          <section className="rounded-2xl border border-border bg-surface p-6 text-center shadow-soft">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary-light/40 text-4xl text-primary">
              ⌛
            </span>
            <h2 className="mt-5 text-xl font-black">
              Verification in progress
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-muted">
              We&apos;ve received your information. We&apos;ll notify you once
              the review is complete.
            </p>
            <dl className="mt-6 grid gap-3 rounded-xl bg-background p-4 text-xs text-left">
              {[
                ["Service year", status?.intake?.serviceYear],
                ["Batch", status?.intake?.batch],
                ["Stream", status?.intake?.stream],
                ["Orientation camp", status?.camp?.campName],
              ].map(([k, v]) => (
                <div className="flex justify-between" key={k}>
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-bold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 rounded-xl bg-primary-light/30 p-4 text-[10px] text-muted">
              We&apos;ll send you a notification and email when your
              verification is approved or if changes are needed.
            </p>
            <Link
              href="/app"
              className="mt-5 grid min-h-12 place-items-center rounded-xl border border-primary font-bold text-primary"
            >
              Back to dashboard
            </Link>
          </section>
        </main>
      </Shell>
    );
  if (state === "VERIFIED" && status)
    return (
      <Shell>
        <Header />
        <main className="mx-auto max-w-2xl space-y-4 px-5 pb-28 pt-6">
          <StatusCard kind={state} />
          <section className="rounded-2xl border border-success/20 bg-surface p-6 text-center shadow-soft">
            <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-success/10 text-5xl text-success">
              <GlyphIcon name="✓" />
            </span>
            <h2 className="mt-5 text-2xl font-black">You&apos;re verified!</h2>
            <p className="mt-2 text-sm text-muted">
              You can now access travel planning and matching features.
            </p>
            <dl className="mt-6 grid gap-3 rounded-xl bg-background p-4 text-left text-xs">
              {[
                ["Service year", status.intake?.serviceYear],
                ["Batch", status.intake?.batch],
                ["Stream", status.intake?.stream],
                ["Orientation camp", status.camp?.campName],
                ["Camp state", status.camp?.stateName],
              ].map(([k, v]) => (
                <div className="flex justify-between" key={k}>
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-bold">{v}</dd>
                </div>
              ))}
            </dl>
            <Link href="/travel-plans" className="btn-primary mt-6 w-full">
              Continue to Travel Plans <GlyphIcon name="→" />
            </Link>
            <Link
              href="/app"
              className="mt-3 grid min-h-12 place-items-center rounded-xl border border-primary font-bold text-primary"
            >
              Go to dashboard
            </Link>
          </section>
        </main>
      </Shell>
    );
  if (state === "RESUBMISSION_REQUIRED")
    return (
      <Shell>
        <Header />
        <main className="mx-auto max-w-2xl space-y-4 px-5 pb-28 pt-6">
          <StatusCard
            kind={state}
            reason={status?.verification.userSafeReason}
          />
          <form onSubmit={(event) => { event.preventDefault(); void submit(); }} className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <h2 className="text-lg font-black">Update your information</h2>
            <p className="mt-1 text-xs text-muted">
              Check your date of birth and matriculation number, then upload a
              new call-up letter. Your saved NYSC assignment is preserved.
            </p>
            <div className="my-5 rounded-xl bg-background p-4 text-xs">
              <b>
                {status?.intake?.serviceYear} · {status?.intake?.batch} ·{" "}
                {status?.intake?.stream}
              </b>
              <p className="mt-1 text-muted">
                {status?.camp?.campName}, {status?.camp?.stateName}
              </p>
            </div>
            <SenateListFields details={details} onChange={changeDetails} disabled={busy} />
            <FilePicker
              file={file}
              setFile={setFile}
              error={fileError}
              setError={setFileError}
            />
            <Privacy />
            <button
              type="submit"
              disabled={!file || busy}
              className="btn-primary mt-5 w-full"
            >
              {busy ? "Resubmitting..." : "Resubmit verification"}
            </button>
            {error && (
              <p
                role="alert"
                className="mt-3 rounded-xl bg-danger/10 p-3 text-xs text-danger"
              >
                {error}
              </p>
            )}
          </form>
        </main>
        {busy && <Overlay />}
      </Shell>
    );
  if (state === "REJECTED" || state === "REVOKED")
    return (
      <Shell>
        <Header />
        <main className="mx-auto max-w-2xl px-5 py-8">
          <StatusCard
            kind={state}
            reason={status?.verification.userSafeReason}
          />
          <Link
            href="/app"
            className="mt-5 grid min-h-12 place-items-center rounded-xl border border-primary font-bold text-primary"
          >
            Back to dashboard
          </Link>
        </main>
      </Shell>
    );
  return (
    <Shell>
      <Header />
      <Progress step={step} />
      <main className="mx-auto max-w-3xl px-5 pb-32">
        <StatusCard kind="UNVERIFIED" />
        <section className="mt-4 rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <div key={step} className="enter">
            {step === 1 ? (
              <form onSubmit={saveProfile}>
                <h2 className="text-lg font-black">1. Your PCM profile</h2>
                <p className="mb-5 mt-1 text-xs text-muted">
                  Tell us a little about yourself.
                </p>
                {[
                  ["firstName", "First name *", "This helps identify you."],
                  [
                    "lastNamePrivate",
                    "Last name (private) *",
                    "Your last name is kept private and is not shown to other travelers.",
                  ],
                  [
                    "displayName",
                    "Display name *",
                    "This is the name other travelers may see.",
                  ],
                ].map(([key, label, help]) => (
                  <label className="travel-label" key={key}>
                    {label}
                    <input
                      className="field"
                      maxLength={80}
                      value={profile[key as keyof Profile]}
                      onChange={(e) =>
                        setProfile((v) => ({ ...v, [key]: e.target.value }))
                      }
                    />
                    <small className="font-normal text-muted">{help}</small>
                  </label>
                ))}
                <SenateListFields details={details} onChange={changeDetails} disabled={busy} />
                <button disabled={busy} className="btn-primary mt-6 w-full">
                  {busy ? "Saving..." : "Save profile"}
                </button>
              </form>
            ) : step === 2 ? (
              <>
                <h2 className="text-lg font-black">2. Your NYSC assignment</h2>
                <p className="mb-5 mt-1 text-xs text-muted">
                  Your service year, batch and stream are set by the active intake. Select your assigned orientation camp.
                </p>
                {intake ? <section aria-label="Active NYSC intake" className="rounded-xl border border-primary/20 bg-primary-light/25 p-5">
                  <p className="text-xs font-bold text-primary">Active NYSC intake</p>
                  <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">{[["Service year", year], ["Batch", batch], ["Stream", stream]].map(([label, value]) => <div key={label}><dt className="text-xs text-muted">{label}</dt><dd className="mt-1 font-bold">{value}</dd></div>)}</dl>
                  <p className="mt-4 text-xs leading-6 text-muted">This assignment is fixed for new verifications. Your call-up letter should match this intake.</p>
                </section> : <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">No NYSC batch and stream are currently open. Please check back later.</p>}
                <label className="travel-label">
                  Orientation camp *
                  <select
                    className="field"
                    value={campId}
                    onChange={(e) => setCampId(e.target.value)}
                  >
                    <option value="">Select your camp</option>
                    {catalog.camps.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.campName} — {v.stateName}
                      </option>
                    ))}
                  </select>
                </label>
                <Actions back={() => setStep(1)} next={assignmentNext} disabled={!intake} />
              </>
            ) : step === 3 ? (
              <>
                <h2 className="text-lg font-black">
                  3. Upload your call-up letter
                </h2>
                <p className="mb-5 mt-1 text-xs text-muted">
                  Upload the call-up letter issued by NYSC.
                </p>
                <FilePicker
                  file={file}
                  setFile={setFile}
                  error={fileError}
                  setError={setFileError}
                />
                <Privacy />
                <Actions back={() => setStep(2)} next={documentNext} />
              </>
            ) : (
              <>
                <h2 className="text-lg font-black">4. Review and submit</h2>
                <p className="mb-5 mt-1 text-xs text-muted">
                  Please check your information before submitting.
                </p>
                <Review
                  title="PCM profile"
                  edit={() => setStep(1)}
                  rows={[
                    ["First name", profile.firstName],
                    ["Last name (private)", profile.lastNamePrivate],
                    ["Display name", profile.displayName],
                    ["Date of birth (private)", formatDateOfBirth(details.dateOfBirth)],
                    ["Matriculation number (private)", details.matriculationNumber.trim()],
                  ]}
                />
                <Review
                  title="NYSC assignment"
                  edit={() => setStep(2)}
                  rows={[
                    ["Service year", year],
                    ["Batch", batch],
                    ["Stream", stream],
                    [
                      "Orientation camp",
                      camp ? `${camp.campName}, ${camp.stateName}` : "",
                    ],
                  ]}
                />
                <Review
                  title="Document"
                  edit={() => setStep(3)}
                  rows={[
                    [
                      "Call-up letter",
                      file ? `${file.name} (${size(file.size)})` : "",
                    ],
                  ]}
                />
                <p className="mt-5 rounded-xl bg-primary-light/30 p-4 text-[10px] text-muted">
                  ⓘ &nbsp; Your information is used only to verify NYSC status
                  and enable travel features.
                </p>
                <Actions
                  back={() => setStep(3)}
                  next={() => void submit()}
                  submit
                />
              </>
            )}
          </div>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-danger/10 p-3 text-xs text-danger"
            >
              {error}
            </p>
          )}
        </section>
      </main>
      {busy && step === 4 && <Overlay />}
    </Shell>
  );
}
function Actions({
  back,
  next,
  submit = false,
  disabled = false,
}: {
  back: () => void;
  next: () => void;
  submit?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={back}
        className="min-h-12 rounded-xl border font-bold"
      >
        <GlyphIcon name="←" /> Back
      </button>
      <button type="button" onClick={next} disabled={disabled} className="btn-primary disabled:opacity-50">
        {submit ? "Submit verification" : <>Continue <GlyphIcon name="→" /></>}
      </button>
    </div>
  );
}
function Review({
  title,
  rows,
  edit,
}: {
  title: string;
  rows: string[][];
  edit: () => void;
}) {
  return (
    <section className="mt-4 rounded-xl border border-border p-4">
      <header className="flex justify-between">
        <b className="text-xs"><GlyphIcon name="▣" /> &nbsp; {title}</b>
        <button onClick={edit} className="text-xs font-bold text-primary">
          Edit
        </button>
      </header>
      <dl className="mt-3 grid gap-2 text-[10px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <dt className="text-muted">{k}</dt>
            <dd className="max-w-[60%] text-right font-bold">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
function Overlay() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-5">
      <section
        role="status"
        aria-live="assertive"
        className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl"
      >
        <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-4 border-primary-light border-t-primary" />
        <h2 className="mt-5 text-lg font-black">
          Submitting your verification
        </h2>
        <p className="mt-2 text-xs leading-5 text-muted">
          Please wait while we upload your document and submit your information
          for review.
        </p>
        <b className="mt-4 block text-[10px]">Do not close this page.</b>
      </section>
    </div>
  );
}
