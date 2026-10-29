"use server";

import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import type { ActionResult } from "@/lib/action-result";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { eventTag, wishesTag } from "@/lib/event";
import { EVENT_TYPE_INFO } from "@/lib/event-types";
import { newGuestCode } from "@/lib/guest-code";
import { db, MEDIA_BUCKET } from "@/lib/supabase/server";
import { EVENT_TYPES, eventConfigSchema, invitationTextSchema, sectionsSchema } from "@/lib/types";

/** Runs an admin action, returning failures as data so their messages reach the client in production. */
async function adminAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  await requireAdmin();
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    unstable_rethrow(e);
    console.error(e);
    if (e instanceof z.ZodError) return { ok: false, error: z.prettifyError(e) };
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong" };
  }
}

/* ---------- auth ---------- */

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 10;

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

export async function login(_: unknown, formData: FormData) {
  const expectedRaw = (process.env.ADMIN_PASSWORD ?? "").trim();
  if (!expectedRaw) {
    console.error("ADMIN_PASSWORD is not set");
    return { error: "Admin login is not configured" };
  }

  const ip = await clientIp();
  const since = new Date(Date.now() - LOGIN_WINDOW_MS).toISOString();
  const { count, error: countErr } = await db()
    .from("login_attempt")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("at", since);
  if (countErr) {
    console.error("login_attempt lookup failed:", countErr.message);
    return { error: "Server error, please try again" };
  }
  if ((count ?? 0) >= LOGIN_MAX_FAILURES) return { error: "Too many attempts. Try again in 15 minutes." };

  const given = Buffer.from(String(formData.get("password") ?? "").trim());
  const expected = Buffer.from(expectedRaw);
  const ok = given.length === expected.length && timingSafeEqual(given, expected);
  if (!ok) {
    await db().from("login_attempt").insert({ ip });
    return { error: "Wrong password" };
  }
  try {
    await createSession();
  } catch (e) {
    console.error("createSession failed:", e);
    return { error: "Server misconfigured (SESSION_SECRET)" };
  }
  // Clear this IP's failures, and prune expired rows from everyone else.
  await Promise.all([
    db().from("login_attempt").delete().eq("ip", ip),
    db().from("login_attempt").delete().lt("at", since),
  ]);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------- shared ---------- */

const idSchema = z.uuid();
const eventIdSchema = z.coerce.number().int().positive();

/** Refreshes one event's admin pages (dashboard, guests, wishes) and the events list. */
function revalidateEventAdmin(eventId: number) {
  revalidatePath(`/admin/events/${eventId}`, "layout");
  revalidatePath("/admin");
}

/* ---------- events ---------- */

const eventMetaSchema = z.object({
  type: z.enum(EVENT_TYPES),
  name: z.string().trim().min(1, "Event name is required").max(120, "Name is too long (max 120)"),
});

const newEventSchema = eventMetaSchema.extend({
  host_a: z.string().trim().max(120),
  host_b: z.string().trim().max(120).default(""),
  event_date: z.string().nullable().default(null),
  copyFromEventId: eventIdSchema.nullable().default(null),
});
export type NewEventInput = z.input<typeof newEventSchema>;

/** Creates an event from its type's starter text, or from a copy of another event's design and agenda (not guests). */
export async function createEvent(input: NewEventInput) {
  return adminAction(async () => {
    const data = newEventSchema.parse(input);
    const info = EVENT_TYPE_INFO[data.type];
    let design: Record<string, unknown> = {
      config: eventConfigSchema.parse({}),
      text_kh: invitationTextSchema.parse(info.text.kh),
      text_en: invitationTextSchema.parse(info.text.en),
      sections: sectionsSchema.parse({}),
    };
    if (data.copyFromEventId) {
      const { data: src, error } = await db()
        .from("event")
        .select("config, text_kh, text_en, sections")
        .eq("id", data.copyFromEventId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!src) throw new Error("The event to copy no longer exists");
      design = src;
    }

    const { data: row, error } = await db()
      .from("event")
      .insert({
        ...design,
        type: data.type,
        name: data.name,
        host_a: data.host_a,
        host_b: info.pair ? data.host_b : "",
        event_date: data.event_date || null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const id = row.id as number;

    if (data.copyFromEventId) {
      const { data: days, error: daysErr } = await db()
        .from("schedule_day")
        .select("title, date, items:timeline_item(time, name, sort)")
        .eq("event_id", data.copyFromEventId)
        .order("sort");
      if (daysErr) throw new Error(daysErr.message);
      const agenda = (days ?? []).map((d) => ({
        title: d.title,
        date: d.date,
        items: [...(d.items ?? [])].sort((a, b) => a.sort - b.sort).map(({ time, name }) => ({ time, name })),
      }));
      const { error: agendaErr } = await db().rpc("save_agenda", { p_event_id: id, p_days: agenda });
      if (agendaErr) {
        // Don't leave a half-copied event behind.
        await db().from("event").delete().eq("id", id);
        throw new Error(agendaErr.message);
      }
    }

    revalidatePath("/admin");
    return { id };
  });
}

/** Deletes an event with its agenda, guests and wishes (on delete cascade). Its guest links stop working. */
export async function deleteEvent(eventId: number) {
  return adminAction(async () => {
    const ev = eventIdSchema.parse(eventId);
    const { error } = await db().from("event").delete().eq("id", ev);
    if (error) throw new Error(error.message);
    revalidateTag(eventTag(ev));
    revalidateTag(wishesTag(ev));
    revalidatePath("/", "layout");
  });
}

/* ---------- guests ---------- */

// Guest and wish mutations also filter on event_id, so a stale tab can't change another event's rows.

const guestSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long (max 120)"),
  phone: z.string().trim().max(40, "Phone is too long (max 40)").optional().nullable(),
  group_tag: z.string().trim().max(60, "Group is too long (max 60)").optional().nullable(),
  lang: z.enum(["kh", "en"]).default("kh"),
  note: z.string().trim().max(500, "Note is too long (max 500)").optional().nullable(),
});
export type GuestInput = z.input<typeof guestSchema>;

const MAX_BULK = 5000;

function clean(input: GuestInput) {
  const g = guestSchema.parse(input);
  return { ...g, phone: g.phone || null, group_tag: g.group_tag || null, note: g.note || null };
}

async function insertWithCodes(eventId: number, rows: ReturnType<typeof clean>[]) {
  // One statement, so a bulk import either fully succeeds or adds nothing.
  // Retry on the (very unlikely) unique-code collision.
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await db()
      .from("guest")
      .insert(rows.map((r) => ({ ...r, event_id: eventId, code: newGuestCode() })));
    if (!error) return;
    if (error.code === "23503") throw new Error("This event no longer exists");
    if (error.code !== "23505") throw new Error(error.message);
  }
  throw new Error("Could not generate unique guest codes");
}

