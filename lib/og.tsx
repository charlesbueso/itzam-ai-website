import { ImageResponse } from "next/og";
import { ASSETS } from "@/lib/assets";

/**
 * Branded Open Graph card (1200×630) — what LinkedIn / WhatsApp / Slack show
 * when someone shares an itzam.ai link. Used by the `opengraph-image.tsx`
 * files under app/[locale]/.
 *
 * Fonts and the logotype are fetched at render time; if either fetch fails
 * the card still renders (default font / text wordmark) rather than breaking
 * the build.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

type OgCopy = { eyebrow: string; title: string; subtitle: string };
export type OgPage = "home" | "services" | "assessment" | "about" | "contact" | "blog";

export const OG_COPY: Record<OgPage, Record<"en" | "es", OgCopy>> = {
  home: {
    en: { eyebrow: "AI agency · Mexico & LatAm", title: "Intelligence, deployed.", subtitle: "AI for sales teams — diagnosis, implementation and results in weeks, not months." },
    es: { eyebrow: "Agencia de IA · México y LatAm", title: "Inteligencia, en producción.", subtitle: "IA para equipos de ventas — diagnóstico, implementación y resultados en semanas." },
  },
  services: {
    en: { eyebrow: "Services", title: "From assessment to production.", subtitle: "AI Opportunity Assessment · Sales Playbook Generator · Customer Support Engine · Business Brain Lab" },
    es: { eyebrow: "Servicios", title: "Del diagnóstico a producción.", subtitle: "AI Opportunity Assessment · Sales Playbook Generator · Customer Support Engine · Business Brain Lab" },
  },
  assessment: {
    en: { eyebrow: "Free AI Assessment", title: "How AI-ready is your sales team?", subtitle: "14 quick questions. Instant score, plus a personalized diagnostic of your top automation opportunities." },
    es: { eyebrow: "Diagnóstico de IA gratis", title: "¿Qué tan lista para la IA está tu área de ventas?", subtitle: "14 preguntas rápidas. Score al instante y un diagnóstico personalizado con tus mayores oportunidades." },
  },
  about: {
    en: { eyebrow: "About Itzam.ai", title: "Built to make AI work for your team.", subtitle: "A Mexican AI agency for commercial teams in LatAm." },
    es: { eyebrow: "Sobre Itzam.ai", title: "Construidos para que la IA funcione.", subtitle: "Una agencia mexicana de IA para equipos comerciales en LatAm." },
  },
  blog: {
    en: { eyebrow: "Blog", title: "Field notes from real deployments.", subtitle: "Case studies and practical guides on AI for sales teams in Mexico and LatAm." },
    es: { eyebrow: "Blog", title: "Notas de campo desde implementaciones reales.", subtitle: "Casos y guías prácticas de IA para equipos de ventas en México y LatAm." },
  },
  contact: {
    en: { eyebrow: "Contact", title: "Let's talk.", subtitle: "Tell us what you're building — or what's slowing you down. We reply within one business day." },
    es: { eyebrow: "Contacto", title: "Hablemos.", subtitle: "Cuéntanos qué estás construyendo — o qué te está frenando. Respondemos en menos de un día hábil." },
  },
};

/** Shared body for every app/[locale]/**\/opengraph-image.tsx. */
export function ogImageFor(page: OgPage, locale: string) {
  return renderOgImage(OG_COPY[page][locale === "es" ? "es" : "en"]);
}

const INK = "#000000";
const CREAM = "#ece7e7";
const GOLD = "#c9a040";

async function googleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    // No browser User-Agent → Google serves TrueType, which Satori can read.
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

async function logoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch(ASSETS.logotypeDark);
    if (!res.ok) return null;
    // Edge runtime: no Buffer — base64 via btoa, in chunks to keep the
    // String.fromCharCode argument list small.
    const bytes = new Uint8Array(await res.arrayBuffer());
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return `data:image/png;base64,${btoa(bin)}`;
  } catch {
    return null;
  }
}

export async function renderOgImage(opts: { eyebrow: string; title: string; subtitle: string }) {
  const text = `${opts.eyebrow}${opts.title}${opts.subtitle}itzam.ai`;
  const [semibold, regular, mono, logo] = await Promise.all([
    googleFont("Inter", 600, text),
    googleFont("Inter", 400, text),
    googleFont("IBM Plex Mono", 500, text.toUpperCase()),
    logoDataUrl(),
  ]);
  const fonts = [
    semibold && { name: "Inter", data: semibold, weight: 600 as const, style: "normal" as const },
    regular && { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
    mono && { name: "Plex Mono", data: mono, weight: 500 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 | 600 | 500; style: "normal" }[];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: INK,
          backgroundImage: "radial-gradient(circle at 88% 12%, rgba(201,160,64,0.22), rgba(0,0,0,0) 45%)",
          color: CREAM,
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} height={44} width={273} alt="" />
          ) : (
            <span style={{ fontSize: 40, fontWeight: 600 }}>itzam.ai</span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Plex Mono",
              fontSize: 24,
              letterSpacing: 5,
              color: GOLD,
              textTransform: "uppercase",
            }}
          >
            {opts.eyebrow}
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: opts.title.length > 70 ? 54 : opts.title.length > 42 ? 64 : 76,
              fontWeight: 600,
              lineHeight: 1.04,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            {opts.title}
          </div>
          <div style={{ marginTop: 24, fontSize: 30, lineHeight: 1.35, color: "rgba(236,231,231,0.72)", maxWidth: 940 }}>
            {opts.subtitle}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ width: 140, height: 4, background: GOLD }} />
          <div style={{ fontFamily: "Plex Mono", fontSize: 22, letterSpacing: 3, color: "rgba(236,231,231,0.55)" }}>
            ITZAM.AI
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined }
  );
}
