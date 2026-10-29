import "server-only";
import { notFound } from "next/navigation";
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

/** Every event with its guest and RSVP totals, latest date first and undated last. */
export async function listEvents(): Promise<EventSummary[]> {
  const { data, error } = await db()
    .from("event_summary")
    .select("*")
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as EventSummary[];
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

/** Resolves an `[eventId]` route param to its event, or renders the 404 page. */
export async function requireEvent(param: string): Promise<EventData> {
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const event = await getEvent(id);
  if (!event) notFound();
  return event;
}

/** Just ids and names, for the event switcher. */
export async function listEventNames(): Promise<{ id: number; name: string }[]> {
  const { data, error } = await db().from("event").select("id, name").order("id", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
