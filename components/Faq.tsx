"use client";

import Reveal from "@/components/Reveal";
import RevealText from "@/components/RevealText";

export type FaqItem = { q: string; a: string };

/**
 * FAQ accordion on native <details>, so every answer is in the server HTML
 * (crawlable, works without JS). Pair it with `faqJsonLd()` from lib/seo
 * on the page so search/answer engines get the same Q&A as structured data.
 */
export default function Faq({
  eyebrow,
  heading,
  items,
  className = "",
}: {
  eyebrow: string;
  heading: string;
  items: FaqItem[];
  className?: string;
}) {
  return (
    <section className={`relative w-full bg-black px-6 py-24 md:px-10 md:py-32 ${className}`}>
      <div className="mx-auto grid w-full max-w-[90rem] grid-cols-1 gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <Reveal as="span">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#c9a040]">{eyebrow}</span>
          </Reveal>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
            <RevealText as="span">{heading}</RevealText>
          </h2>
        </div>

        <Reveal className="md:col-span-8" stagger={0.06}>
          {items.map((item, i) => (
            <details
              key={item.q}
              className="group border-b border-white/10 first:border-t [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-start gap-5 py-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a040] md:py-7">
                <span className="pt-1 font-mono text-xs uppercase tracking-[0.2em] text-[#c9a040]/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-lg font-semibold leading-snug text-white md:text-xl">{item.q}</span>
                <span
                  aria-hidden="true"
                  className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70 transition duration-300 group-open:rotate-45 group-open:border-[#c9a040] group-open:text-[#c9a040]"
                >
                  +
                </span>
              </summary>
              <p className="-mt-2 pb-7 pl-[calc(1.25rem+2ch)] pr-12 text-base leading-relaxed text-white/70">{item.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
