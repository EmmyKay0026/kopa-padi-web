import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "Terms and Conditions | Kopa-Padi",
  description: "Draft terms for using Kopa-Padi travel coordination, Travel Circles and Journey Safety features.",
};

const sections = [
  { id: "service", title: "1. What Kopa-Padi provides", paragraphs: [
    "Kopa-Padi helps prospective corps members coordinate travel, find compatible companions, organise Travel Circles and use Journey Safety tools. Creating an account, joining a Circle or completing verification does not book transport or guarantee a seat, accommodation, arrival time or personal safety.",
    "Information shown on Kopa-Padi is not a substitute for current instructions from NYSC, transport providers or public authorities. Use of the platform does not imply their endorsement of a user, journey or arrangement.",
  ] },
  { id: "accounts", title: "2. Accounts and eligibility", paragraphs: [
    "You must be legally able to enter into an agreement and provide accurate account and travel information. Features requiring PCM verification remain unavailable until the relevant verification is complete. Do not impersonate another person, submit altered documents or use someone else's account.",
    "Keep passwords and verification links private. You are responsible for activity you authorise through your account. If you suspect misuse, secure your account and report the concern through the available safety tools.",
  ] },
  { id: "travel", title: "3. Travel arrangements and your responsibilities", paragraphs: [
    "Check your destination camp, departure date, departure window, transport arrangements and public meetup point before agreeing to travel. Confirm fares, payment terms and cancellation arrangements directly with the transport provider or person offering the service. A Circle confirmation is not a transport booking or payment receipt.",
    "Other travellers act independently. Verification supports eligibility checks; it is not a guarantee of another person's identity, conduct or trustworthiness. Use public meetup locations and do not share passwords, financial credentials or unnecessary private documents with other members.",
  ] },
  { id: "circles", title: "4. Circle confirmations and permanent locking", paragraphs: [
    "Circles can lock automatically at their scheduled cutoff. Where group-approved early locking is available, it requires at least half of current members, rounded up, and never fewer than two approvals. Read the current approval count and warning before approving. Pending approvals may be withdrawn before locking and are invalidated when membership changes.",
    "A locked Circle cannot be unlocked and does not accept new members. Locking does not change the agreed departure schedule or start anyone's journey automatically. Each member must prepare and start their own journey. Existing options to leave, report concerns or withdraw safety sharing remain subject to their normal eligibility rules; leaving does not reopen a locked Circle.",
    "Lock requests, approvals, withdrawals and relevant changes are recorded as system notices in Circle chat so members can review them when they return online.",
  ] },
  { id: "sharing", title: "5. Trusted contacts, share links and location", paragraphs: [
    "Only add trusted contacts whose details you are entitled to provide, and let them know how you intend to use those details. Journey links are private access links: anyone who receives or is forwarded a valid link may be able to view the information it makes available. Send links only to people you trust.",
    "Use the available controls to revoke journey links or withdraw temporary location sharing. Revocation stops future authorised access through the link; it cannot recall information someone has already viewed, copied or captured. Check expiry information rather than assuming a link remains active indefinitely.",
    "Location sharing requires your explicit action and is temporary. You should review the audience before sharing. A temporary location update is not a promise of continuous tracking or live monitoring.",
  ] },
  { id: "safety", title: "6. Safety tools and emergency limitations", paragraphs: [
    "Check-ins record updates you choose to submit. Email notifications depend on valid contact details, network access and delivery providers. A queued request, provider acceptance or recorded check-in does not prove that a contact received or read a message.",
    "Kopa-Padi is not an emergency dispatch service and does not guarantee that someone is watching your journey or will respond. If you need urgent assistance, use an appropriate emergency or direct-contact channel. Do not rely solely on an in-app alert.",
  ] },
  { id: "conduct", title: "7. Acceptable use and member content", paragraphs: [
    "Do not harass, threaten, discriminate against, defraud or exploit others. Do not publish another person's private information without authority, make knowingly false reports, distribute unlawful material or interfere with the platform's security. Do not scrape private information, bypass access controls or use the service for unsolicited marketing.",
    "You retain any rights you hold in the content you submit. By submitting content, you permit its use as needed to provide the feature you chose, such as displaying a Circle message to eligible members or a bug report to administrators. This does not give other users permission to reuse your private documents or information.",
  ] },
  { id: "moderation", title: "8. Reports and account restrictions", paragraphs: [
    "Use the Safety Centre for safety concerns and the bug-report tool, when available, for technical problems. Provide accurate information and avoid including unnecessary sensitive details.",
    "Access may be restricted under the platform's moderation and security controls, including for misuse or unmet verification requirements. Where available, review the explanation shown in your account. Restrictions do not remove statutory rights or the sharing-withdrawal controls the platform makes available to eligible owners.",
  ] },
  { id: "privacy", title: "9. Personal information", paragraphs: [
    "Account details, verification documents, Circle messages, trusted-contact details and information you choose to share can contain personal data. These terms do not replace a separate Privacy Notice and do not make agreement to these terms a blanket consent to every use of personal data.",
    "The operator must provide a Privacy Notice explaining its identity, processing purposes, lawful bases, recipients, retention arrangements and how to exercise applicable rights. That notice and the business address must be completed before this draft is adopted for public use.",
  ] },
  { id: "rights", title: "10. Service limitations and your legal rights", paragraphs: [
    "Travel information and service availability can change. Check important arrangements independently and keep an alternative means of contacting your companions and trusted contacts.",
    "Nothing in these terms excludes or limits consumer rights, data-protection rights, remedies or liability that cannot lawfully be excluded or limited. These terms do not require you to waive a right to complain to a competent regulator or seek a remedy available under applicable law.",
  ] },
  { id: "changes", title: "11. Changes and applicable law", paragraphs: [
    "This draft is prepared for a service operating in Nigeria and remains subject to applicable Nigerian law and any other mandatory law protecting you. It does not impose an exclusive court venue or mandatory arbitration requirement.",
    "If revised terms are adopted, their version and effective date should be clearly displayed and material changes communicated before they take effect, as required by applicable law. This draft has no adopted effective date.",
  ] },
  { id: "operator", title: "12. Operator and contact details", paragraphs: [
    "Operator name: Kopa-Padi.",
    "Business or service address: pending confirmation.",
    "Public support: support@kopa-padi.com.ng.",
    "The business address remains to be confirmed. This document remains a draft pending completion and legal review.",
  ] },
] as const;

