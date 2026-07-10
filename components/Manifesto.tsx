"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useT } from "@/lib/i18n/LocaleProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INK = "#221c13";
const GOLD = "#c9a040";

/**
 * Manifesto — "El templo del conocimiento".
 *
 * A stepped Mayan pyramid draws itself in line-art as the user scrolls,
 * a sun rises above it, and the manifesto copy is choreographed around
 * it. Desktop: the scene is pinned and scrubbed over ~1.6 viewports.
 * Mobile: no pin — the drawing scrubs with natural scroll and the text
 * plays once on enter. Reduced motion: everything set to final state.
 */
export default function Manifesto() {
  const t = useT();
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const eyebrowRef = useRef<HTMLDivElement | null>(null);
  const quoteRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const svg = svgRef.current;
    const heading = headingRef.current;
    const eyebrow = eyebrowRef.current;
    const quote = quoteRef.current;
    if (!section || !stage || !svg || !heading || !eyebrow || !quote) return;

    const words = Array.from(heading.querySelectorAll<HTMLElement>(".word-inner"));
    const draws = Array.from(svg.querySelectorAll<SVGPathElement>("[data-draw]"));
    const rays = Array.from(svg.querySelectorAll<SVGLineElement>("[data-ray]"));
    const doorway = svg.querySelector<SVGPathElement>("[data-door]");

    const initDraw = (p: SVGPathElement) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      return len;
    };

    // Timeline body shared by desktop (pinned scrub) and mobile (scrub, no pin)
    const build = (tl: gsap.core.Timeline) => {
      const by = (sel: string) =>
        draws.filter((d) => d.dataset.draw === sel);

      tl.to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0);
      tl.to(
        words,
        { yPercent: 0, autoAlpha: 1, duration: 0.55, stagger: 0.07, ease: "power3.out" },
        0.05
      );
      tl.to(by("ground"), { strokeDashoffset: 0, duration: 0.35, ease: "none" }, 0.1);
      tl.to(by("outline"), { strokeDashoffset: 0, duration: 1.5, ease: "none" }, 0.25);
      tl.to(by("rail"), { strokeDashoffset: 0, duration: 0.6, ease: "none" }, 1.0);
      tl.to(by("treads"), { strokeDashoffset: 0, duration: 0.55, ease: "none" }, 1.25);
      tl.to(by("temple"), { strokeDashoffset: 0, duration: 0.45, ease: "none" }, 1.45);
      if (doorway)
        tl.to(doorway, { fill: GOLD, fillOpacity: 0.9, duration: 0.3 }, 1.8);
      tl.to(by("sun"), { strokeDashoffset: 0, duration: 0.5, ease: "none" }, 1.7);
      tl.to(
        rays,
        { autoAlpha: 1, duration: 0.22, stagger: 0.05, ease: "power1.out" },
        1.95
      );
      tl.to(quote, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" }, 1.7);
      return tl;
    };

    const setInitial = () => {
      draws.forEach(initDraw);
      gsap.set(svg, { autoAlpha: 1 });
      gsap.set(rays, { autoAlpha: 0 });
      gsap.set(eyebrow, { autoAlpha: 0, y: 16 });
      gsap.set(words, { yPercent: 110, autoAlpha: 0 });
      gsap.set(quote, { autoAlpha: 0, y: 36 });
    };

    const setFinal = () => {
      gsap.set(svg, { autoAlpha: 1 });
      gsap.set(draws, { strokeDasharray: "none", strokeDashoffset: 0 });
      gsap.set(rays, { autoAlpha: 1 });
      if (doorway) gsap.set(doorway, { fill: GOLD, fillOpacity: 0.9 });
      gsap.set([eyebrow, quote], { autoAlpha: 1, y: 0 });
      gsap.set(words, { yPercent: 0, autoAlpha: 1 });
    };

    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        setInitial();
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=160%",
            pin: stage,
            pinSpacing: true,
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        build(tl);
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      }
    );

    mm.add(
      "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
      () => {
        setInitial();
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            end: "bottom 95%",
            scrub: 0.4,
          },
        });
        build(tl);
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      }
    );

    mm.add("(prefers-reduced-motion: reduce)", () => {
      setFinal();
    });

    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(id);
      mm.revert();
    };
  }, []);

  const headingWords = [
    ...t.home.manifesto.heading1.split(" ").map((w) => ({ w, line: 1 })),
    { w: "\n", line: 0 },
    ...t.home.manifesto.heading2.split(" ").map((w) => ({ w, line: 2 })),
  ];

  return (
    <section
      ref={sectionRef}
      id="conviction"
      data-theme="light"
      className="manifesto-scene relative w-full bg-[#f4f1e8]"
    >
      {/* The stage carries its own bg: while pinned it becomes
          position-fixed, and a transparent stage would bleed over
          neighboring sections during ScrollTrigger refreshes. */}
      <div
        ref={stageRef}
        className="flex min-h-[100svh] w-full flex-col justify-center bg-[#f4f1e8] px-6 py-24 md:h-screen md:px-10 md:py-0"
      >
        <div className="mx-auto w-full max-w-[90rem]">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-8">
          {/* ── Copy ── */}
          <div className="md:col-span-6">
            <div ref={eyebrowRef}>
              <span className="inline-flex items-center rounded-full border border-neutral-900/15 bg-neutral-900/[0.03] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-neutral-700">
                {t.home.manifesto.eyebrow}
              </span>
            </div>

            <h2
              ref={headingRef}
              className="mt-8 text-[clamp(2.25rem,4.6vw,4.5rem)] font-semibold uppercase leading-[1.04] tracking-tight text-neutral-900"
            >
              {headingWords.map((item, i) =>
                item.w === "\n" ? (
                  <br key={`br-${i}`} className="hidden md:block" />
                ) : (
                  <span
                    key={`${item.w}-${i}`}
                    className="mr-[0.28em] inline-block overflow-hidden align-top"
                  >
                    <span className="word-inner inline-block will-change-transform">
                      {item.w}
                    </span>
                  </span>
                )
              )}
            </h2>

            <div ref={quoteRef} className="mt-12 max-w-xl md:mt-16">
              <p className="border-l-2 border-[#c9a040] pl-5 text-xl font-bold leading-snug text-neutral-900 md:pl-6 md:text-2xl">
                {t.home.manifesto.body}
              </p>
              <p className="mt-5 pl-5 font-mono text-xs font-medium uppercase tracking-[0.2em] text-neutral-500 md:pl-6 md:text-sm">
                {t.home.manifesto.attribution}
              </p>
            </div>
          </div>

          {/* ── Pyramid scene ── */}
          <div className="md:col-span-6">
            <svg
              ref={svgRef}
              viewBox="0 0 480 420"
              fill="none"
              role="img"
              aria-label="Line drawing of a stepped Mayan pyramid beneath a rising sun"
              className="mx-auto w-full max-w-[300px] opacity-0 sm:max-w-[380px] md:max-w-[520px] md:max-h-[72vh]"
            >
              {/* Sun */}
              <circle
                data-draw="sun"
                cx="240"
                cy="72"
                r="30"
                stroke={GOLD}
                strokeWidth="2"
              />
              {[...Array(8)].map((_, i) => {
                const a = (i * Math.PI) / 4 - Math.PI / 2;
                const x1 = 240 + Math.cos(a) * 42;
                const y1 = 72 + Math.sin(a) * 42;
                const x2 = 240 + Math.cos(a) * 54;
                const y2 = 72 + Math.sin(a) * 54;
                return (
                  <line
                    key={i}
                    data-ray=""
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={GOLD}
                    strokeWidth="2"
                    strokeLinecap="square"
                  />
                );
              })}

              {/* Ground */}
              <path
                data-draw="ground"
                d="M20 392 H460"
                stroke={INK}
                strokeOpacity="0.3"
                strokeWidth="1.5"
              />

              {/* Stepped silhouette — one continuous stroke */}
              <path
                data-draw="outline"
                d="M40 392 V348 H76 V304 H112 V260 H148 V216 H184 V172 H296 V216 H332 V260 H368 V304 H404 V348 H440 V392"
                stroke={INK}
                strokeWidth="2.5"
                strokeLinejoin="miter"
              />

              {/* Temple crown */}
              <path
                data-draw="temple"
                d="M204 172 V128 H276 V172 M196 128 H284"
                stroke={INK}
                strokeWidth="2.5"
              />
              <path
                data-door
                d="M231 172 V148 H249 V172 Z"
                stroke={INK}
                strokeWidth="2"
                fill={GOLD}
                fillOpacity="0"
              />

              {/* Staircase rails */}
              <path
                data-draw="rail"
                d="M216 392 V172 M264 392 V172"
                stroke={GOLD}
                strokeWidth="2"
              />
              {/* Treads */}
              <path
                data-draw="treads"
                d={[...Array(10)]
                  .map((_, i) => `M216 ${372 - i * 20} H264`)
                  .join(" ")}
                stroke={GOLD}
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
