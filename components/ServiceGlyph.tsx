"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const GOLD = "#c9a040";

export type GlyphVariant = "assessment" | "playbook" | "support" | "brain";

/**
 * ServiceGlyph — bespoke animated line-art for each service section.
 *
 * Strokes ([data-draw]) draw themselves in when scrolled into view;
 * nodes ([data-node]) pop in after. Desktop plays the sequence once on
 * enter; mobile scrubs it with scroll (anchored to the glyph) so the
 * drawing always happens on screen. Ambient loops (.glyph-spin,
 * .glyph-flow, .glyph-pulse — see globals.css) run continuously and
 * are disabled under prefers-reduced-motion.
 */
export default function ServiceGlyph({
  variant,
  light = false,
  className = "",
}: {
  variant: GlyphVariant;
  light?: boolean;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement | null>(null);
  const base = light ? "#26221a" : "#ece7e7";

  useLayoutEffect(() => {
    const svg = ref.current;
    if (!svg) return;

    const draws = Array.from(
      svg.querySelectorAll<SVGGeometryElement>("[data-draw]")
    );
    const nodes = Array.from(svg.querySelectorAll<SVGElement>("[data-node]"));
    // Dashed decorative strokes can't use the dash-draw trick (it would
    // clobber their dash pattern / flow loop) — they fade in instead.
    const fades = Array.from(svg.querySelectorAll<SVGElement>("[data-fade]"));

    const setInitial = () => {
      draws.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(nodes, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" });
      gsap.set(fades, { autoAlpha: 0 });
      gsap.set(svg, { autoAlpha: 1 });
    };

    const buildTl = (tl: gsap.core.Timeline) => {
      tl.to(draws, {
        strokeDashoffset: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: "power2.inOut",
      });
      tl.to(fades, { autoAlpha: 1, duration: 0.6, stagger: 0.15 }, "-=0.7");
      tl.to(
        nodes,
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "back.out(2)",
        },
        "-=0.5"
      );
      return tl;
    };

    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        setInitial();
        const tl = buildTl(
          gsap.timeline({
            scrollTrigger: { trigger: svg, start: "top 82%", once: true },
          })
        );
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      }
    );

    // Mobile: scrub the drawing with scroll so it plays while the glyph
    // is actually on screen, matching the manifesto scene's behavior.
    mm.add(
      "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
      () => {
        setInitial();
        const tl = buildTl(
          gsap.timeline({
            scrollTrigger: {
              trigger: svg,
              start: "top 90%",
              end: "top 40%",
              scrub: 0.4,
            },
          })
        );
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      }
    );

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(svg, { autoAlpha: 1 });
      gsap.set(draws, { strokeDasharray: "none", strokeDashoffset: 0 });
      gsap.set([...nodes, ...fades], { autoAlpha: 1, scale: 1 });
    });

    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(id);
      mm.revert();
    };
  }, [variant]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 240 240"
      fill="none"
      aria-hidden="true"
      className={`opacity-0 ${className}`}
    >
      {variant === "assessment" && <Assessment base={base} />}
      {variant === "playbook" && <Playbook base={base} />}
      {variant === "support" && <Support base={base} />}
      {variant === "brain" && <Brain base={base} />}
    </svg>
  );
}

/* ── 01 · AI Opportunity Assessment — diagnostic radar ── */
function Assessment({ base }: { base: string }) {
  return (
    <>
      {/* Crosshair */}
      <path d="M120 14 V226 M14 120 H226" data-draw="" stroke={base} strokeOpacity="0.25" strokeWidth="1" />
      {/* Concentric frames */}
      <rect x="24" y="24" width="192" height="192" data-draw="" stroke={base} strokeOpacity="0.6" strokeWidth="1.5" />
      <rect x="52" y="52" width="136" height="136" data-draw="" stroke={base} strokeOpacity="0.45" strokeWidth="1.5" />
      {/* Scan circle */}
      <circle cx="120" cy="120" r="78" data-fade="" stroke={base} strokeOpacity="0.7" strokeWidth="1.5" strokeDasharray="4 6" />
      {/* Radar sweep */}
      <g className="glyph-spin">
        <path d="M120 120 L120 32" stroke={GOLD} strokeWidth="2" strokeLinecap="square" />
        <circle cx="120" cy="32" r="3.5" fill={GOLD} />
      </g>
      {/* Detected opportunities */}
      <circle data-node="" cx="78" cy="88" r="5" fill={GOLD} className="glyph-pulse" />
      <circle data-node="" cx="160" cy="142" r="5" fill={GOLD} className="glyph-pulse" />
      <circle data-node="" cx="104" cy="176" r="4" fill={GOLD} fillOpacity="0.7" />
    </>
  );
}

