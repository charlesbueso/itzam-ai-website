"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function ServicesPageClient() {
  const { locale, t } = useLocale();
  const services = t.services.items;

  return (
    <main>
      {/* ───────────── Hero ───────────── */}
      <section className="relative w-full bg-black px-6 pb-20 pt-44 md:px-10 md:pb-28 md:pt-52">
        <div className="mx-auto w-full max-w-[90rem]">
          <Reveal as="span">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/80">
              {t.services.eyebrow}
            </span>
          </Reveal>

          <h1 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
            <RevealText as="span">{t.services.heading1}</RevealText>
            <br />
            <RevealText as="span" delay={0.15}>
              {t.services.heading2}
            </RevealText>
          </h1>

          <Reveal
            as="p"
            className="mt-8 max-w-2xl text-lg font-medium text-white/75 md:text-xl"
          >
            {t.services.intro}
          </Reveal>

          {/* TOC */}
          <Reveal className="mt-14 flex flex-wrap items-center gap-3" stagger={0.06}>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/40">
              {t.services.tocLabel}
            </span>
            {services.map((s) => (
              <a
                key={s.slug}
                href={`#${s.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-[#c9a040] hover:text-[#c9a040]"
              >
                <span className="font-mono text-xs text-[#c9a040]">{s.number}</span>
                <span>{s.title}</span>
              </a>
            ))}
          </Reveal>
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
                <Link
                  href={`/${locale}/contact`}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#c9a040] px-7 py-3 text-sm font-semibold text-black transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a040] focus-visible:ring-offset-2"
                  style={{
                    // light section: offset-2 white; dark: offset-2 black
                    // CSS doesn't allow conditionally — use ring color directly
                  }}
                >
                  {t.common.requestQuote} →
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
            <Link
              href={`/${locale}/contact`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#c9a040] px-8 py-3 text-sm font-semibold text-black transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a040] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {t.services.closing.cta} →
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
