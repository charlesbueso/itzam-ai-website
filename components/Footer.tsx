"use client";

import Link from "next/link";
import { ASSETS } from "@/lib/assets";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LanguagePill } from "./Navbar";
import Reveal from "./Reveal";
import GrecaDivider from "./Greca";

export default function Footer() {
  const { locale, t } = useLocale();
  const year = new Date().getFullYear();

  const sectionLinks: { href: string; label: string }[] = [
    { href: `/${locale}`, label: t.nav.links.home },
    { href: `/${locale}/services`, label: t.nav.links.services },
    { href: `/${locale}/about`, label: t.nav.links.about },
    { href: `/${locale}/contact`, label: t.nav.links.contact },
  ];

  const legalLinks: { href: string; label: string }[] = [
    { href: `/${locale}/privacy`, label: t.footer.privacyLink },
    { href: `/${locale}/terms`, label: t.footer.termsLink },
  ];

  return (
    <footer className="relative w-full bg-black px-6 pb-10 pt-16 md:px-10 md:pb-12 md:pt-20">
      <GrecaDivider className="mx-auto mb-14 w-full max-w-[90rem] md:mb-16" opacity={0.5} />
      <Reveal className="mx-auto w-full max-w-[90rem]">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ASSETS.logotypeDark}
              alt="Itzam.ai"
              className="-ml-2 h-16 w-auto md:h-20"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              {t.footer.tagline}
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
              {t.footer.sectionsLabel}
            </p>
            <ul className="mt-4 space-y-3">
              {sectionLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/80 transition hover:text-[#c9a040]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
              {t.footer.contactLabel}
            </p>
            <a
              href="mailto:contact@itzam.ai"
              className="mt-4 inline-block text-sm text-white/80 transition hover:text-[#c9a040]"
            >
              contact@itzam.ai
            </a>

            <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-white/45">
              {t.footer.legalLabel}
            </p>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/80 transition hover:text-[#c9a040]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
              {t.footer.languageLabel}
            </p>
            <div className="mt-4">
              <LanguagePill />
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row md:items-center">
          <p>© {year} Itzam.ai. {t.footer.rights}</p>
          <p className="font-mono uppercase tracking-[0.18em]">
            Hecho en México <span className="text-[#c9a040]">✦</span> Made for
            LATAM
          </p>
        </div>
      </Reveal>
    </footer>
  );
}
