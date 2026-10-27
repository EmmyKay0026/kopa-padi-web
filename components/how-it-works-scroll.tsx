"use client";

import { JOURNEY_STEPS } from "@/lib/how-it-works-steps";
import { ArrowDown, ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./how-it-works-scroll.module.css";

/** Independent comparison version; the original tabbed section stays unchanged. */
export default function HowItWorksScroll() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const current = JOURNEY_STEPS[active];

  useEffect(() => {
    let observer: IntersectionObserver | undefined;

    function updateActiveStep() {
      const center = window.innerHeight / 2;
      const index = stepRefs.current.findIndex((element) => {
        if (!element) return false;
        const { top, bottom } = element.getBoundingClientRect();
        return top <= center && bottom > center;
      });
      if (index !== -1) setActive(index);
    }

    function observeSteps() {
      observer?.disconnect();
      if (!("IntersectionObserver" in window)) return;

      // A narrow band at the viewport center switches steps in either scroll direction.
      // Native sticky positioning handles the image; no per-frame scroll handler is needed.
      const inset = Math.max(0, Math.floor(window.innerHeight / 2) - 12);
      observer = new IntersectionObserver(updateActiveStep, {
        rootMargin: `-${inset}px 0px -${inset}px 0px`,
        threshold: 0,
      });
      stepRefs.current.forEach((element) => element && observer!.observe(element));
      updateActiveStep();
    }

    observeSteps();
    window.addEventListener("resize", observeSteps);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", observeSteps);
    };
  }, []);

  return (
    <section
      id="how-it-works-scroll"
      aria-labelledby="how-it-works-scroll-title"
      className="relative isolate scroll-mt-20 bg-primary-dark py-16 text-white sm:py-20 lg:py-24"
    >
      <div aria-hidden="true" className={styles.background}>
        <div className={styles.backdrop} data-background-step={current.id}>
          {JOURNEY_STEPS.map((step, index) => (
            <Image
              key={step.id}
              src={step.image}
              alt=""
              fill
              sizes="100vw"
              data-step-background={step.id}
              className={`object-cover transition-opacity duration-200 motion-reduce:transition-none ${index === active ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          <div className={styles.backdropOverlay} />
        </div>
      </div>
      <div className="container-page relative">
        <div className="mb-5 flex flex-col justify-between gap-6 lg:mb-10 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-teal-200">How it works · Step by step</p>
            <h2 id="how-it-works-scroll-title" className="section-title max-w-2xl">
              Every journey is better<br className="hidden sm:block" /> with a Padi.
            </h2>
          </div>
          <p className="hidden items-center gap-2 pb-1 text-sm font-semibold text-white/75 lg:flex">
            <ArrowDown size={17} aria-hidden="true" /> Scroll to follow the journey
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16 xl:gap-24">
          <ol className="min-w-0">
            {JOURNEY_STEPS.map((step, index) => (
              <li
                key={step.id}
                id={`journey-step-${step.id}`}
                ref={(element) => { stepRefs.current[index] = element; }}
                className={`${styles.step} border-b border-white/15 py-10 last:border-b-0`}
                aria-labelledby={`journey-heading-${step.id}`}
              >
                <div className="max-w-xl">
                  <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[.16em] text-teal-200">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 text-sm tracking-normal">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {step.label}
                  </p>
                  <h3 id={`journey-heading-${step.id}`} className="mt-6 text-3xl font-black leading-[1.15] tracking-[-.035em] sm:text-4xl lg:text-[2.65rem]">
                    {step.title}
                  </h3>
                  <p className="mt-5 text-base leading-8 text-white/80">{step.description}</p>
                  <ul className="mt-6 space-y-3">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-3 text-sm font-semibold">
                        <Check size={17} className="shrink-0 text-teal-200" aria-hidden="true" /> {detail}
                      </li>
                    ))}
                  </ul>
                  <Link href={step.href} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-lg text-sm font-bold text-teal-200 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                    {step.cta} <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </div>

                <div className="relative mt-7 aspect-[4/3] overflow-hidden rounded-3xl bg-primary-light lg:hidden">
                  <Image src={step.image} alt={step.imageAlt} fill sizes="(max-width: 639px) 100vw, 90vw" className="object-cover" />
                </div>
              </li>
            ))}
          </ol>

          <figure
            className={`${styles.visual} relative hidden overflow-hidden rounded-[2rem] bg-primary-light shadow-soft lg:block`}
            aria-labelledby={`journey-heading-${current.id}`}
            data-active-step={current.id}
          >
            {JOURNEY_STEPS.map((step, index) => (
              <Image
                key={step.id}
                src={step.image}
                alt={index === active ? step.imageAlt : ""}
                aria-hidden={index !== active}
                fill
                sizes="(min-width: 1280px) 550px, 46vw"
                className={`object-cover transition-opacity duration-200 motion-reduce:transition-none ${index === active ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#062d29]/90 via-transparent to-black/10" />
            <div aria-hidden="true" className="absolute left-6 top-6 flex gap-1.5 rounded-full border border-white/30 bg-black/15 p-2.5 backdrop-blur-sm">
              {JOURNEY_STEPS.map((step, index) => (
                <span key={step.id} className={`h-1.5 rounded-full transition-[width,background-color] duration-200 motion-reduce:transition-none ${index === active ? "w-9 bg-white" : "w-2 bg-white/40"}`} />
              ))}
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-white/75">Step {String(active + 1).padStart(2, "0")} / 04</p>
              <p className="mt-2 text-2xl font-bold">{current.label}</p>
              <p className="mt-2 text-sm text-white/75">Travel together. Go further.</p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
