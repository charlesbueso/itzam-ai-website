"use client";

import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function ContactPageClient() {
  const { t } = useLocale();

  return (
    <main>
      <section className="relative w-full bg-black px-6 pb-28 pt-44 md:px-10 md:pb-36 md:pt-52">
        <div className="mx-auto w-full max-w-[90rem]">
          <div className="grid grid-cols-1 gap-14 md:grid-cols-12 md:gap-12">
            {/* Left column */}
            <div className="md:col-span-5 md:sticky md:top-28 md:self-start">
              <Reveal as="span">
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-white/80">
                  {t.contact.eyebrow}
                </span>
              </Reveal>

              <h1 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl">
                <RevealText as="span">{t.contact.heading}</RevealText>
              </h1>

              <Reveal
                as="p"
                className="mt-8 max-w-md text-lg font-medium text-white/75 md:text-xl"
              >
                {t.contact.sub}
              </Reveal>

              <Reveal
                className="mt-12 space-y-6 border-t border-white/10 pt-10"
                stagger={0.08}
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                    {t.contact.direct.label}
                  </p>
                  <a
                    href={`mailto:${t.contact.direct.email}`}
                    className="mt-2 block text-lg text-[#c9a040] underline-offset-4 hover:underline md:text-xl"
                  >
                    {t.contact.direct.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                    {t.contact.direct.responseLabel}
                  </p>
                  <p className="mt-2 text-base text-white/80">
                    {t.contact.direct.response}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                    {t.contact.direct.locationLabel}
                  </p>
                  <p className="mt-2 text-base text-white/80">
                    {t.contact.direct.location}
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Right column — form */}
            <div className="md:col-span-7">
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:p-10">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
