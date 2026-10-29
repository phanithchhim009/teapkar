import { z } from "zod";

/** One chapter of the couple's story ("2015 · High school"), shown as a timeline. */
export const storyItemSchema = z.object({
  id: z.string().max(40).default(""),
  date: z.string().max(80).default(""),
  photo: z.string().default(""),
  title_kh: z.string().max(200).default(""),
  title_en: z.string().max(200).default(""),
  text_kh: z.string().max(2000).default(""),
  text_en: z.string().max(2000).default(""),
});
export type StoryItem = z.infer<typeof storyItemSchema>;

/** An uploaded video file or a YouTube link, with an optional poster image. */
export const videoSchema = z.object({
  id: z.string().max(40).default(""),
  src: z.string().default(""),
  poster: z.string().default(""),
});
export type Video = z.infer<typeof videoSchema>;

export const THEMES = ["classic", "angkor", "bloom", "lotus", "garden"] as const;
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
  // Olive envelope with a gold lotus wax seal; cream, olive and night sections with gold lettering.
  lotus: {
    primaryColor: "#c9a45a",
    textColor: "#4b5230",
    guestNameColor: "#e3c47c",
    fontEn: "Cormorant Garamond",
    fontKh: "Moul",
    fontBodyKh: "Battambang",
  },
  // White damask envelope, silk curtains and a garden of white blossoms, lettered in deep green.
  garden: {
    primaryColor: "#2f5a46",
    textColor: "#2f4d3f",
    guestNameColor: "#2f5a46",
    fontEn: "Cormorant Garamond",
    fontKh: "Moulpali",
    fontBodyKh: "Battambang",
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

/** Per-language text only the "lotus" theme shows. Empty strings hide the block. */
export const lotusTextSchema = z.object({
  parentsA: z.string().default(""),
  parentsB: z.string().default(""),
  closing: z.string().default(""),
  apology: z.string().default(""),
});
export type LotusText = z.infer<typeof lotusTextSchema>;
const emptyLotusText = () => lotusTextSchema.parse({});

export const lotusStorySchema = z.object({ src: z.string(), kh: z.string().default(""), en: z.string().default("") });
export type LotusStory = z.infer<typeof lotusStorySchema>;

/** Options only the "lotus" theme reads. Empty photos fall back to the main background and gallery. */
export const lotusConfigSchema = z.object({
  olive: z.string().default("#5b6339"),
  night: z.string().default("#23251b"),
  cream: z.string().default("#f4ecd8"),
  gold: z.string().default("#d9b768"),
  goldLight: z.string().default("#f7e6ad"),
  goldDeep: z.string().default("#a27a2c"),
  heroPhoto: z.string().default(""),
  archPhoto: z.string().default(""),
  couplePhoto: z.string().default(""),
  waterPhoto: z.string().default(""),
  monogram: z.string().default(""),
  /** The hosts' names in the other script (e.g. romanised), shown in script under the Khmer names. */
  altHostA: z.string().default(""),
  altHostB: z.string().default(""),
  story: z.array(lotusStorySchema).catch([]).default([]),
  water: z.boolean().catch(true).default(true),
  /** A Google Maps embed link, or the whole <iframe> snippet from Share → Embed a map. */
  mapEmbed: z.string().default(""),
  kh: lotusTextSchema.catch(emptyLotusText).default(emptyLotusText),
  en: lotusTextSchema.catch(emptyLotusText).default(emptyLotusText),
});
export type LotusConfig = z.infer<typeof lotusConfigSchema>;

/** Per-language text only the "garden" theme shows. Empty strings hide the block. */
export const gardenTextSchema = z.object({
  closing: z.string().default(""),
});
export type GardenText = z.infer<typeof gardenTextSchema>;
const emptyGardenText = () => gardenTextSchema.parse({});

/** Options only the "garden" theme reads. Empty artwork strings mean "use the built-in drawing". */
export const gardenConfigSchema = z.object({
  green: z.string().default("#2f5a46"),
  leaf: z.string().default("#7f9c74"),
  ivory: z.string().default("#fbfaf6"),
  /** Transparent PNG used on the wax seal, the hero and the footer. Empty: script initials. */
  monogram: z.string().default(""),
  /** Replaces the drawn silk curtains on the hero (an image of a draped backdrop). */
  curtainImage: z.string().default(""),
  /** Transparent PNG of flowers along the bottom of the hero. */
  flowerImage: z.string().default(""),
  /** Transparent PNG hung across the top of the screen while scrolling (greenery, chandelier). */
  garlandImage: z.string().default(""),
  /** The hosts' names in the other script (e.g. romanised), written in script on the hero. */
  altHostA: z.string().default(""),
  altHostB: z.string().default(""),
  leaves: z.boolean().catch(true).default(true),
  chandelier: z.boolean().catch(true).default(true),
  /** A Google Maps embed link, or the whole <iframe> snippet from Share → Embed a map. */
  mapEmbed: z.string().default(""),
  kh: gardenTextSchema.catch(emptyGardenText).default(emptyGardenText),
  en: gardenTextSchema.catch(emptyGardenText).default(emptyGardenText),
});
export type GardenConfig = z.infer<typeof gardenConfigSchema>;

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
  story: z.array(storyItemSchema).max(30).catch([]).default([]),
  videos: z.array(videoSchema).max(10).catch([]).default([]),
  bloom: bloomConfigSchema.catch(() => bloomConfigSchema.parse({})).default(() => bloomConfigSchema.parse({})),
  lotus: lotusConfigSchema.catch(() => lotusConfigSchema.parse({})).default(() => lotusConfigSchema.parse({})),
  garden: gardenConfigSchema.catch(() => gardenConfigSchema.parse({})).default(() => gardenConfigSchema.parse({})),
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
  /** Wedding only: the groom's (a) and the bride's (b) parents, shown on every theme. */
  father_a: z.string().default(""),
  mother_a: z.string().default(""),
  father_b: z.string().default(""),
  mother_b: z.string().default(""),
});
export type InvitationText = z.infer<typeof invitationTextSchema>;
export const PARENT_FIELDS = ["father_a", "mother_a", "father_b", "mother_b"] as const satisfies readonly (keyof InvitationText)[];
export type ParentField = (typeof PARENT_FIELDS)[number];
/** The general text fields; the parents have their own block in the admin. */
export const TEXT_FIELDS = (Object.keys(invitationTextSchema.shape) as (keyof InvitationText)[]).filter(
  (k): k is Exclude<keyof InvitationText, ParentField> => !(PARENT_FIELDS as readonly string[]).includes(k),
);

export const sectionsSchema = z.object({
  countdown: z.boolean().default(true),
  agenda: z.boolean().default(true),
  story: z.boolean().default(true),
  video: z.boolean().default(true),
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
