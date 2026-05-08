import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "crypto";

/**
 * Generates a 256-bit URL-safe random token. Returned plaintext is shown to
 * the admin once; only the SHA-256 hash is stored in the database.
 */
export function generateInviteToken(): { plaintext: string; hash: string } {
  const plaintext = randomBytes(32).toString("base64url");
  const hash = hashInviteToken(plaintext);
  return { plaintext, hash };
}

export function hashInviteToken(plaintext: string): string {
  return createHash("sha256").update(plaintext, "utf8").digest("hex");
}

/**
 * Constant-time comparison of two hex-encoded SHA-256 hashes.
 * Returns false if lengths differ (avoids panic in timingSafeEqual).
 */
export function tokensEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ab.length !== bb.length || ab.length === 0) return false;
  return timingSafeEqual(ab, bb);
}
