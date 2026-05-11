"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import LoopVideo from "@/components/LoopVideo";
import { ASSETS } from "@/lib/assets";
import { useLocale } from "@/lib/i18n/LocaleProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AboutPageClient() {
  const { locale, t } = useLocale();
  const teamRef = useRef<HTMLDivElement | null>(null);

  // Founder cards converge from sides on scroll.
  useLayoutEffect(() => {
    const grid = teamRef.current;
    if (!grid) return;
    const cards = Array.from(grid.children) as HTMLElement[];
    if (cards.length === 0) return;

    const mm = gsap.matchMedia();
    mm.add(
      {
        animate: "(prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const reduce = ctx.conditions?.reduce;
        if (reduce) {
          gsap.set(cards, { autoAlpha: 1, x: 0, y: 0 });
          return;
        }
        cards.forEach((card, i) => {
          const dir = i % 2 === 0 ? -1 : 1;
          gsap.fromTo(
            card,
            { autoAlpha: 0, x: 30 * dir, y: 20 },
            {
              autoAlpha: 1,
              x: 0,
              y: 0,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: { trigger: card, start: "top 85%", once: true },
            }
          );
        });
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <main>
      {/* ───────────── Hero ───────────── */}
      <section className="relative w-full overflow-hidden bg-black px-6 pb-20 pt-44 md:px-10 md:pb-28 md:pt-52">
        {/* Full-bleed background video */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <LoopVideo
            src={ASSETS.serviceOpportunity}
            rate={0.6}
            className="h-full w-full object-cover opacity-50 md:opacity-60"
          />
          {/* Darkening overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-black/10" />
        </div>

        <div className="relative mx-auto w-full max-w-[90rem]">
          <Reveal as="span">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
              {t.about.hero.eyebrow}
            </span>
          </Reveal>

          <div className="mt-8 max-w-3xl">
            <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
              <RevealText as="span">{t.about.hero.heading1}</RevealText>
              <br />
              <RevealText as="span" delay={0.15}>
                {t.about.hero.heading2}
              </RevealText>
            </h1>
            <Reveal
              as="p"
              className="mt-8 max-w-2xl text-lg font-medium text-white/85 md:text-xl"
            >
              {t.about.hero.sub}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────────── Conviction / values ───────────── */}
      <section
        data-theme="light"
        className="relative w-full bg-[#f4f1e8] px-6 py-28 md:px-10 md:py-36"
      >
        <div className="mx-auto w-full max-w-[90rem]">
          <Reveal as="span">
            <span className="inline-flex items-center rounded-full border border-neutral-900/15 bg-neutral-900/[0.03] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-neutral-700">
              {t.about.conviction.eyebrow}
            </span>
          </Reveal>

          <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-tight text-neutral-900 sm:text-5xl md:text-6xl">
            <RevealText as="span" lineColor="#c9a040">
              {t.about.conviction.heading}
            </RevealText>
          </h2>

          <Reveal
            className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4"
            stagger={0.1}
            y={30}
          >
            {t.about.conviction.values.map((v, i) => (
              <div key={v.title}>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#c9a040]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-neutral-900">
                  {v.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-700 md:text-base">
                  {v.body}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ───────────── Team ───────────── */}
      <section className="relative w-full bg-black px-6 py-28 md:px-10 md:py-36">
        <div className="mx-auto w-full max-w-[90rem]">
          <Reveal as="span">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#c9a040]">
              {t.about.team.eyebrow}
            </span>
          </Reveal>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-tight text-white md:text-6xl">
            <RevealText as="span">{t.about.team.heading}</RevealText>
          </h2>
          <Reveal
            as="p"
            className="mt-6 max-w-2xl text-lg font-medium text-white/70 md:text-xl"
          >
            {t.about.team.sub}
          </Reveal>

          <div
            ref={teamRef}
            className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
          >
            {t.about.team.members.map((m) => (
              <article
                key={m.name}
                style={{ visibility: "hidden" }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition hover:border-[#c9a040]/40 md:p-9"
              >
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#c9a040]">
                  {m.role}
                </p>
                <h3 className="mt-3 text-2xl font-semibold leading-tight text-white md:text-3xl">
                  {m.name}
                </h3>
                <p className="mt-5 text-sm leading-relaxed text-white/75 md:text-base">
                  {m.bio}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Closing ───────────── */}
      <section className="relative w-full bg-black px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto w-full max-w-3xl text-center">
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
            <RevealText as="span">{t.about.closing.heading}</RevealText>
          </h2>
          <Reveal className="mt-10">
            <Link
              href={`/${locale}/contact`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#c9a040] px-8 py-3 text-sm font-semibold text-black transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a040] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {t.about.closing.cta} →
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
