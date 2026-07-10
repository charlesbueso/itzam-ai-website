"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import LoopVideo from "@/components/LoopVideo";
import ServiceGlyph, { GlyphVariant } from "@/components/ServiceGlyph";
import { ASSETS } from "@/lib/assets";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const GLYPHS: Record<string, GlyphVariant> = {
  "service-1": "assessment",
  "service-2": "playbook",
  "service-3": "support",
  "service-4": "brain",
};

export default function ServicesPageClient() {
  const { locale, t } = useLocale();
  const services = t.services.items;

  return (
    <main>
      {/* ───────────── Hero ───────────── */}
      <section className="relative w-full overflow-hidden bg-black">
        {/* Desktop: video pinned to the right half, full-height of the hero */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden md:block md:w-1/2"
          aria-hidden="true"
        >
          <LoopVideo
            src={ASSETS.serviceSalesPlaybook}
            rate={0.6}
            className="h-full w-full object-cover"
          />
          {/* Soft horizontal fade so text side blends in */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/10 to-black" />
        </div>

        {/* Mobile: full-bleed background video behind text */}
        <div className="pointer-events-none absolute inset-0 md:hidden" aria-hidden="true">
          <LoopVideo
            src={ASSETS.serviceSalesPlaybook}
            rate={0.6}
            className="h-full w-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black" />
        </div>

        <div className="relative mx-auto w-full max-w-[90rem] px-6 pb-20 pt-44 md:flex md:min-h-[100svh] md:items-center md:px-10 md:pb-28 md:pt-52">
          <div className="md:w-1/2 md:pr-10">
            <Reveal as="span">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                {t.services.eyebrow}
              </span>
            </Reveal>

            <h1 className="mt-6 text-[clamp(3rem,6.5vw,7rem)] font-semibold leading-[0.95] tracking-tight text-white">
              <RevealText as="span">{t.services.heading1}</RevealText>
              <RevealText as="span" delay={0.15}>
                {t.services.heading2}
              </RevealText>
            </h1>

            <Reveal
              as="p"
              className="mt-8 max-w-xl text-lg font-medium text-white/85 md:text-xl"
            >
              {t.services.intro}
            </Reveal>

            {/* TOC */}
            <Reveal className="mt-12 flex flex-wrap items-center gap-3" stagger={0.06}>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
                {t.services.tocLabel}
              </span>
              {services.map((s) => (
                <a
                  key={s.slug}
                  href={`#${s.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-sm transition hover:border-[#c9a040] hover:text-[#c9a040]"
                >
                  <span className="font-mono text-xs text-[#c9a040]">{s.number}</span>
                  <span>{s.title}</span>
                </a>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────────── Service sections ───────────── */}
      {services.map((s, i) => {
        const light = i % 2 === 1;
        return (
          <section
            key={s.slug}
            id={s.slug}
            data-theme={light ? "light" : undefined}
            className={`scroll-mt-24 px-6 py-24 md:px-10 md:py-32 ${
              light ? "bg-[#f4f1e8] text-neutral-900" : "bg-black text-white"
            }`}
          >
            <div className="mx-auto w-full max-w-[90rem]">
              <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-center md:gap-8">
                <div className="md:col-span-8">
                  <Reveal as="span">
                    <span
                      className={`font-mono text-xs uppercase tracking-[0.22em] ${
                        light ? "text-neutral-500" : "text-[#c9a040]"
                      }`}
                    >
                      {s.number}
                    </span>
                  </Reveal>

                  <h2
                    className={`mt-3 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-tight md:text-6xl ${
                      light ? "text-neutral-900" : "text-white"
                    }`}
                  >
                    <RevealText as="span" lineColor="#c9a040">
                      {s.title}
                    </RevealText>
                  </h2>

                  <Reveal
                    as="p"
                    className={`mt-5 max-w-2xl text-lg font-medium md:text-xl ${
                      light ? "text-neutral-700" : "text-white/75"
                    }`}
                  >
                    {s.tagline}
                  </Reveal>
                </div>

                {/* Animated line-art glyph for this service */}
                <div className="md:col-span-4 md:flex md:justify-end">
                  <ServiceGlyph
                    variant={GLYPHS[s.slug] ?? "assessment"}
                    light={light}
                    className="w-[190px] md:w-[250px] lg:w-[280px]"
                  />
                </div>
              </div>

              <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
                <div className="md:col-span-5">
                  <Reveal>
                    <p
                      className={`text-xs font-medium uppercase tracking-[0.18em] ${
                        light ? "text-neutral-500" : "text-white/45"
                      }`}
                    >
                      {t.services.sectionLabels.whatIs}
                    </p>
                    <p
                      className={`mt-4 text-base leading-relaxed md:text-lg ${
                        light ? "text-neutral-800" : "text-white/85"
                      }`}
                    >
                      {s.whatIs}
                    </p>
                  </Reveal>

                  {s.target && (
                    <Reveal className="mt-8">
                      <p
                        className={`text-xs font-medium uppercase tracking-[0.18em] ${
                          light ? "text-neutral-500" : "text-white/45"
                        }`}
                      >
                        {t.services.sectionLabels.target}
                      </p>
                      <p
                        className={`mt-3 text-sm md:text-base ${
                          light ? "text-neutral-700" : "text-white/70"
                        }`}
                      >
                        {s.target}
                      </p>
                    </Reveal>
                  )}

                  {s.callout && (
                    <Reveal
                      className={`mt-10 rounded-2xl border p-5 md:p-6 ${
                        light
                          ? "border-neutral-900/15 bg-neutral-900/[0.04]"
                          : "border-[#c9a040]/30 bg-[#c9a040]/[0.07]"
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                          light ? "text-neutral-700" : "text-[#c9a040]"
                        }`}
                      >
                        {s.callout.label}
                      </p>
                      <p
                        className={`mt-2 text-lg font-semibold ${
                          light ? "text-neutral-900" : "text-white"
                        }`}
                      >
                        {s.callout.title}
                      </p>
                      <p
                        className={`mt-2 text-sm ${
                          light ? "text-neutral-700" : "text-white/75"
                        }`}
                      >
                        {s.callout.body}
                      </p>
                    </Reveal>
                  )}
                </div>

                <div className="md:col-span-4">
                  <p
                    className={`text-xs font-medium uppercase tracking-[0.18em] ${
                      light ? "text-neutral-500" : "text-white/45"
                    }`}
                  >
                    {t.services.sectionLabels.deliverables}
                  </p>
                  <Reveal
                    as="ul"
                    className={`mt-4 space-y-3 text-sm md:text-base ${
                      light ? "text-neutral-800" : "text-white/80"
                    }`}
                    stagger={0.06}
                    y={20}
                  >
                    {s.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2 inline-block h-px w-4 flex-shrink-0 bg-[#c9a040]"
                        />
                        <span>{d}</span>
                      </li>
                    ))}
                  </Reveal>
                </div>

                <div className="md:col-span-3">
                  <p
                    className={`text-xs font-medium uppercase tracking-[0.18em] ${
                      light ? "text-neutral-500" : "text-white/45"
                    }`}
                  >
                    {t.services.sectionLabels.tech}
                  </p>
                  <Reveal
                    as="ul"
                    className={`mt-4 space-y-3 text-sm ${
                      light ? "text-neutral-700" : "text-white/65"
                    }`}
                    stagger={0.06}
                    y={20}
                  >
                    {s.tech.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </Reveal>
                </div>
              </div>

              <Reveal className="mt-14">
                <Link href={`/${locale}/contact`} className="btn-gold">
                  <span>{t.common.requestQuote}</span>
                  <span aria-hidden="true" className="btn-arrow">
                    →
                  </span>
                </Link>
              </Reveal>
            </div>
          </section>
        );
      })}

      {/* ───────────── Closing ───────────── */}
      <section className="relative w-full bg-black px-6 py-28 md:px-10 md:py-36">
        <div className="mx-auto w-full max-w-3xl text-center">
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
            <RevealText as="span">{t.services.closing.heading}</RevealText>
          </h2>
          <Reveal
            as="p"
            className="mx-auto mt-5 max-w-xl text-lg font-medium text-white/75"
          >
            {t.services.closing.body}
          </Reveal>
          <Reveal className="mt-10">
            <Link href={`/${locale}/contact`} className="btn-gold px-8">
              <span>{t.services.closing.cta}</span>
              <span aria-hidden="true" className="btn-arrow">
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
