"use client";

import Link from "next/link";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import LoopVideo from "@/components/LoopVideo";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { SERVICE_VIDEOS } from "@/lib/assets";

export default function HomePage() {
  const { locale, t } = useLocale();

  return (
    <main>
      <Hero />
      <Manifesto />

      {/* ───────────── Services teaser ───────────── */}
      <section className="relative w-full bg-black py-28 md:py-36">
        <div className="mx-auto w-full max-w-[90rem] px-6 md:px-10">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <Reveal as="span">
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/80">
                  {t.home.servicesTeaser.eyebrow}
                </span>
              </Reveal>
              <h2 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl md:text-6xl">
                <RevealText as="span">{t.home.servicesTeaser.heading}</RevealText>
              </h2>
            </div>
            <div className="md:col-span-5">
              <Reveal as="p" className="text-base text-white/70 md:text-lg">
                {t.home.servicesTeaser.sub}
              </Reveal>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-16 md:mt-24 md:gap-24">
            {t.services.items.map((s, i) => {
              const reverse = i % 2 === 1;
              const videoUrl = SERVICE_VIDEOS[s.slug];
              return (
                <Reveal
                  key={s.slug}
                  y={40}
                  className={`grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-14 ${
                    reverse ? "md:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  {/* Media */}
                  <div className="md:col-span-7">
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
                      <LoopVideo
                        src={videoUrl}
                        rate={0.6}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Copy */}
                  <div className="md:col-span-5">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#c9a040]">
                      {s.number}
                    </span>
                    <h3 className="mt-4 text-2xl font-semibold leading-tight text-white md:text-3xl lg:text-4xl">
                      {s.title}
                    </h3>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-white/70 md:text-lg">
                      {s.tagline}
                    </p>

                    <Link
                      href={`/${locale}/services#${s.slug}`}
                      className="group mt-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] py-2 pl-5 pr-2 text-sm font-semibold text-white/90 transition hover:border-[#c9a040]/60 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a040]"
                    >
                      <span>{t.home.servicesTeaser.cta}</span>
                      <span
                        aria-hidden="true"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c9a040] text-black transition group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────── Trust strip ───────────── */}
      <section className="relative w-full bg-black px-6 pb-28 md:px-10 md:pb-36">
        <div className="mx-auto w-full max-w-[90rem] border-t border-white/10 pt-20 md:pt-28">
          <Reveal as="span">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#c9a040]">
              {t.home.trust.eyebrow}
            </span>
          </Reveal>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
            <RevealText as="span">{t.home.trust.heading}</RevealText>
          </h2>

          <Reveal
            className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-0"
            stagger={0.1}
          >
            {t.home.trust.items.map((item, i) => (
              <div
                key={item.title}
                className={`px-0 md:px-8 ${
                  i > 0 ? "md:border-l md:border-white/10" : ""
                } ${i === 0 ? "md:pl-0" : ""}`}
              >
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#c9a040]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-white md:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65 md:text-base">
                  {item.body}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ───────────── Contact ───────────── */}
      <section id="contact" className="relative w-full bg-black py-28 md:py-36">
        <div className="mx-auto w-full max-w-3xl px-6 md:px-8">
          <Reveal as="span">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
              {t.home.contact.eyebrow}
            </span>
          </Reveal>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl md:text-6xl">
            <RevealText as="span">{t.home.contact.heading}</RevealText>
          </h2>
          <Reveal
            as="p"
            className="mt-5 max-w-xl text-lg font-medium text-white/75 md:text-xl"
          >
            {t.home.contact.sub}
          </Reveal>

          <div className="mt-12">
            <ContactForm />
          </div>

          <Reveal as="p" className="mt-10 text-sm text-white/60">
            {t.contact.direct.label}:{" "}
            <Link
              href={`/${locale}/contact`}
              className="text-[#c9a040] underline-offset-4 hover:underline"
            >
              {t.contact.direct.email}
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
