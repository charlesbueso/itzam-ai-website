"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  /** Playback rate. Default 0.6 (slightly slowed). */
  rate?: number;
  className?: string;
  poster?: string;
  /** Disable video on small screens (saves data). Defaults to false. */
  disableOnMobile?: boolean;
};

/**
 * Autoplay + muted + looping video, with a slowed playbackRate.
 * Mobile-optimized: `playsInline`, `preload="metadata"`, no controls.
 */
export default function LoopVideo({
  src,
  rate = 0.6,
  className = "",
  poster,
  disableOnMobile = false,
}: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const apply = () => {
      try {
        v.playbackRate = rate;
      } catch {
        /* noop */
      }
    };
    apply();
    v.addEventListener("loadedmetadata", apply);
    v.addEventListener("play", apply);
    return () => {
      v.removeEventListener("loadedmetadata", apply);
      v.removeEventListener("play", apply);
    };
  }, [rate, src]);

  return (
    <video
      ref={ref}
      className={`${className} ${disableOnMobile ? "hidden md:block" : ""}`}
      src={src}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  );
}
