"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ASSETS } from "@/lib/assets";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Locale } from "@/lib/i18n/dictionaries";

/**
 * Navbar.
 *
 * - Fixed at the top of the viewport.
 * - On scroll DOWN past a threshold: smoothly slides up out of view.
 * - On any scroll UP: snaps back into view and stays fixed until the user
 *   scrolls down meaningfully again (50px cumulative).
 * - Pure CSS transform + transition. No JS-driven animation, no lerp,
 *   no bounce.
 */
export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [overConviction, setOverConviction] = useState(false);
  const lastY = useRef(0);
  const downAccum = useRef(0);
  const ticking = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { locale, t } = useLocale();

  useEffect(() => {
    const HIDE_THRESHOLD = 50; // cumulative downward px required to hide
    const TOP_LOCK = 60; // always show within this distance of the top
    const IDLE_REVEAL_MS = 600; // after this idle time, reveal again

    lastY.current = window.scrollY;

    const scheduleIdleReveal = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        downAccum.current = 0;
        setHidden(false);
      }, IDLE_REVEAL_MS);
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;

        if (y < TOP_LOCK) {
          downAccum.current = 0;
          setHidden(false);
        } else if (delta < 0) {
          // scrolling up — show immediately and reset hide accumulator
          downAccum.current = 0;
          setHidden(false);
        } else if (delta > 0) {
          downAccum.current += delta;
          if (downAccum.current >= HIDE_THRESHOLD) {
            setHidden(true);
          }
        }

        lastY.current = y;
        ticking.current = false;
        // Whenever the user pauses scrolling, bring the navbar back.
        scheduleIdleReveal();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  // Logo color swap when over the Conviction section.
  useEffect(() => {
    const el = document.getElementById("conviction");
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOverConviction(entry.isIntersecting),
      { rootMargin: "0px 0px -95% 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      style={{
        transform: hidden ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 250ms ease-out",
      }}
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-4 px-6 py-4 md:justify-between md:px-10 md:py-5"
    >
      <a href={`/${locale}#top`} aria-label={t.nav.home} className="flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            overConviction
              ? ASSETS.logotypeLight
              : ASSETS.logotypeDark
          }
          alt="Itzam.ai"
          className="-mt-2 h-24 w-auto md:mt-0 md:h-20"
        />
      </a>

      <div className="absolute right-6 top-1/2 flex -translate-y-1/2 items-center gap-3 md:static md:translate-y-0 md:gap-4">
        <a
          href={`/${locale}#waitlist`}
          className="hidden items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-[#c9a040] hover:text-[#c9a040] md:inline-flex"
        >
          {t.nav.cta}
        </a>
        <LanguageSwitcher />
      </div>
    </header>
  );
}

function LanguageSwitcher() {
  const { locale, t } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  // The flag we display is the OPPOSITE of the active locale (the one the
  // user can switch TO).
  const otherLocale: Locale = locale === "en" ? "es" : "en";
  const flagSrc = otherLocale === "es" ? ASSETS.flagMX : ASSETS.flagUS;
  const flagAlt = otherLocale === "es" ? "Español" : "English";

  const handleSwitch = () => {
    if (!pathname) {
      router.push(`/${otherLocale}`);
      return;
    }
    // Replace the leading /<locale> segment with the other locale.
    const next = pathname.replace(/^\/(en|es)(?=\/|$)/, `/${otherLocale}`);
    router.push(next === pathname ? `/${otherLocale}` : next);
  };

  return (
    <button
      type="button"
      onClick={handleSwitch}
      aria-label={t.nav.switchLanguage}
      title={flagAlt}
      className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/5 transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/30"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flagSrc}
        alt={flagAlt}
        className="h-full w-full object-cover"
      />
    </button>
  );
}
