import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import type { LegalDocument } from "@/lib/i18n/legal";

export default function LegalPage({
  title,
  lastUpdated,
  doc,
}: {
  title: string;
  lastUpdated: string;
  doc: LegalDocument;
}) {
  return (
    <main>
      <section className="relative w-full bg-black px-6 pb-20 pt-44 md:px-10 md:pb-28 md:pt-52">
        <div className="mx-auto w-full max-w-3xl">
          <Reveal>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
              {title}
            </h1>
            <p className="mt-4 text-sm uppercase tracking-[0.18em] text-white/45">
              {lastUpdated}
            </p>
          </Reveal>

          <div className="mt-14 space-y-12">
            {doc.sections.map((section, idx) => (
              <section key={idx}>
                <h2 className="text-xl font-semibold text-white md:text-2xl">
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-4 text-base leading-relaxed text-white/75">
                  {section.blocks.map((block, bIdx) => {
                    if (block.type === "p") {
                      return <p key={bIdx}>{block.text}</p>;
                    }
                    if (block.type === "sub") {
                      return (
                        <p
                          key={bIdx}
                          className="text-sm font-semibold uppercase tracking-[0.14em] text-white/90"
                        >
                          {block.text}
                        </p>
                      );
                    }
                    return (
                      <ul
                        key={bIdx}
                        className="ml-5 list-disc space-y-2 text-white/75 marker:text-[#c9a040]"
                      >
                        {block.items.map((item, iIdx) => (
                          <li key={iIdx}>{item}</li>
                        ))}
                      </ul>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
