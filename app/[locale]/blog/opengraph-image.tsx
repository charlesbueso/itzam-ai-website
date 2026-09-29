import { OG_CONTENT_TYPE, OG_SIZE, ogImageFor } from "@/lib/og";

// Edge: @vercel/og's Node build can't resolve its bundled font on Windows
// (Next 14.2); the edge build works everywhere.
export const runtime = "edge";
export const alt = "Itzam.ai — AI for sales teams in Mexico and LatAm";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image({ params }: { params: { locale: string } }) {
  return ogImageFor("blog", params.locale);
}
