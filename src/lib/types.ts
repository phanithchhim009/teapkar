import { z } from "zod";

export const THEMES = ["classic", "angkor", "bloom"] as const;
export type Theme = (typeof THEMES)[number];

// Keep in sync with the event.type check (supabase/migrations/0004_multi_event.sql).
export const EVENT_TYPES = ["wedding", "engagement", "birthday", "housewarming", "other"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

type ThemePreset = { primaryColor: string; textColor: string; guestNameColor: string; fontEn: string; fontKh?: string; fontBodyKh?: string };

/** Colours and fonts applied when a theme is picked in the admin; they stay editable afterwards. */
export const THEME_PRESETS: Record<Theme, ThemePreset> = {
  classic: { primaryColor: "#f9af59", textColor: "#B08E4F", guestNameColor: "#364153", fontEn: "Great Vibes" },
  // Aged gilding, carved sandstone shadow and laterite brown, as at Angkor Wat at sunrise.
  angkor: { primaryColor: "#b7862f", textColor: "#6b4a2b", guestNameColor: "#4a2c17", fontEn: "Cormorant Garamond" },
  // Watercolor florals with gold lettering and a deep leaf green.
  bloom: {
    primaryColor: "#43652F",
    textColor: "#43652F",
    guestNameColor: "#b8860b",
    fontEn: "Cormorant Garamond",
    fontKh: "Moul",
    fontBodyKh: "Noto Sans Khmer",
  },
};

/** Options only the "bloom" theme reads. Empty media strings mean "use the built-in artwork". */
export const bloomConfigSchema = z.object({
  goldFrom: z.string().default("#facc15"),
  goldVia: z.string().default("#fde047"),
  goldTo: z.string().default("#ca8a04"),
  green: z.string().default("#43652F"),
  sage: z.string().default("#A5AE79"),
  frameImage: z.string().default(""),
  frameVideo: z.string().default(""),
  introFlowerTop: z.string().default(""),
  introFlowerBottom: z.string().default(""),
  introVideo: z.string().default(""),
  monogram: z.string().default(""),
  heroPhoto: z.string().default(""),
  intro: z.boolean().catch(true).default(true),
  introDuration: z.coerce.number().min(3).max(12).catch(7).default(7),
  skipButton: z.boolean().catch(true).default(true),
  revealMode: z.enum(["replay", "once"]).catch("replay").default("replay"),
  intensity: z.enum(["normal", "subtle"]).catch("normal").default("normal"),
});
export type BloomConfig = z.infer<typeof bloomConfigSchema>;

export const eventConfigSchema = z.object({
  // Unknown values (e.g. a theme removed later) fall back to classic instead of breaking the page.
  theme: z.enum(THEMES).catch("classic").default("classic"),
  primaryColor: z.string().default("#f9af59"),
  textColor: z.string().default("#B08E4F"),
  guestNameColor: z.string().default("#364153"),
  fontKh: z.string().default("Moul"),
  fontBodyKh: z.string().default("Battambang"),
  fontEn: z.string().default("Great Vibes"),
  fontSize: z.coerce.number().default(16),
  borderRadius: z.coerce.number().default(8),
  coverBackground: z.string().default(""),
  mainBackground: z.string().default(""),
  detailsBackground: z.string().default(""),
  music: z.string().default(""),
  mapUrl: z.string().default(""),
  mapImage: z.string().default(""),
  qrUsd: z.string().default(""),
  qrKhr: z.string().default(""),
  bankName: z.string().default(""),
  accountName: z.string().default(""),
  accountNumber: z.string().default(""),
  gallery: z.array(z.string()).default([]),
  bloom: bloomConfigSchema.catch(() => bloomConfigSchema.parse({})).default(() => bloomConfigSchema.parse({})),
});
export type EventConfig = z.infer<typeof eventConfigSchema>;

export const invitationTextSchema = z.object({
  main_title: z.string().default(""),
  subtitle: z.string().default(""),
  invitation_title: z.string().default(""),
  invitation_message: z.string().default(""),
  date_time: z.string().default(""),
  location: z.string().default(""),
  details_title: z.string().default(""),
  gratitude_title: z.string().default(""),
  gratitude_message: z.string().default(""),
});
export type InvitationText = z.infer<typeof invitationTextSchema>;
export const TEXT_FIELDS = Object.keys(invitationTextSchema.shape) as (keyof InvitationText)[];

export const sectionsSchema = z.object({
  countdown: z.boolean().default(true),
  agenda: z.boolean().default(true),
  gallery: z.boolean().default(true),
  map: z.boolean().default(true),
  rsvp: z.boolean().default(true),
  wishes: z.boolean().default(true),
  gift: z.boolean().default(true),
});
export type Sections = z.infer<typeof sectionsSchema>;
export const SECTION_KEYS = Object.keys(sectionsSchema.shape) as (keyof Sections)[];

export type EventData = {
  id: number;
  type: EventType;
  name: string;
  /** The first (or only) host; for weddings, the groom. */
  host_a: string;
  /** The second host for paired types (the bride); blank otherwise. */
  host_b: string;
  event_date: string | null;
  config: EventConfig;
  text_kh: InvitationText;
  text_en: InvitationText;
  sections: Sections;
};

export type EventSummary = {
  id: number;
  name: string;
  type: EventType;
  host_a: string;
  host_b: string;
  event_date: string | null;
  created_at: string;
  guests: number;
  opened: number;
  rsvp_yes: number;
  rsvp_no: number;
  attending: number;
};

export type TimelineItem = { id: string; day_id: string; time: string; name: string; sort: number };
export type ScheduleDay = { id: string; title: string; date: string | null; sort: number; items: TimelineItem[] };

export type Guest = {
  id: string;
  event_id: number;
  code: string;
  name: string;
  phone: string | null;
  group_tag: string | null;
  lang: "kh" | "en";
  note: string | null;
  opened_at: string | null;
  open_count: number;
  rsvp_status: "pending" | "yes" | "no";
  rsvp_count: number;
  rsvp_at: string | null;
  created_at: string;
};

export type Wish = {
  id: string;
  event_id: number;
  guest_id: string;
  message: string;
  approved: boolean;
  created_at: string;
  guest?: { name: string } | null;
};

export const KH_FONTS = ["Moul", "Moulpali", "Battambang", "Kantumruy Pro", "Dangrek", "Fasthand", "Noto Sans Khmer", "Bayon", "Koulen"];
export const EN_FONTS = ["Great Vibes", "Dancing Script", "Pacifico", "Norican", "Ovo", "Montserrat", "Playfair Display", "Cormorant Garamond"];