/* ── 02 · Sales Playbook Generator — the playbook that writes itself ── */
function Playbook({ base }: { base: string }) {
  return (
    <>
      {/* Document frame */}
      <rect x="46" y="26" width="148" height="188" rx="8" data-draw="" stroke={base} strokeOpacity="0.7" strokeWidth="1.5" />
      {/* Written lines */}
      <path d="M66 58 H174" data-draw="" stroke={base} strokeOpacity="0.55" strokeWidth="1.5" />
      <path d="M66 78 H150" data-draw="" stroke={base} strokeOpacity="0.45" strokeWidth="1.5" />
      <path d="M66 98 H166" data-draw="" stroke={base} strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M66 118 H138" data-draw="" stroke={base} strokeOpacity="0.25" strokeWidth="1.5" />
      {/* Stepped growth arrow — the greca climbing off the page */}
      <path d="M66 186 H90 V166 H114 V146 H138 V126 H162 V106 H186" data-draw="" stroke={GOLD} strokeWidth="2.5" strokeLinejoin="miter" />
      <path d="M172 106 L186 106 L186 120" data-draw="" stroke={GOLD} strokeWidth="2.5" />
      <circle data-node="" cx="186" cy="106" r="5" fill={GOLD} className="glyph-pulse" />
      <circle data-node="" cx="66" cy="186" r="4" fill={GOLD} fillOpacity="0.7" />
    </>
  );
}

/* ── 03 · Customer Support Engine — always-on conversation ── */
function Support({ base }: { base: string }) {
  return (
    <>
      {/* Uptime arc */}
      <path d="M120 16 A104 104 0 1 1 16 120" data-fade="" stroke={base} strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="3 7" />
      {/* Inbound bubble */}
      <path d="M38 64 H118 A10 10 0 0 1 128 74 V106 A10 10 0 0 1 118 116 H66 L48 132 V116 H38 A10 10 0 0 1 28 106 V74 A10 10 0 0 1 38 64 Z" data-draw="" stroke={base} strokeOpacity="0.7" strokeWidth="1.5" />
      {/* Typing dots */}
      <circle data-node="" cx="60" cy="90" r="4" fill={base} fillOpacity="0.6" />
      <circle data-node="" cx="78" cy="90" r="4" fill={base} fillOpacity="0.6" />
      <circle data-node="" cx="96" cy="90" r="4" fill={base} fillOpacity="0.6" />
      {/* Engine reply bubble */}
      <path d="M122 128 H202 A10 10 0 0 1 212 138 V170 A10 10 0 0 1 202 180 H184 V196 L166 180 H122 A10 10 0 0 1 112 170 V138 A10 10 0 0 1 122 128 Z" data-draw="" stroke={GOLD} strokeWidth="2" />
      <path d="M130 146 H194 M130 162 H178" data-draw="" stroke={GOLD} strokeOpacity="0.8" strokeWidth="1.5" />
      {/* Message flow between them */}
      <path d="M128 96 C168 96 150 116 112 148" data-fade="" stroke={GOLD} strokeWidth="1.5" strokeDasharray="5 7" className="glyph-flow" />
      <circle data-node="" cx="212" cy="128" r="5" fill={GOLD} className="glyph-pulse" />
    </>
  );
}

/* ── 04 · Business Brain Lab — knowledge constellation ── */
function Brain({ base }: { base: string }) {
  const nodes: [number, number][] = [
    [120, 36], // A 0
    [60, 84], // B 1
    [180, 84], // C 2
    [36, 148], // D 3
    [120, 124], // E 4 (core)
    [204, 148], // F 5
    [84, 196], // G 6
    [156, 196], // H 7
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 4],
    [2, 4],
    [1, 3],
    [2, 5],
    [3, 6],
    [4, 6],
    [4, 7],
    [5, 7],
    [6, 7],
  ];
  return (
    <>
      {/* Orbit */}
      <circle cx="120" cy="126" r="102" data-fade="" stroke={base} strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 8" className="glyph-spin" />
      {/* Edges */}
      {edges.map(([a, b], i) => (
        <line
          key={i}
          data-draw=""
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke={base}
          strokeOpacity="0.5"
          strokeWidth="1.5"
        />
      ))}
      {/* Nodes */}
      {nodes.map(([x, y], i) =>
        i === 4 ? (
          <circle key={i} data-node="" cx={x} cy={y} r="8" fill={GOLD} className="glyph-pulse" />
        ) : (
          <circle key={i} data-node="" cx={x} cy={y} r="4.5" stroke={GOLD} strokeWidth="1.5" fill="none" />
        )
      )}
    </>
  );
}
