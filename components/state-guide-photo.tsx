"use client";

import Image from "next/image";
import { useState } from "react";

/** Remote placeholders retain a labelled local fallback if the provider is unavailable. */
export function StateGuidePhoto({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;
  return <Image src={failed ? "/Highway to the Granite Monolith.webp" : src} alt={failed ? "Illustrative travel landscape; not a verified photograph of this state" : alt} fill sizes={sizes} className="object-cover" onError={() => setFailedSrc(src)} />;
}
