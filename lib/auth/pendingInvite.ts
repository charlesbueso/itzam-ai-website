import "server-only";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Pending-invite cookie.
 *
 * After clicking an invite link while logged out, we drop a short-lived
 * HttpOnly cookie carrying the questionnaire id + token plaintext so that
 * after sign-up + email confirmation we can resume the redemption flow.
 *
 * The cookie is signed with INVITE_COOKIE_SECRET (HMAC-SHA256) to prevent
 * client-side tampering. It is *not* encrypted — the token plaintext is
 * already opaque random bytes; signing alone is sufficient.
 */

const COOKIE_NAME = "itzam_pending_invite";
const TTL_SECONDS = 60 * 60 * 2; // 2 hours — covers email roundtrip

type Payload = { id: string; t: string; exp: number };

function getSecret(): string {
  const s = process.env.INVITE_COOKIE_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "INVITE_COOKIE_SECRET is not configured (must be ≥32 chars)"
    );
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function setPendingInvite(id: string, t: string): void {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const body = Buffer.from(JSON.stringify({ id, t, exp })).toString("base64url");
  const sig = sign(body);
  cookies().set(COOKIE_NAME, `${body}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export function readPendingInvite(): { id: string; t: string } | null {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const idx = raw.lastIndexOf(".");
  if (idx <= 0) return null;
  const body = raw.slice(0, idx);
  const sig = raw.slice(idx + 1);
  if (!safeEqual(sign(body), sig)) return null;
  try {
    const decoded = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as Payload;
    if (typeof decoded.id !== "string" || typeof decoded.t !== "string") return null;
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return { id: decoded.id, t: decoded.t };
  } catch {
    return null;
  }
}

export function clearPendingInvite(): void {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
