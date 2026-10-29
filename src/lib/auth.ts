import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession, type SessionClaims } from "./session";
import { db } from "./supabase/server";

/** Who is signed in: the site owner, or a customer who may only touch their own events. */
export type User = { role: "admin"; name: string } | { role: "customer"; accountId: string; name: string; username: string };

export async function createSession(claims: SessionClaims) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSession(claims), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The signed-in user, or null. Customer sessions are checked against the database once per request. */
export const getUser = cache(async (): Promise<User | null> => {
  const claims = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!claims) return null;
  if (claims.role === "admin") return { role: "admin", name: "Admin" };
  const { data, error } = await db().from("account").select("id, name, username, token_version").eq("id", claims.sub).maybeSingle();
  if (error) throw new Error(error.message);
  // Deleted account, or password reset since this session was issued.
  if (!data || data.token_version !== claims.v) return null;
  return { role: "customer", accountId: data.id, name: data.name || data.username, username: data.username };
});

/** Call at the top of every signed-in page / server action. */
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/admin/login");
  return user;
}

/** For owner-only pages and actions: creating/deleting events and managing accounts. */
export async function requireAdmin(): Promise<User & { role: "admin" }> {
  const user = await requireUser();
  if (user.role !== "admin") notFound();
  return user;
}

/** Whether `user` may see and edit event `eventId`. */
export async function canAccessEvent(user: User, eventId: number) {
  if (user.role === "admin") return true;
  const { data, error } = await db().from("event").select("id").eq("id", eventId).eq("account_id", user.accountId).maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}
