"use client";

import {
  CSSProperties,
  ElementType,
  ReactNode,
  useLayoutEffect,
  useRef,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  /** Delay (s) before the animation starts. */
  delay?: number;
  /** Vertical offset (px) the element starts from. */
  y?: number;
  /** Stagger between direct children (s). 0 = single element animation. */
  stagger?: number;
  /** Selector for child targets when stagger > 0. Defaults to direct children. */
  childrenSelector?: string;
  /**
   * Trigger position; passed straight to ScrollTrigger.
   * Defaults to "top 85%".
   */
  start?: string;
};

/**
 * Reveal — bottom-up fade reveal driven by ScrollTrigger.
 *
 * - Uses gsap.matchMedia() so `prefers-reduced-motion: reduce` skips the
 *   animation entirely (target jumps to its final state with no flicker).
 * - When `stagger > 0`, animates direct children (or the selector you
 *   pass) one after another. Otherwise animates the wrapper itself.
 */
export default function Reveal({
  children,
  className,
  style,
  as: Tag = "div",
  delay = 0,
  y = 40,
  stagger = 0,
  childrenSelector,
  start = "top 85%",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets: Element[] | Element =
      stagger > 0
        ? Array.from(
            childrenSelector
              ? el.querySelectorAll(childrenSelector)
              : el.children
          )
        : el;

    const mm = gsap.matchMedia();

    mm.add(
      {
        animate: "(prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const reduce = ctx.conditions?.reduce;

        if (reduce) {
          gsap.set(targets, { y: 0, autoAlpha: 1, clearProps: "transform" });
          return;
        }

        gsap.set(targets, { y, autoAlpha: 0 });

        gsap.to(targets, {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out",
          delay,
          stagger: stagger > 0 ? stagger : 0,
          scrollTrigger: {
            trigger: el,
            start,
            once: true,
          },
        });
      }
    );

    const id = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(id);
      mm.revert();
    };
  }, [delay, y, stagger, childrenSelector, start]);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLElement>}
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}
