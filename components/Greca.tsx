"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * GrecaDivider — the site's signature ornament.
 *
 * A stepped-fret meander (xicalcoliuhqui — the pre-Hispanic "greca
 * escalonada" of Mitla) rendered as a single hairline SVG path that
 * draws itself in as it scrolls into view. High-tech mexicano.
 */

const MOTIF_W = 56;
const H = 28;

/** One stepped-spiral motif: three steps up, a top run, and an inward hook. */
function motif(x: number): string {
  return [
    `M${x},${H - 4}`,
    "h8 v-6 h8 v-6 h8 v-6", // ascending steps
    "h24", // top run
    "v14 h-16 v-6 h8", // inward rectangular hook
  ].join(" ");
}

function grecaPath(count: number): string {
  let d = "";
  for (let i = 0; i < count; i++) d += motif(i * MOTIF_W) + " ";
  return d.trim();
}

export default function GrecaDivider({
  color = "#c9a040",
  opacity = 0.9,
  className = "",
}: {
  color?: string;
  opacity?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

  // 40 motifs ≈ 2240px — wider than most viewports; the wrapper clips it.
  const COUNT = 40;

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || !path) return;

    const length = path.getTotalLength();
    const mm = gsap.matchMedia();

    mm.add(
      {
        animate: "(prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        if (ctx.conditions?.reduce) {
          gsap.set(path, { strokeDasharray: "none", strokeDashoffset: 0 });
          return;
        }
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top 92%",
            end: "top 45%",
            scrub: 0.5,
          },
        });
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`pointer-events-none w-full overflow-hidden ${className}`}
    >
      <svg
        width={COUNT * MOTIF_W}
        height={H}
        viewBox={`0 0 ${COUNT * MOTIF_W} ${H}`}
        fill="none"
        className="block h-6 w-auto max-w-none md:h-7"
      >
        <path
          ref={pathRef}
          d={grecaPath(COUNT)}
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth={1.5}
          strokeLinecap="square"
        />
      </svg>
    </div>
  );
}
