"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RevealText from "./RevealText";
import { ASSETS } from "@/lib/assets";
import { useT } from "@/lib/i18n/LocaleProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hero
 *
 * Desktop (md+):
 *   - Background video sized to viewport height; horizontal pan via GSAP
 *     pinned ScrollTrigger. Two text frames cross-fade.
 *
 * Mobile (< md):
 *   - Video stays fixed on the left edge of the viewport at full height
 *     (overflowing right side is clipped). Text scrolls naturally over
 *     the video — tags + heading anchored to top, subheading to bottom.
 */
export default function Hero() {
  const t = useT();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const frame1Ref = useRef<HTMLDivElement | null>(null);
  const frame2Ref = useRef<HTMLDivElement | null>(null);

  const [videoSize, setVideoSize] = useState<{ w: number; h: number } | null>(
    null
  );
  const [frame2Revealed, setFrame2Revealed] = useState(false);

  // Try to autoplay both videos (muted videos are generally allowed).
  useEffect(() => {
    const tryPlay = () => {
      [videoRef.current, mobileVideoRef.current].forEach((v) => {
        v?.play().catch(() => {});
      });
    };
    tryPlay();
    document.addEventListener("visibilitychange", tryPlay);
    return () => document.removeEventListener("visibilitychange", tryPlay);
  }, []);

  // Capture intrinsic video dimensions for the desktop pan calculation.
  // If metadata stalls (slow network), fall back to a wide aspect so the
  // scroll timeline still initializes and frame 2 can reveal.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const handle = () => {
      if (v.videoWidth && v.videoHeight) {
        setVideoSize({ w: v.videoWidth, h: v.videoHeight });
      }
    };
    if (v.readyState >= 1) handle();
    v.addEventListener("loadedmetadata", handle);
    const fallback = window.setTimeout(() => {
      setVideoSize((s) => s ?? { w: 21, h: 9 });
    }, 2500);
    return () => {
      v.removeEventListener("loadedmetadata", handle);
      window.clearTimeout(fallback);
    };
  }, []);

  useLayoutEffect(() => {
    if (!videoSize) return;
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const video = videoRef.current;
    const frame1 = frame1Ref.current;
    const frame2 = frame2Ref.current;
    if (!section || !sticky || !video || !frame1 || !frame2) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const ctx = gsap.context(() => {
        const INITIAL_OFFSET_VW = 5; // matches style={{ left: "-5vw" }}
        const computePan = () => {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const renderedWidth = (videoSize.w / videoSize.h) * vh;
          const initialOffset = (INITIAL_OFFSET_VW / 100) * vw;
          return Math.max(0, renderedWidth - vw - initialOffset);
        };

        gsap.set(frame1, { xPercent: 0, autoAlpha: 1 });
        gsap.set(frame2, { xPercent: 30, autoAlpha: 0 });
        gsap.set(video, { x: 0 });

        const SCROLL_MULTIPLIER = 2.5;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () =>
              `+=${Math.max(
                computePan() * SCROLL_MULTIPLIER,
                window.innerHeight * 2
              )}`,
            pin: sticky,
            pinSpacing: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            // This trigger is created late (after video metadata) while
            // pinned sections below already exist. Refresh it first so
            // their start positions include this pin's spacer.
            refreshPriority: 1,
            onUpdate: (self) => {
              if (self.progress > 0.08) setFrame2Revealed(true);
            },
          },
        });

        tl.to(video, { x: () => -computePan(), ease: "none" }, 0);
        tl.to(
          frame1,
          { xPercent: -20, autoAlpha: 0, ease: "none", duration: 0.15 },
          0
        );
        tl.to(
          frame2,
          { xPercent: 0, autoAlpha: 1, ease: "none", duration: 0.2 },
          0.1
        );

        requestAnimationFrame(() => ScrollTrigger.refresh());

        const onResize = () => ScrollTrigger.refresh();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
      }, section);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [videoSize]);

  return (
    <>
      {/* ─────────── Desktop hero (md+) ─────────── */}
      <section ref={sectionRef} className="relative hidden w-full md:block">
        <div
          ref={stickyRef}
          className="relative h-screen w-full overflow-hidden bg-black"
        >
          <video
            ref={videoRef}
            className="absolute top-0 h-full w-auto max-w-none will-change-transform"
            style={{ left: "-5vw" }}
            src={ASSETS.heroVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />

          <div className="absolute inset-0 z-10">
            <div
              ref={frame1Ref}
              className="absolute inset-0 flex items-center justify-start px-8 md:px-16 lg:px-24"
            >
              <div className="flex max-w-3xl flex-col items-start text-left">
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium tracking-wide text-white/90">
                    {t.hero.tag1}
                  </span>
                  <span className="text-sm text-white/40">·</span>
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium tracking-wide text-white/90">
                    {t.hero.tag2}
                  </span>
                </div>
                <RevealText
                  as="h1"
                  className="text-[clamp(3.25rem,7.5vw,8rem)] font-semibold leading-[0.95] tracking-tight text-white"
                >
                  {t.hero.frame1.heading1}
                  <br />
                  {t.hero.frame1.heading2}
                </RevealText>
                <p className="mt-6 max-w-md text-lg font-semibold text-white/85 md:text-xl">
                  {t.hero.frame1.sub}
                </p>
              </div>
            </div>

            <div
              ref={frame2Ref}
              // Hidden pre-hydration so it never stacks over frame 1 while
              // GSAP (which waits on video metadata) hasn't initialized yet.
              style={{ visibility: "hidden", opacity: 0 }}
              className="absolute inset-0 flex items-center justify-end px-8 md:px-16 lg:px-24"
            >
              <div className="flex w-full max-w-5xl flex-col items-end text-right">
                <RevealText
                  as="h2"
                  play={frame2Revealed}
                  className="text-[clamp(3.25rem,7.5vw,8rem)] font-semibold leading-[0.95] tracking-tight text-white"
                >
                  {t.hero.frame2.heading1}
                  <br />
                  {t.hero.frame2.heading2}
                </RevealText>
                <p className="mt-6 max-w-md text-lg font-semibold text-white/85 md:text-xl">
                  {t.hero.frame2.sub}
                </p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2 text-sm text-white/80 md:bottom-8 md:left-10">
            <span className="inline-block h-4 w-px bg-white/60" />
            <span className="tracking-wide">{t.hero.scroll}</span>
          </div>
        </div>
      </section>

      {/* ─────────── Mobile hero (< md) ─────────── */}
      <section id="mobile-hero" className="relative w-full bg-black md:hidden">
        {/* Sticky video stays in place while text scrolls past it.
            svh: stable small-viewport height — 100vh overflows behind
            mobile browser chrome and caused text to spill at load. */}
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          <video
            ref={mobileVideoRef}
            className="absolute top-0 h-full w-auto max-w-none"
            style={{ left: "-110vw" }}
            src={ASSETS.heroVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          {/* Left-edge vignette removed — video offset (left:15vw) already
              leaves the left strip black from the section bg, a second dark
              gradient creates a double-shade as you scroll into Frame 2. */}
        </div>

        {/* Scrolling content sits on top of the sticky video */}
        <div className="relative z-10 -mt-[100svh] px-6 text-left text-white">
          {/* Frame 1 — first viewport: tags + heading at top, subhead at bottom */}
          <div className="flex h-[100svh] flex-col justify-between pb-10 pt-28">
            <div className="flex flex-col items-start">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/90">
                  {t.hero.tag1}
                </span>
                <span className="text-xs text-white/40">·</span>
                <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/90">
                  {t.hero.tag2}
                </span>
              </div>
              <RevealText
                as="h1"
                className="text-[clamp(2.25rem,9.5vw,3.5rem)] font-semibold leading-[0.95] tracking-tight text-white"
              >
                {t.hero.frame1.heading1}
                <br />
                {t.hero.frame1.heading2}
              </RevealText>
            </div>
            <p className="max-w-sm text-base font-semibold text-white/90">
              {t.hero.frame1.sub}
            </p>
          </div>

          {/* Frame 2: heading pushed down, subhead close beneath */}
          <div className="flex h-[100svh] flex-col pt-40">
            <RevealText
              as="h2"
              className="text-[clamp(2.25rem,9.5vw,3.5rem)] font-semibold leading-[0.95] tracking-tight text-white"
            >
              {t.hero.frame2.heading1}
              <br />
              {t.hero.frame2.heading2}
            </RevealText>
            <p className="mt-8 max-w-sm text-base font-semibold text-white/90">
              {t.hero.frame2.sub}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
