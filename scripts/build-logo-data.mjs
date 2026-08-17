/**
 * Regenerates lib/assessment/logo.ts from the brand logotypes in public/.
 *
 * The assessment report renderers (PDF + DOCX) run server-side and can't rely
 * on public/ being present in the deployed function bundle, so the logotypes
 * ship as base64 data URIs. Run after changing either source PNG:
 *
 *   node scripts/build-logo-data.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function load(file) {
  const buf = readFileSync(join(root, "public", file));
  if (buf.toString("ascii", 1, 4) !== "PNG") throw new Error(`${file} is not a PNG`);
  return {
    b64: buf.toString("base64"),
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

const dark = load("logotype-darkmode-nobg.png");
const light = load("logotype-lightmode-nobg.png");

const out = `/* eslint-disable */
// GENERATED FILE — do not edit by hand.
// Run \`node scripts/build-logo-data.mjs\` to regenerate from public/logotype-*.png.

/**
 * Itzam logotype (stepped pyramid + wordmark) inlined as base64 data URIs.
 * The assessment report renderers run server-side and can't rely on public/
 * being readable from the deployed function bundle.
 */

/** Light wordmark — for the navy cover and page bands of the PDF. */
export const LOGOTYPE_DARK_PNG =
  "data:image/png;base64,${dark.b64}";

/** Dark wordmark — for white backgrounds (DOCX). */
export const LOGOTYPE_LIGHT_PNG =
  "data:image/png;base64,${light.b64}";

/** Intrinsic size of the source artwork, for aspect-correct sizing. */
export const LOGOTYPE_DARK_SIZE = { width: ${dark.width}, height: ${dark.height} } as const;
export const LOGOTYPE_LIGHT_SIZE = { width: ${light.width}, height: ${light.height} } as const;

/** height / width of the dark logotype — multiply a target width by this. */
export const LOGOTYPE_RATIO = ${dark.height} / ${dark.width};
`;

writeFileSync(join(root, "lib", "assessment", "logo.ts"), out);
console.log(
  `wrote lib/assessment/logo.ts — dark ${dark.width}x${dark.height} (${Math.round(dark.b64.length / 1024)}KB b64), ` +
    `light ${light.width}x${light.height} (${Math.round(light.b64.length / 1024)}KB b64)`
);
