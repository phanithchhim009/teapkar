import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "./supabase/server";
import {
  EVENT_TYPES,
  eventConfigSchema,
  invitationTextSchema,
  sectionsSchema,
  type EventData,
  type EventType,
  type Guest,
  type ScheduleDay,
  type TimelineItem,
} from "./types";

export const eventTag = (eventId: number) => `event:${eventId}`;
export const wishesTag = (eventId: number) => `wishes:${eventId}`;

// Event, agenda and approved wishes change rarely; cache them per event and bust via revalidateTag in admin actions.
// The raw row is cached and parsed per request, so schema defaults added later reach events cached before them.
export async function getEvent(eventId: number): Promise<EventData | null> {
  const row = await unstable_cache(() => fetchEventRow(eventId), ["event-row", String(eventId)], {
    tags: [eventTag(eventId)],
  })();
  return row ? toEventData(row) : null;
}
export function getAgenda(eventId: number) {
  return unstable_cache(() => fetchAgenda(eventId), ["agenda", String(eventId)], { tags: [eventTag(eventId)] })();
}
export function getApprovedWishes(eventId: number) {
  return unstable_cache(() => fetchApprovedWishes(eventId), ["approved-wishes", String(eventId)], {
    tags: [wishesTag(eventId)],
  })();
}

/** Parses a raw event row, filling in defaults for anything missing or invalid. */
export function toEventData(row: Record<string, unknown>): EventData {
  const type = EVENT_TYPES.includes(row.type as EventType) ? (row.type as EventType) : "wedding";
  return {
    id: Number(row.id),
    type,
    name: (row.name as string) ?? "",
    host_a: (row.host_a as string) ?? "",
    host_b: (row.host_b as string) ?? "",
    event_date: (row.event_date as string) ?? null,
    config: eventConfigSchema.parse(row.config ?? {}),
    text_kh: invitationTextSchema.parse(row.text_kh ?? {}),
    text_en: invitationTextSchema.parse(row.text_en ?? {}),
    sections: sectionsSchema.parse(row.sections ?? {}),
  };
}

async function fetchEventRow(eventId: number): Promise<Record<string, unknown> | null> {
  const { data, error } = await db().from("event").select("*").eq("id", eventId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function fetchAgenda(eventId: number): Promise<ScheduleDay[]> {
  const { data: days, error: e1 } = await db().from("schedule_day").select("*").eq("event_id", eventId).order("sort");
  if (e1) throw new Error(e1.message);
  if (!days?.length) return [];
  const { data: items, error: e2 } = await db()
    .from("timeline_item")
    .select("*")
    .in(
      "day_id",
      days.map((d) => d.id),
    )
    .order("sort");
  if (e2) throw new Error(e2.message);
  return days.map((d) => ({
    ...d,
    items: (items ?? []).filter((i: TimelineItem) => i.day_id === d.id),
  }));
}

export async function getGuestByCode(code: string): Promise<Guest | null> {
  const { data, error } = await db().from("guest").select("*").eq("code", code).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function fetchApprovedWishes(eventId: number, limit = 50) {
  const { data, error } = await db()
    .from("wish")
    .select("id, message, created_at, guest:guest_id(name)")
    .eq("event_id", eventId)
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((w) => ({
    id: w.id as string,
    message: w.message as string,
    created_at: w.created_at as string,
    name: (w.guest as unknown as { name: string } | null)?.name ?? "",
  }));
}

export function googleFontsHref(fonts: string[]) {
  const families = [...new Set(fonts.filter(Boolean))]
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
