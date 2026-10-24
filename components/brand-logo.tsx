import Image from "next/image";
import Link from "next/link";

/** Use the supplied artwork without recreating or recoloring the wordmark. */
export function BrandLogo({
  href = "/",
  light = false,
  className = "",
}: {
  href?: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} aria-label="Kopa-Padi home" className={`inline-flex shrink-0 items-center ${className}`}>
      <Image
        src={light ? "/SVG/04b_reversed_horizontal_white.svg" : "/SVG/02_horizontal.svg"}
        alt="Kopa-Padi"
        width={1440}
        height={385}
        unoptimized
        style={{ width: 176, maxWidth: "100%", height: "auto" }}
      />
    </Link>
  );
}
