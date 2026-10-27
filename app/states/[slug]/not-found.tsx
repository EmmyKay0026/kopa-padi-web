import Link from "next/link";

export default function StateNotFound() {
  return (
    <main className="container-page grid min-h-screen place-content-center py-16 text-center">
      <p className="eyebrow">State guide unavailable</p>
      <h1 className="section-title">Let’s find your state.</h1>
      <p className="mt-4 text-muted">This state guide could not be found. Select a state on the Nigeria map to keep exploring.</p>
      <Link href="/#explore-nigeria" className="btn-primary mx-auto mt-7">Back to the Nigeria map</Link>
    </main>
  );
}