export async function createGuest(eventId: number, input: GuestInput) {
  return adminAction(async () => {
    const ev = eventIdSchema.parse(eventId);
    await insertWithCodes(ev, [clean(input)]);
    revalidateEventAdmin(ev);
  });
}

export async function updateGuest(eventId: number, id: string, input: GuestInput) {
  return adminAction(async () => {
    const ev = eventIdSchema.parse(eventId);
    const { error } = await db().from("guest").update(clean(input)).eq("id", idSchema.parse(id)).eq("event_id", ev);
    if (error) throw new Error(error.message);
    revalidateEventAdmin(ev);
  });
}

export async function deleteGuests(eventId: number, ids: string[]) {
  return adminAction(async () => {
    const ev = eventIdSchema.parse(eventId);
    const { error } = await db().from("guest").delete().in("id", z.array(idSchema).parse(ids)).eq("event_id", ev);
    if (error) throw new Error(error.message);
    // Their wishes are deleted with them.
    revalidateTag(wishesTag(ev));
    revalidateEventAdmin(ev);
  });
}

export async function regenerateGuestCode(eventId: number, id: string) {
  return adminAction(async () => {
    const ev = eventIdSchema.parse(eventId);
    const { error } = await db()
      .from("guest")
      .update({ code: newGuestCode() })
      .eq("id", idSchema.parse(id))
      .eq("event_id", ev);
    if (error) throw new Error(error.message);
    revalidateEventAdmin(ev);
  });
}

export async function bulkCreateGuests(eventId: number, rows: GuestInput[]) {
  return adminAction(async () => {
    const ev = eventIdSchema.parse(eventId);
    if (rows.length > MAX_BULK) throw new Error(`Too many rows (max ${MAX_BULK} per import)`);
    // Validate everything first and report every bad row, rather than failing on the first one.
    const problems: string[] = [];
    const cleaned: ReturnType<typeof clean>[] = [];
    rows.forEach((row, i) => {
      if (!row.name?.trim()) return;
      const parsed = guestSchema.safeParse(row);
      if (parsed.success) cleaned.push(clean(row));
      else problems.push(`Row ${i + 1}: ${parsed.error.issues.map((issue) => issue.message).join(", ")}`);
    });
    if (problems.length) {
      const more = problems.length > 5 ? ` (and ${problems.length - 5} more)` : "";
      throw new Error(`Nothing was added. ${problems.slice(0, 5).join("; ")}${more}`);
    }
    if (cleaned.length) await insertWithCodes(ev, cleaned);
    revalidateEventAdmin(ev);
    return { count: cleaned.length };
  });
}

