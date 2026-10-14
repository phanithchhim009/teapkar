"use server";

import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { newGuestCode } from "@/lib/guest-code";
import { db, MEDIA_BUCKET } from "@/lib/supabase/server";
import {
  eventConfigSchema,
  invitationTextSchema,
  sectionsSchema,
  type ScheduleDay,
} from "@/lib/types";

/* ---------- auth ---------- */

export async function login(_: unknown, formData: FormData) {
  const expectedRaw = (process.env.ADMIN_PASSWORD ?? "").trim();
  if (!expectedRaw) {
    console.error("ADMIN_PASSWORD is not set");
    return { error: "Admin login is not configured" };
  }
  const given = Buffer.from(String(formData.get("password") ?? "").trim());
  const expected = Buffer.from(expectedRaw);
  const ok = given.length === expected.length && timingSafeEqual(given, expected);
  if (!ok) return { error: "Wrong password" };
  try {
    await createSession();
  } catch (e) {
    console.error("createSession failed:", e);
    return { error: "Server misconfigured (SESSION_SECRET)" };
  }
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------- guests ---------- */

const guestSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(40).optional().nullable(),
  group_tag: z.string().trim().max(60).optional().nullable(),
  lang: z.enum(["kh", "en"]).default("kh"),
  note: z.string().trim().max(500).optional().nullable(),
});
export type GuestInput = z.input<typeof guestSchema>;

function clean(input: GuestInput) {
  const g = guestSchema.parse(input);
  return { ...g, phone: g.phone || null, group_tag: g.group_tag || null, note: g.note || null };
}

async function insertWithCodes(rows: ReturnType<typeof clean>[]) {
  // Retry on the (very unlikely) unique-code collision.
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await db().from("guest").insert(rows.map((r) => ({ ...r, code: newGuestCode() })));
    if (!error) return;
    if (error.code !== "23505") throw new Error(error.message);
  }
  throw new Error("Could not generate unique guest codes");
}

export async function createGuest(input: GuestInput) {
  await requireAdmin();
  await insertWithCodes([clean(input)]);
  revalidatePath("/admin", "layout");
}

export async function updateGuest(id: string, input: GuestInput) {
  await requireAdmin();
  const { error } = await db().from("guest").update(clean(input)).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

export async function deleteGuests(ids: string[]) {
  await requireAdmin();
  const { error } = await db().from("guest").delete().in("id", ids);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

export async function regenerateGuestCode(id: string) {
  await requireAdmin();
  const { error } = await db().from("guest").update({ code: newGuestCode() }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

export async function bulkCreateGuests(rows: GuestInput[]) {
  await requireAdmin();
  const cleaned = rows.filter((r) => r.name?.trim()).map(clean);
  if (cleaned.length === 0) return { count: 0 };
  for (let i = 0; i < cleaned.length; i += 500) await insertWithCodes(cleaned.slice(i, i + 500));
  revalidatePath("/admin", "layout");
  return { count: cleaned.length };
}

export async function resetGuestRsvp(id: string) {
  await requireAdmin();
  const { error } = await db()
    .from("guest")
    .update({ rsvp_status: "pending", rsvp_count: 0, rsvp_at: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

/* ---------- event / customize ---------- */

const eventSchema = z.object({
  groom: z.string().max(120),
  bride: z.string().max(120),
  event_date: z.string().nullable(),
  config: eventConfigSchema,
  text_kh: invitationTextSchema,
  text_en: invitationTextSchema,
  sections: sectionsSchema,
});

export async function saveEvent(input: z.input<typeof eventSchema>) {
  await requireAdmin();
  const data = eventSchema.parse(input);
  const { error } = await db()
    .from("event")
    .upsert({ id: 1, ...data, event_date: data.event_date || null, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

/** Replaces the whole agenda with the submitted one (days + items, in order). */
export async function saveAgenda(days: Pick<ScheduleDay, "title" | "date" | "items">[]) {
  await requireAdmin();
  const supa = db();
  const { error: delErr } = await supa.from("schedule_day").delete().not("id", "is", null);
  if (delErr) throw new Error(delErr.message);
  for (const [i, day] of days.entries()) {
    const { data, error } = await supa
      .from("schedule_day")
      .insert({ title: day.title, date: day.date || null, sort: i })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const items = day.items
      .filter((it) => it.name.trim() || it.time.trim())
      .map((it, j) => ({ day_id: data.id, time: it.time, name: it.name, sort: j }));
    if (items.length) {
      const { error: itErr } = await supa.from("timeline_item").insert(items);
      if (itErr) throw new Error(itErr.message);
    }
  }
  revalidatePath("/", "layout");
}

const ALLOWED_TYPES = /^(image\/(png|jpe?g|webp|gif|avif|svg\+xml)|audio\/(mpeg|mp3|mp4|aac|ogg|wav|x-m4a))$/;
const MAX_UPLOAD = 15 * 1024 * 1024;

export async function uploadMedia(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file");
  if (!ALLOWED_TYPES.test(file.type)) throw new Error(`Unsupported file type: ${file.type}`);
  if (file.size > MAX_UPLOAD) throw new Error("File too large (max 15MB)");
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await db()
    .storage.from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return db().storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

/* ---------- wishes ---------- */

export async function setWishApproved(id: string, approved: boolean) {
  await requireAdmin();
  const { error } = await db().from("wish").update({ approved }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteWish(id: string) {
  await requireAdmin();
  const { error } = await db().from("wish").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
