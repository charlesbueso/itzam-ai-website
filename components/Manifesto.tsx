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
 * Manifesto — "Conocimiento en tu operación".
 *
 * A geometric agave draws itself in line-art as the user scrolls: the
 * blades fan out from the center, a golden quiote (the agave's
 * once-in-a-lifetime flower stalk) shoots up and blooms, and a sun
 * rises above it. Mexican pride without pre-Hispanic iconography.
 * Desktop: the scene is pinned and scrubbed over ~1.6 viewports.
 * Mobile: no pin — the copy stacks above the artwork, so the text
 * scrubs with the section while the drawing gets its own scrub
 * anchored to the SVG itself (otherwise it finishes off-screen).
 * Reduced motion: everything set to final state.
 */

const BASE_Y = 390;

type Leaf = { bx: number; w: number; tx: number; ty: number; g: string };

/** Blades in symmetric pairs, innermost → outermost. */
const LEAVES: Leaf[] = [
  { bx: 233, w: 6, tx: 204, ty: 182, g: "leaves-1" },
  { bx: 247, w: 6, tx: 276, ty: 182, g: "leaves-1" },
  { bx: 226, w: 7, tx: 170, ty: 205, g: "leaves-2" },
  { bx: 254, w: 7, tx: 310, ty: 205, g: "leaves-2" },
  { bx: 218, w: 8, tx: 118, ty: 248, g: "leaves-3" },
  { bx: 262, w: 8, tx: 362, ty: 248, g: "leaves-3" },
  { bx: 210, w: 8, tx: 72, ty: 302, g: "leaves-4" },
  { bx: 270, w: 8, tx: 408, ty: 302, g: "leaves-4" },
  { bx: 202, w: 7, tx: 46, ty: 352, g: "leaves-5" },
  { bx: 278, w: 7, tx: 434, ty: 352, g: "leaves-5" },
];

const LEAF_GROUPS = ["leaves-1", "leaves-2", "leaves-3", "leaves-4", "leaves-5"];

/**
 * One blade: base edge → tip → base edge, with both quadratic control
 * points bowed away from the plant's axis so the blade reads as a
 * curved agave sabre instead of a straight spike.
 */
function leafPath({ bx, w, tx, ty }: Leaf): string {
  const dx = tx - bx;
  const dy = ty - BASE_Y;
  // Normal of the blade's spine with a downward-outward direction.
  let nx = dy;
  let ny = -dx;
  if (ny < 0) {
    nx = -nx;
    ny = -ny;
  }
  const ox = Math.round(nx * 0.11);
  const oy = Math.round(ny * 0.11);
  const c1x = Math.round((bx - w + tx) / 2) + ox;
  const c1y = Math.round((BASE_Y + ty) / 2) + oy;
  const c2x = Math.round((tx + bx + w) / 2) + ox;
  const c2y = Math.round((ty + BASE_Y) / 2) + oy;
  return `M${bx - w} ${BASE_Y} Q${c1x} ${c1y} ${tx} ${ty} Q${c2x} ${c2y} ${bx + w} ${BASE_Y}`;
}

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
    const bloom = svg.querySelector<SVGPathElement>("[data-bloom]");

    const initDraw = (p: SVGPathElement) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      return len;
    };

    // Copy choreography. `quoteAt` differs per layout: desktop holds the
    // quote until the drawing nears completion; mobile reveals it sooner
    // because the drawing runs on its own trigger below the copy.
    const buildText = (tl: gsap.core.Timeline, quoteAt: number) => {
      tl.to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0);
      tl.to(
        words,
        { yPercent: 0, autoAlpha: 1, duration: 0.55, stagger: 0.07, ease: "power3.out" },
        0.05
      );
      tl.to(quote, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" }, quoteAt);
      return tl;
    };

    // Drawing choreography, offset by `base` so it can slot into the
    // combined pinned timeline (desktop) or run standalone (mobile).
    const buildScene = (tl: gsap.core.Timeline, base: number) => {
      const by = (sel: string) =>
        draws.filter((d) => d.dataset.draw === sel);

      tl.to(by("ground"), { strokeDashoffset: 0, duration: 0.35, ease: "none" }, base);
      // Blades fan out from the center, pair by pair
      LEAF_GROUPS.forEach((g, i) => {
        tl.to(
          by(g),
          { strokeDashoffset: 0, duration: 0.45, ease: "none" },
          base + 0.2 + i * 0.25
        );
      });
      tl.to(by("stalk"), { strokeDashoffset: 0, duration: 0.4, ease: "none" }, base + 1.35);
      tl.to(by("bloom"), { strokeDashoffset: 0, duration: 0.25, ease: "none" }, base + 1.65);
      if (bloom)
        tl.to(bloom, { fill: GOLD, fillOpacity: 0.9, duration: 0.25 }, base + 1.85);
      tl.to(by("sun"), { strokeDashoffset: 0, duration: 0.5, ease: "none" }, base + 1.6);
      tl.to(
        rays,
        { autoAlpha: 1, duration: 0.22, stagger: 0.05, ease: "power1.out" },
        base + 1.85
      );
      return tl;
    };

    const setInitial = () => {
      draws.forEach(initDraw);
      gsap.set(svg, { autoAlpha: 1 });
      gsap.set(rays, { autoAlpha: 0 });
      if (bloom) gsap.set(bloom, { fillOpacity: 0 });
      gsap.set(eyebrow, { autoAlpha: 0, y: 16 });
      gsap.set(words, { yPercent: 110, autoAlpha: 0 });
      gsap.set(quote, { autoAlpha: 0, y: 36 });
    };

    const setFinal = () => {
      gsap.set(svg, { autoAlpha: 1 });
      gsap.set(draws, { strokeDasharray: "none", strokeDashoffset: 0 });
      gsap.set(rays, { autoAlpha: 1 });
      if (bloom) gsap.set(bloom, { fill: GOLD, fillOpacity: 0.9 });
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
        buildText(tl, 1.7);
        buildScene(tl, 0.1);
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
        // Copy scrubs in as the section enters.
        const tlText = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            end: "top 25%",
            scrub: 0.4,
          },
        });
        buildText(tlText, 0.9);
        // The drawing is anchored to the artwork itself so every stroke
        // happens on screen while the SVG travels up the viewport.
        const tlScene = gsap.timeline({
          scrollTrigger: {
            trigger: svg,
            start: "top 88%",
            end: "top 22%",
            scrub: 0.4,
          },
        });
        buildScene(tlScene, 0);
        return () => {
          tlText.scrollTrigger?.kill();
          tlText.kill();
          tlScene.scrollTrigger?.kill();
          tlScene.kill();
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

          {/* ── Agave scene ── */}
          <div className="md:col-span-6">
            <svg
              ref={svgRef}
              viewBox="0 0 480 420"
              fill="none"
              role="img"
              aria-label="Line drawing of a geometric agave blooming beneath a rising sun"
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

              {/* Agave blades */}
              {LEAVES.map((leaf, i) => (
                <path
                  key={i}
                  data-draw={leaf.g}
                  d={leafPath(leaf)}
                  stroke={INK}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Quiote — the agave's flower stalk */}
              <path
                data-draw="stalk"
                d={`M240 ${BASE_Y} V170`}
                stroke={GOLD}
                strokeWidth="2.5"
              />
              {/* Bloom */}
              <path
                data-draw="bloom"
                data-bloom
                d="M240 170 L228 154 L240 138 L252 154 Z"
                stroke={GOLD}
                strokeWidth="2"
                fill={GOLD}
                fillOpacity="0"
              />
            </svg>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
