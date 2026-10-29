import "server-only";
import { notFound } from "next/navigation";
import { canAccessEvent, requireUser, type User } from "./auth";
import { getEvent } from "./event";
import { db } from "./supabase/server";
import type { EventData, EventSummary, Guest, Wish } from "./types";

// PostgREST returns at most `max_rows` (1000 by default) per request, so read in pages.
const PAGE_SIZE = 1000;

async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

/** The events `user` can see (all of them for the site owner) with guest and RSVP totals, latest date first, undated last. */
export async function listEvents(user: User): Promise<EventSummary[]> {
  let q = db().from("event_summary").select("*");
  if (user.role === "customer") q = q.eq("account_id", user.accountId);
  const { data, error } = await q.order("event_date", { ascending: false, nullsFirst: false }).order("id", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as EventSummary[];
}

export type AccountRow = { id: string; username: string; name: string; created_at: string; events: { id: number; name: string }[] };

/** Customer accounts with the events assigned to each (site owner only). */
export async function listAccounts(): Promise<AccountRow[]> {
  const [{ data: accounts, error: e1 }, { data: events, error: e2 }] = await Promise.all([
    db().from("account").select("id, username, name, created_at").order("created_at", { ascending: false }),
    db().from("event").select("id, name, account_id").not("account_id", "is", null),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
  return (accounts ?? []).map((a) => ({
    ...a,
    events: (events ?? []).filter((e) => e.account_id === a.id).map(({ id, name }) => ({ id, name })),
  }));
}

export async function listGuests(eventId: number): Promise<Guest[]> {
  // Ordering by id as well keeps pages stable when created_at values tie (bulk imports).
  return fetchAll<Guest>((from, to) =>
    db()
      .from("guest")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .order("id")
      .range(from, to),
  );
}

export async function listWishes(eventId: number): Promise<Wish[]> {
  return fetchAll<Wish>((from, to) =>
    db()
      .from("wish")
      .select("*, guest:guest_id(name)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .order("id")
      .range(from, to),
  );
}

/** Lightweight version for the dashboard, which only shows the latest few. */
export async function listRecentWishes(eventId: number, limit: number): Promise<Wish[]> {
  const { data, error } = await db()
    .from("wish")
    .select("*, guest:guest_id(name)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as Wish[];
}

/**
 * Resolves an `[eventId]` route param to its event, or renders the 404 page. A customer asking for
 * someone else's event gets the same 404, so ids of other couples' events aren't revealed.
 */
export async function requireEvent(param: string): Promise<EventData> {
  const user = await requireUser();
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) notFound();
  if (!(await canAccessEvent(user, id))) notFound();
  const event = await getEvent(id);
  if (!event) notFound();
  return event;
}

/** Just ids and names, for the event switcher. */
export async function listEventNames(user: User): Promise<{ id: number; name: string }[]> {
  let q = db().from("event").select("id, name");
  if (user.role === "customer") q = q.eq("account_id", user.accountId);
  const { data, error } = await q.order("id", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
