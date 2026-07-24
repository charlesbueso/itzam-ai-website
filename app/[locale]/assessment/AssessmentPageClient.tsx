"use client";

import AssessmentFlow from "@/components/AssessmentFlow";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function AssessmentPageClient() {
  const { t } = useLocale();

  return (
    <main>
      <section className="relative w-full bg-black px-6 pb-24 pt-40 md:px-10 md:pb-32 md:pt-48">
        <div className="mx-auto w-full max-w-3xl">
          <div className="text-center">
            <Reveal as="span">
              <span className="inline-flex items-center rounded-full border border-[#c9a040]/50 bg-[#c9a040]/[0.08] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#c9a040]">
                {t.assessment.hero.eyebrow}
              </span>
            </Reveal>

            <h1 className="mt-6 text-[clamp(2.2rem,5.5vw,4.2rem)] font-semibold leading-[1.02] tracking-tight text-white">
              <RevealText as="span">{t.assessment.hero.heading1}</RevealText>{" "}
              <RevealText as="span" className="text-[#c9a040]">
                {t.assessment.hero.heading2}
              </RevealText>
            </h1>

            <Reveal
              as="p"
              className="mx-auto mt-6 max-w-xl text-base font-medium text-white/75 md:text-lg"
            >
              {t.assessment.hero.sub}
            </Reveal>

            <Reveal as="p" className="mt-5 text-xs uppercase tracking-[0.16em] text-white/45">
              {t.assessment.hero.meta}
            </Reveal>
          </div>

          <div className="mt-14 md:mt-16">
            <AssessmentFlow />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
