"use client";

import Link from "next/link";

type Props = {
  number: string;
  title: string;
  tagline: string;
  href: string;
  ctaLabel: string;
};

/**
 * ServiceCard — used in the Home page services teaser. Pure CSS hover:
 * gold border traces in clockwise via clip-path on a pseudo wrapper.
 */
export default function ServiceCard({
  number,
  title,
  tagline,
  href,
  ctaLabel,
}: Props) {
  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#c9a040]/60 hover:bg-white/[0.06] focus:outline-none focus-visible:border-[#c9a040] focus-visible:ring-2 focus-visible:ring-[#c9a040] md:p-7"
    >
      <div>
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#c9a040]">
          {number}
        </span>
        <h3 className="mt-4 text-xl font-semibold leading-tight text-white md:text-2xl">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-white/65 md:text-base">
          {tagline}
        </p>
      </div>

      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#c9a040] transition group-hover:gap-3">
        <span>{ctaLabel}</span>
        <span aria-hidden="true">→</span>
      </div>
    </Link>
  );
}
