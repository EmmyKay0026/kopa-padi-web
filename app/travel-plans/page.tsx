import { TravelPlanManager } from "@/components/travel-plan-manager";
import { Suspense } from 'react';
export default function TravelPlansPage(){return <Suspense fallback={<main className="p-8" role="status">Loading Travel Plan…</main>}><TravelPlanManager/></Suspense>}
