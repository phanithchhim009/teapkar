import { SignJWT, jwtVerify } from "jose";

// Edge-safe helpers (used by middleware and server code).
export const SESSION_COOKIE = "teabkar_admin";
// Sessions are stateless JWTs. Customer sessions also carry the account's token_version, which
// server code checks against the database, so a password reset or deleted account signs them out.
// The site owner's session can only be revoked by rotating SESSION_SECRET, so keep it fairly short.
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** The site owner (ADMIN_PASSWORD), or a customer account limited to its own events. */
export type SessionClaims = { role: "admin" } | { role: "customer"; sub: string; v: number };

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET must be set (16+ chars)");
  return new TextEncoder().encode(s);
}

export async function signSession(claims: SessionClaims) {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

/** Checks the signature and expiry only; server code must still confirm a customer account is current. */
export async function verifySession(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role === "admin") return { role: "admin" };
    if (payload.role === "customer" && typeof payload.sub === "string" && typeof payload.v === "number") {
      return { role: "customer", sub: payload.sub, v: payload.v };
    }
    return null;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = MAX_AGE;
