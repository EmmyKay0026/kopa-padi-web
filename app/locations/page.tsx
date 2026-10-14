import {LocationSelector} from '@/components/location-selector';
import { Suspense } from 'react';
export const metadata={title:'Departure Location | Kopa-Padi',description:'Select your general departure area for safer, more relevant travel matching.'};
export default function LocationsPage(){return <Suspense fallback={<main className="p-8" role="status">Loading departure locations…</main>}><LocationSelector/></Suspense>}