export default function TermsPage() {
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-white">
      <div className="container-page flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
        <BrandLogo />
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={18} aria-hidden="true" />Back to home</Link>
      </div>
    </header>
    <main id="main-content" className="container-page py-10 sm:py-14">
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-primary"><FileText size={18} aria-hidden="true" />Using Kopa-Padi</p>
        <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Terms and Conditions</h1>
        <p className="mt-4 text-sm text-muted">Draft prepared: <time dateTime="2026-10-24">24 October 2026</time></p>
        <p className="mt-4 leading-7 text-muted">The responsibilities, choices and limits that apply to travel coordination and Journey Safety on Kopa-Padi.</p>
      </div>
      <aside aria-label="Draft status" className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
        <h2 className="font-bold">Draft for review</h2>
        <p className="mt-2 text-sm leading-6">Business address, a separate Privacy Notice and legal review are pending. This is not a final, adopted agreement.</p>
      </aside>
      <div className="grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <nav aria-label="Terms contents" className="rounded-2xl border border-border bg-white p-5 lg:sticky lg:top-6">
          <h2 className="mb-3 font-bold">On this page</h2>
          <ol className="grid gap-1">{sections.map(section => <li key={section.id}><a href={`#${section.id}`} className="block rounded-lg py-2 text-sm text-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{section.title}</a></li>)}</ol>
        </nav>
        <article className="min-w-0 space-y-9 rounded-2xl border border-border bg-white p-5 sm:p-9">
          {sections.map(section => <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-6">
            <h2 id={`${section.id}-title`} className="mb-3 text-xl font-bold">{section.title}</h2>
            <div className="space-y-3">{section.paragraphs.map(paragraph => <p key={paragraph} className="break-words text-sm leading-7 text-muted sm:text-base">{paragraph}</p>)}</div>
          {section.id === "operator" ? <p className="mt-3"><a href="mailto:support@kopa-padi.com.ng" className="font-semibold text-primary underline">Email Kopa-Padi support</a></p> : null}
          </section>)}
          <section aria-labelledby="resources-title" className="border-t border-border pt-6">
            <h2 id="resources-title" className="font-bold">Official rights information</h2>
            <p className="mt-2 text-sm leading-7 text-muted">For general information, visit the <a className="font-semibold text-primary underline" href="https://fccpc.gov.ng/about-us/faqs/">Federal Competition and Consumer Protection Commission</a> or the <a className="font-semibold text-primary underline" href="https://ndpc.gov.ng/faqs/">Nigeria Data Protection Commission</a>. These links do not imply endorsement of Kopa-Padi.</p>
          </section>
        </article>
      </div>
    </main>
    <footer className="border-t border-border bg-white py-6"><div className="container-page flex flex-wrap items-center justify-between gap-4 text-sm text-muted"><span>Kopa-Padi. Travel together. Go further.</span><Link href="/" className="font-semibold text-primary">Return to home</Link></div></footer>
  </div>;
}
