import "server-only";
import { db } from "./supabase/server";
import type { Guest, Wish } from "./types";

export async function listGuests(): Promise<Guest[]> {
  const { data, error } = await db().from("guest").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listWishes(): Promise<Wish[]> {
  const { data, error } = await db()
    .from("wish")
    .select("*, guest:guest_id(name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Wish[];
}
