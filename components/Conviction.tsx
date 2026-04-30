"use client";

import { ASSETS } from "@/lib/assets";
import { useT } from "@/lib/i18n/LocaleProvider";

export default function Conviction() {
  const t = useT();
  return (
    <section id="conviction" className="relative w-full bg-[#f4f1e8] py-32 md:py-40">
      <div className="mx-auto w-full max-w-[90rem] px-6 sm:px-6 md:px-8">
        <h2 className="text-4xl font-semibold uppercase leading-[0.95] tracking-tight text-neutral-900 sm:text-5xl md:text-6xl lg:text-7xl">
          {t.conviction.heading1}
          <br />
          {t.conviction.heading2}
        </h2>

        <div className="mt-32 flex md:mt-48 md:justify-end">
          <div className="flex max-w-2xl items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ASSETS.logoGold}
              alt=""
              aria-hidden="true"
              className="mt-2 h-6 w-6 flex-shrink-0 md:mt-3 md:h-8 md:w-8"
            />
            <p className="text-2xl font-bold leading-snug text-neutral-900 md:text-3xl">
              {t.conviction.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

