"use client";

import { ElementType, ReactNode, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Delay (in seconds) before the animation starts once triggered. */
  delay?: number;
  /** Color of the sweeping line. */
  lineColor?: string;
  /**
   * Optional manual trigger. When **undefined** (default) the component
   * uses a ScrollTrigger to auto-play once the element scrolls into view.
   * When provided, the ScrollTrigger is disabled and the animation plays
   * only when `play` transitions from false → true.
   */
  play?: boolean;
};

/**
 * RevealText
 *
 * Two-phase reveal:
 *   1. Bottom-up translate + fade-in to ~35% opacity ("ghost" state).
 *   2. A vertical line sweeps left→right and a clip-path on a second
 *      copy of the text reveals it at full opacity behind the line.
 */
export default function RevealText({
  children,
  className,
  as: Tag = "span",
  delay = 0,
  lineColor = "#c9a040",
  play,
}: Props) {
  const wrapRef = useRef<HTMLElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const base = el.querySelector<HTMLElement>(".reveal-base");
    const fill = el.querySelector<HTMLElement>(".reveal-fill");
    const line = el.querySelector<HTMLElement>(".reveal-line");
    if (!base || !fill || !line) return;

    const manual = play !== undefined;

    const ctx = gsap.context(() => {
      gsap.set(base, { y: 24, autoAlpha: 0 });
      // Use negative top/bottom insets so descenders (p, y, g) are NOT
      // clipped — only the horizontal sweep matters.
      gsap.set(fill, { clipPath: "inset(-20% 100% -20% 0)" });
      gsap.set(line, { left: 0, autoAlpha: 0 });

      const tl = gsap.timeline({
        // Manual mode controls playback via the `play` prop, so it must be
        // paused. Auto mode lets ScrollTrigger drive playback natively.
        paused: manual,
        delay,
        ...(manual
          ? {}
          : {
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                once: true,
                toggleActions: "play none none none",
              },
            }),
      });

      tl.to(base, {
        y: 0,
        autoAlpha: 0.35,
        duration: 0.7,
        ease: "power3.out",
      });
      tl.to(line, { autoAlpha: 1, duration: 0.08 }, "+=0.05");
      tl.to(
        fill,
        {
          clipPath: "inset(-20% 0% -20% 0)",
          duration: 0.55,
          ease: "power2.inOut",
        },
        "<"
      );
      tl.to(
        line,
        { left: "100%", duration: 0.55, ease: "power2.inOut" },
        "<"
      );
      tl.to(line, { autoAlpha: 0, duration: 0.15 });
      // Fade out the ghost "base" so no faint duplicate is left behind.
      tl.to(base, { autoAlpha: 0, duration: 0.25 }, "-=0.1");

      tlRef.current = tl;

      // Manual mode: play now if `play` is already true at mount.
      if (manual && play) tl.play();
    }, el);

    // After mount, ensure ScrollTrigger positions are up to date. Hero's
    // pin can extend page height after this component mounts, which would
    // otherwise leave our trigger calibrated against the wrong scroll pos.
    const refreshId = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshId);
      tlRef.current = null;
      ctx.revert();
    };
    // We intentionally do NOT include `play` here — see effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);

  // React to manual `play` toggle
  useLayoutEffect(() => {
    if (play === undefined) return;
    const tl = tlRef.current;
    if (!tl) return;
    if (play) tl.play();
    else tl.pause(0).progress(0);
  }, [play]);

  return (
    <Tag
      ref={wrapRef as React.RefObject<HTMLElement>}
      className={`reveal-wrap relative block ${className ?? ""}`}
    >
      <span className="reveal-base relative block">{children}</span>
      <span className="reveal-fill absolute inset-0 block" aria-hidden="true">
        {children}
      </span>
      <span
        className="reveal-line pointer-events-none absolute -top-[10%] -bottom-[10%] w-[3px]"
        style={{ backgroundColor: lineColor }}
        aria-hidden="true"
      />
    </Tag>
  );
}

