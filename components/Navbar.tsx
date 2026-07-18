"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ASSETS } from "@/lib/assets";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Locale } from "@/lib/i18n/dictionaries";

/**
 * Navbar — logo left, hamburger right at every breakpoint.
 *
 * - Hides on scroll-down (cumulative 50px), reveals on scroll-up or idle.
 * - Logo theme is driven by `data-theme="light"` zones in the page (any
 *   section can declare itself light-themed and the navbar reacts).
 * - Hamburger opens a full-screen GSAP-animated overlay with route links
 *   and an EN|ES pill toggle.
 */
export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [overLight, setOverLight] = useState(false);
  const lastY = useRef(0);
  const downAccum = useRef(0);
  const ticking = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { locale, t } = useLocale();
  const pathname = usePathname();

  // Scroll hide/reveal + light-zone detection. Any section can declare
  // itself `data-theme="light"`; when one sits under the header band the
  // navbar swaps to its dark-on-light treatment and drops the scrim.
  useEffect(() => {
    const HIDE_THRESHOLD = 50;
    const TOP_LOCK = 60;
    const IDLE_REVEAL_MS = 600;
    const HEADER_CENTER = 42; // vertical midpoint of the logo/hamburger row

    lastY.current = window.scrollY;

    const checkTheme = () => {
      const zones = document.querySelectorAll<HTMLElement>(
        '[data-theme="light"]'
      );
      let light = false;
      zones.forEach((z) => {
        const r = z.getBoundingClientRect();
        if (r.top < HEADER_CENTER && r.bottom > HEADER_CENTER) light = true;
      });
      setOverLight(light);
    };

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
          downAccum.current = 0;
          setHidden(false);
        } else if (delta > 0) {
          downAccum.current += delta;
          if (downAccum.current >= HIDE_THRESHOLD) setHidden(true);
        }

        checkTheme();
        lastY.current = y;
        ticking.current = false;
        scheduleIdleReveal();
      });
    };

    checkTheme();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", checkTheme);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", checkTheme);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [pathname]);

  const lightMode = overLight && !open;

  return (
    <>
      {/* Top gradient scrim — subtle contrast for the logo/hamburger over
          dark media. Removed entirely over light sections (the cream bg
          provides its own contrast) and while the overlay is open. */}
      <div
        aria-hidden="true"
        style={{
          opacity: open || lightMode ? 0 : 1,
          transform: hidden && !open ? "translateY(-100%)" : "translateY(0)",
          transition: "opacity 300ms ease-out, transform 250ms ease-out",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.12) 80%, rgba(0,0,0,0) 100%)",
        }}
        className="pointer-events-none fixed inset-x-0 top-0 z-40 h-20 md:h-24"
      />

      <header
        style={{
          transform: hidden && !open ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 250ms ease-out",
        }}
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 px-6 py-4 md:px-10 md:py-5"
      >
        <Link
          href={`/${locale}`}
          aria-label={t.nav.home}
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          {/* Both logotypes stacked; crossfade with the section theme.
              The files are a tight-cropped ~6.3:1 wordmark, so a slim
              height renders at a sane width. */}
          <span className="relative block h-7 md:h-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ASSETS.logotypeDark}
              alt="Itzam.ai"
              className="h-full w-auto transition-opacity duration-300"
              style={{ opacity: lightMode ? 0 : 1 }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ASSETS.logotypeLight}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-auto transition-opacity duration-300"
              style={{ opacity: lightMode ? 1 : 0 }}
            />
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
          aria-expanded={open}
          aria-controls="nav-overlay"
          className={`relative z-[60] inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a040] ${
            open
              ? "border-white/30 bg-white/10 text-white"
              : lightMode
                ? "border-neutral-900/25 bg-neutral-900/[0.04] text-neutral-900 hover:border-neutral-900/50"
                : "border-white/20 bg-white/5 text-white hover:border-white/40"
          }`}
        >
          <Hamburger open={open} />
        </button>
      </header>

      <NavOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function Hamburger({ open }: { open: boolean }) {
  // Three equal-weight horizontal lines. On open, top and bottom
  // collapse to center and rotate into an X; the middle line fades.
  return (
    <span className="relative block h-[14px] w-[22px]">
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 block h-[2px] w-full rounded-full bg-current transition-transform duration-300"
        style={{ transform: open ? "translateY(6px) rotate(45deg)" : "none" }}
      />
      <span
        aria-hidden="true"
        className="absolute left-0 top-1/2 block h-[2px] w-full -translate-y-1/2 rounded-full bg-current transition-opacity duration-200"
        style={{ opacity: open ? 0 : 1 }}
      />
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 block h-[2px] w-full rounded-full bg-current transition-transform duration-300"
        style={{ transform: open ? "translateY(-6px) rotate(-45deg)" : "none" }}
      />
    </span>
  );
}

function NavOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { locale, t } = useLocale();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const links = linksRef.current;
    if (!overlay) return;

    const mm = gsap.matchMedia();
    mm.add(
      {
        animate: "(prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const reduce = ctx.conditions?.reduce;

        if (open) {
          if (reduce) {
            gsap.set(overlay, { autoAlpha: 1, y: 0 });
            if (links) gsap.set(links.children, { autoAlpha: 1, y: 0 });
            return;
          }
          gsap.fromTo(
            overlay,
            { autoAlpha: 0, y: -16 },
            { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out" }
          );
          if (links) {
            gsap.fromTo(
              links.children,
              { autoAlpha: 0, y: 24 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.5,
                ease: "power3.out",
                stagger: 0.08,
                delay: 0.15,
              }
            );
          }
        } else {
          gsap.to(overlay, {
            autoAlpha: 0,
            y: -16,
            duration: reduce ? 0 : 0.2,
            ease: "power3.in",
          });
        }
      }
    );

    return () => mm.revert();
  }, [open]);

  const links: { href: string; label: string }[] = [
    { href: `/${locale}`, label: t.nav.links.home },
    { href: `/${locale}/services`, label: t.nav.links.services },
    { href: `/${locale}/about`, label: t.nav.links.about },
    { href: `/${locale}/contact`, label: t.nav.links.contact },
  ];

  return (
    <div
      ref={overlayRef}
      id="nav-overlay"
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      style={{ visibility: open ? "visible" : "hidden", opacity: 0 }}
      className="fixed inset-0 z-40 flex flex-col items-end justify-end bg-black px-6 pb-16 pt-28 md:justify-center md:px-10 md:pb-16 md:pt-32"
    >
      <nav
        ref={linksRef}
        className="flex flex-col items-end gap-4 text-right md:gap-3"
      >
        {links.map((l, i) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onClose}
            className="group inline-flex flex-row-reverse items-baseline gap-3 text-right text-5xl font-semibold leading-[1.05] tracking-tight text-white transition hover:text-[#c9a040] md:text-7xl"
          >
            <span className="font-mono text-sm uppercase tracking-[0.2em] text-white/40 group-hover:text-[#c9a040]/80">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{l.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-12 flex flex-col items-end gap-3 pb-2">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
          {t.footer.languageLabel}
        </span>
        <LanguagePill onSwitch={onClose} />
      </div>
    </div>
  );
}

export function LanguagePill({
  onSwitch,
  variant = "dark",
}: {
  onSwitch?: () => void;
  variant?: "dark" | "light";
}) {
  const { locale, t } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (target: Locale) => {
    if (target === locale) return;
    onSwitch?.();
    if (!pathname) {
      router.push(`/${target}`);
      return;
    }
    const next = pathname.replace(/^\/(en|es)(?=\/|$)/, `/${target}`);
    router.push(next === pathname ? `/${target}` : next);
  };

  const isDark = variant === "dark";
  const containerCls = isDark
    ? "border-white/15 bg-white/5"
    : "border-neutral-900/20 bg-neutral-900/5";
  const inactiveCls = isDark
    ? "text-white/60 hover:text-white"
    : "text-neutral-900/60 hover:text-neutral-900";

  const Pill = (target: Locale, label: string) => {
    const active = locale === target;
    return (
      <button
        key={target}
        type="button"
        onClick={() => switchTo(target)}
        aria-pressed={active}
        aria-label={`${t.nav.switchLanguage}: ${label}`}
        className={`min-w-[44px] rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a040] ${
          active ? "bg-[#c9a040] text-black" : inactiveCls
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border p-1 ${containerCls}`}
    >
      {Pill("en", "EN")}
      {Pill("es", "ES")}
    </div>
  );
}