export async function resetGuestRsvp(eventId: number, id: string) {
  return adminAction(async () => {
    const ev = eventIdSchema.parse(eventId);
    const { error } = await db()
      .from("guest")
      .update({ rsvp_status: "pending", rsvp_count: 0, rsvp_at: null })
      .eq("id", idSchema.parse(id))
      .eq("event_id", ev);
    if (error) throw new Error(error.message);
    revalidateEventAdmin(ev);
  });
}

/* ---------- event / customize ---------- */

const eventSchema = eventMetaSchema.extend({
  host_a: z.string().max(120),
  host_b: z.string().max(120),
  event_date: z.string().nullable(),
  config: eventConfigSchema,
  text_kh: invitationTextSchema,
  text_en: invitationTextSchema,
  sections: sectionsSchema,
});

export async function saveEvent(eventId: number, input: z.input<typeof eventSchema>) {
  return adminAction(async () => {
    const ev = eventIdSchema.parse(eventId);
    const data = eventSchema.parse(input);
    const { error, count } = await db()
      .from("event")
      .update(
        { ...data, event_date: data.event_date || null, updated_at: new Date().toISOString() },
        { count: "exact" },
      )
      .eq("id", ev);
    if (error) throw new Error(error.message);
    if (!count) throw new Error("This event no longer exists");
    revalidateTag(eventTag(ev));
    revalidatePath("/", "layout");
  });
}

const agendaSchema = z
  .array(
    z.object({
      title: z.string().max(200),
      date: z.iso.date().nullable().or(z.literal("").transform(() => null)),
      items: z.array(z.object({ time: z.string().max(60), name: z.string().max(300) })).max(100),
    }),
  )
  .max(20);
export type AgendaInput = z.input<typeof agendaSchema>;

/** Replaces the event's whole agenda with the submitted one (days + items, in order), in one transaction. */
export async function saveAgenda(eventId: number, input: AgendaInput) {
  return adminAction(async () => {
    const ev = eventIdSchema.parse(eventId);
    const days = agendaSchema.parse(input).map((d) => ({
      ...d,
      items: d.items.filter((it) => it.name.trim() || it.time.trim()),
    }));
    const { error } = await db().rpc("save_agenda", { p_event_id: ev, p_days: days });
    if (error) throw new Error(error.message);
    revalidateTag(eventTag(ev));
    revalidatePath("/", "layout");
  });
}

// Keep in sync with allowed_mime_types and file_size_limit on the media bucket (supabase/migrations/0005_story_video.sql).
// SVG is deliberately excluded: it can carry script and the bucket is public.
const ALLOWED_TYPES = /^(image\/(png|jpe?g|webp|gif|avif)|audio\/(mpeg|mp3|mp4|aac|ogg|wav|x-m4a)|video\/(mp4|webm|quicktime))$/;
const MAX_UPLOAD = 15 * 1024 * 1024;
const MAX_VIDEO_UPLOAD = 50 * 1024 * 1024;

/**
 * Returns a one-time URL the browser uploads the file to directly. Uploading through a server action
 * would hit Vercel's 4.5 MB request body limit.
 */
export async function createUpload(file: { name: string; type: string; size: number }) {
  return adminAction(async () => {
    if (!ALLOWED_TYPES.test(file.type)) throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
    const isVideo = file.type.startsWith("video/");
    if (file.size > (isVideo ? MAX_VIDEO_UPLOAD : MAX_UPLOAD)) throw new Error(`File too large (max ${isVideo ? 50 : 15}MB)`);
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bucket = db().storage.from(MEDIA_BUCKET);
    const { data, error } = await bucket.createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return { uploadUrl: data.signedUrl, publicUrl: bucket.getPublicUrl(path).data.publicUrl };
  });
}

/* ---------- wishes ---------- */

export async function setWishApproved(eventId: number, id: string, approved: boolean) {
  return adminAction(async () => {
    const ev = eventIdSchema.parse(eventId);
    const { error } = await db().from("wish").update({ approved }).eq("id", idSchema.parse(id)).eq("event_id", ev);
    if (error) throw new Error(error.message);
    revalidateTag(wishesTag(ev));
    revalidatePath("/", "layout");
  });
}

export async function deleteWish(eventId: number, id: string) {
  return adminAction(async () => {
    const ev = eventIdSchema.parse(eventId);
    const { error } = await db().from("wish").delete().eq("id", idSchema.parse(id)).eq("event_id", ev);
    if (error) throw new Error(error.message);
    revalidateTag(wishesTag(ev));
    revalidatePath("/", "layout");
  });
}
