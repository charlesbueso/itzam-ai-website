"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RevealText from "./RevealText";
import Reveal from "./Reveal";
import { ASSETS } from "@/lib/assets";
import { useT } from "@/lib/i18n/LocaleProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Manifesto — replaces the old Conviction section on Home.
 *
 * Cream background, gold logomark scales in on scroll, headline uses
 * the existing RevealText sweep-line reveal for premium feel.
 */
export default function Manifesto() {
  const t = useT();
  const logoRef = useRef<HTMLImageElement | null>(null);

  useLayoutEffect(() => {
    const el = logoRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add(
      {
        animate: "(prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const reduce = ctx.conditions?.reduce;
        if (reduce) {
          gsap.set(el, { autoAlpha: 1, scale: 1 });
          return;
        }
        gsap.fromTo(
          el,
          { autoAlpha: 0, scale: 0.85 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          }
        );
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      id="conviction"
      data-theme="light"
      className="relative w-full bg-[#f4f1e8] py-32 md:py-40"
    >
      <div className="mx-auto w-full max-w-[90rem] px-6 sm:px-6 md:px-8">
        <Reveal as="span">
          <span className="inline-flex items-center rounded-full border border-neutral-900/15 bg-neutral-900/[0.03] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-neutral-700">
            {t.home.manifesto.eyebrow}
          </span>
        </Reveal>

        <h2 className="mt-8 text-4xl font-semibold uppercase leading-[0.95] tracking-tight text-neutral-900 sm:text-5xl md:text-6xl lg:text-7xl">
          <RevealText as="span" lineColor="#c9a040">
            {t.home.manifesto.heading1}
          </RevealText>
          <br />
          <RevealText as="span" lineColor="#c9a040" delay={0.15}>
            {t.home.manifesto.heading2}
          </RevealText>
        </h2>

        <div className="mt-24 flex md:mt-36 md:justify-end">
          <Reveal className="flex max-w-2xl items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={logoRef}
              src={ASSETS.logoGold}
              alt=""
              aria-hidden="true"
              className="mt-2 h-6 w-6 flex-shrink-0 md:mt-3 md:h-8 md:w-8"
            />
            <div>
              <p className="text-2xl font-bold leading-snug text-neutral-900 md:text-3xl">
                {t.home.manifesto.body}
              </p>
              <p className="mt-6 text-sm font-medium uppercase tracking-[0.18em] text-neutral-500">
                {t.home.manifesto.attribution}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
