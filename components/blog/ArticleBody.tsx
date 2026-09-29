import Link from "next/link";
import type { ReactNode } from "react";
import type { Block } from "@/lib/blog/types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

/** **bold** and [text](href) — the only inline markup posts use. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g).map((part, i) => {
    const bold = part.match(/^\*\*(.+)\*\*$/);
    if (bold) return <strong key={i} className="font-semibold text-white">{bold[1]}</strong>;
    const link = part.match(/^\[(.+)\]\((.+)\)$/);
    if (link) {
      const cls = "text-[#c9a040] underline decoration-[#c9a040]/40 underline-offset-4 transition hover:decoration-[#c9a040]";
      return link[2].startsWith("/") ? (
        <Link key={i} href={link[2]} className={cls}>{link[1]}</Link>
      ) : (
        <a key={i} href={link[2]} className={cls} target="_blank" rel="noopener noreferrer">{link[1]}</a>
      );
    }
    return part;
  });
}

export function CtaBox({ variant, locale, t }: { variant: "assessment" | "contact"; locale: Locale; t: Dictionary }) {
  const c = t.blog.cta[variant];
  return (
    <aside className="my-12 rounded-3xl border border-[#c9a040]/50 bg-gradient-to-br from-[#c9a040]/[0.10] to-transparent p-7 md:p-9">
      <p className="text-2xl font-semibold leading-tight text-white md:text-3xl">{c.heading}</p>
      <p className="mt-3 max-w-xl text-base text-white/75">{c.body}</p>
      <Link href={`/${locale}/${variant}`} className="btn-gold mt-6">
        {c.button}
        <span aria-hidden="true" className="btn-arrow">→</span>
      </Link>
    </aside>
  );
}

export default function ArticleBody({ blocks, locale, t }: { blocks: Block[]; locale: Locale; t: Dictionary }) {
  return (
    <div className="text-[1.0625rem] leading-[1.75] text-white/75 md:text-lg">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} className="mb-4 mt-14 text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl">
                {b.text}
              </h2>
            );
          case "p":
            return <p key={i} className="mb-6">{inline(b.text)}</p>;
          case "ul":
          case "ol": {
            const Tag = b.type;
            return (
              <Tag key={i} className="mb-6 space-y-3">
                {b.items.map((item, j) => (
                  <li key={j} className="flex gap-4">
                    <span aria-hidden="true" className="mt-[0.2em] w-6 flex-shrink-0 font-mono text-sm text-[#c9a040]">
                      {b.type === "ol" ? String(j + 1).padStart(2, "0") : "✦"}
                    </span>
                    <span>{inline(item)}</span>
                  </li>
                ))}
              </Tag>
            );
          }
          case "facts":
            return (
              <dl key={i} className="mb-10 grid grid-cols-1 gap-x-8 gap-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:grid-cols-2">
                {b.items.map((f) => (
                  <div key={f.label}>
                    <dt className="font-mono text-xs uppercase tracking-[0.18em] text-white/45">{f.label}</dt>
                    <dd className="mt-1 text-base text-white/90">{f.value}</dd>
                  </div>
                ))}
              </dl>
            );
          case "stats":
            return (
              <div key={i} className="my-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
                {b.items.map((s) => (
                  <div key={s.label} className="bg-black p-5 md:p-6">
                    <p className="text-3xl font-semibold tracking-tight text-[#c9a040] md:text-4xl">{s.value}</p>
                    <p className="mt-2 text-sm leading-snug text-white/60">{s.label}</p>
                  </div>
                ))}
              </div>
            );
          case "table":
            return (
              <div key={i} className="my-8 overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[520px] border-collapse text-left text-sm md:text-base">
                  <thead>
                    <tr className="border-b border-white/15 bg-white/[0.03]">
                      {b.head.map((h, j) => (
                        <th key={j} className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#c9a040]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, r) => (
                      <tr key={r} className="border-b border-white/10 last:border-0">
                        {row.map((cell, c) => (
                          <td key={c} className={`px-4 py-3 align-top ${c === 0 ? "font-semibold text-white" : "text-white/70"}`}>
                            {inline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "cta":
            return <CtaBox key={i} variant={b.variant} locale={locale} t={t} />;
        }
      })}
    </div>
  );
}
