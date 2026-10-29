"use client";

import { ExternalLink, RotateCw, Smartphone } from "lucide-react";
import { useState, useTransition } from "react";
import { saveEvent } from "@/app/actions/admin";
import { unwrap } from "@/lib/action-result";
import { EVENT_TYPE_INFO } from "@/lib/event-types";
import {
  EN_FONTS,
  EVENT_TYPES,
  KH_FONTS,
  SECTION_KEYS,
  TEXT_FIELDS,
  LOTUS_PALETTES,
  THEME_PRESETS,
  type Theme,
  type BloomConfig,
  type LotusConfig,
  type LotusText,
  type GardenConfig,
  type EventConfig,
  type EventType,
  type EventData,
  type InvitationText,
  type ParentField,
  PARENT_FIELDS,
  type ScheduleDay,
} from "@/lib/types";
import { AgendaEditor } from "./AgendaEditor";
import { GalleryEditor, MediaUpload } from "./MediaUpload";
import { PreviewThumb } from "./PreviewThumb";
import { StoryEditor } from "./StoryEditor";
import { Button, Card, Field, Input, Select, Textarea, cx } from "./ui";
import { VideoEditor } from "./VideoEditor";

const TABS = ["Event & Date", "Text", "Agenda", "Story", "Video", "Theme", "Media", "Gift", "Sections"] as const;
type Tab = (typeof TABS)[number];

const TEXT_LABELS: Record<(typeof TEXT_FIELDS)[number], string> = {
  main_title: "Main title",
  subtitle: "Greeting before guest name",
  invitation_title: "Invitation title",
  invitation_message: "Invitation message",
  date_time: "Date & time (display text)",
  lunar_date: "Lunar date (optional)",
  location: "Location (display text)",
  details_title: "Agenda title",
  gratitude_title: "Gratitude title",
  gratitude_message: "Gratitude message",
};
const LONG_TEXT = new Set<keyof InvitationText>(["invitation_message", "gratitude_message", "location"]);
const LUNAR_HINT = "Shown under the date. Copy it from a Khmer calendar; leave empty to hide it.";

const SECTION_LABELS: Record<(typeof SECTION_KEYS)[number], string> = {
  countdown: "Countdown timer",
  agenda: "Agenda",
  story: "Our love story",
  video: "Pre-wedding video",
  gallery: "Photo gallery",
  map: "Location / map",
  rsvp: "RSVP",
  wishes: "Wishes",
  gift: "Gift (KHQR)",
};

// The event time is entered in Cambodia time (UTC+7, no DST), matching how the dashboard shows it.
// Using a fixed offset rather than the browser's timezone also keeps the server render and hydration identical.
const EVENT_TZ_OFFSET = "+07:00";
const EVENT_TZ_OFFSET_MS = 7 * 60 * 60 * 1000;

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  return new Date(new Date(iso).getTime() + EVENT_TZ_OFFSET_MS).toISOString().slice(0, 16);
}

function fromLocalInput(value: string) {
  return value ? new Date(`${value}:00${EVENT_TZ_OFFSET}`).toISOString() : null;
}

const THEME_OPTIONS: { id: Theme; name: string; desc: string }[] = [
  { id: "classic", name: "Classic", desc: "Warm cream and amber with floating petals" },
  { id: "royal", name: "Royal red & gold", desc: "Traditional Khmer wedding maroon and gold on ivory" },
  { id: "angkor", name: "Angkor temple", desc: "Sandstone and gold: Angkor Wat skyline, naga arch, lotus and kbach ornament" },
  { id: "bloom", name: "Bloom", desc: "Watercolor florals and gold lettering, with an animated arch intro and scroll reveals" },
  { id: "lotus", name: "Lotus envelope", desc: "Olive envelope with a gold lotus seal that opens; gold on cream, olive and night, love story, candles" },
  { id: "garden", name: "White garden", desc: "White damask envelope and pearl seal; silk curtains part over white blossoms, hanging ivy and a chandelier" },
];

/** The four wedding parents, laid out as two columns (groom's side, bride's side) like on the invitation. */
const PARENT_LABELS: [ParentField, string, string][] = [
  ["father_a", "Groom's father", "លោក ហោ លាងឈុន"],
  ["father_b", "Bride's father", "លោក ស៊ុន ឆៃធីនី"],
  ["mother_a", "Groom's mother", "លោកស្រី ហ៊ា ចាន់ថាវី"],
  ["mother_b", "Bride's mother", "លោកស្រី សំអុល សុខុល"],
];

/**
 * Lotus used to keep the parents in two free-text boxes ("father\nmother"). If an event still has
 * those and the shared fields are empty, split them into the shared fields so they can be edited.
 */
function withLegacyParents(e: EventData): EventData {
  if (e.type !== "wedding") return e;
  const fill = (text: InvitationText, old: LotusText): InvitationText => {
    if (PARENT_FIELDS.some((k) => text[k].trim()) || !(old.parentsA.trim() || old.parentsB.trim())) return text;
    const split = (s: string) => {
      const [father = "", ...rest] = s.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
      return [father, rest.join(" ")];
    };
    const [fa, ma] = split(old.parentsA);
    const [fb, mb] = split(old.parentsB);
    return { ...text, father_a: fa, mother_a: ma, father_b: fb, mother_b: mb };
  };
  return { ...e, text_kh: fill(e.text_kh, e.config.lotus.kh), text_en: fill(e.text_en, e.config.lotus.en) };
}

// The parents moved to the shared fields above; Lotus keeps only its own extras.
const LOTUS_TEXT_LABELS: Record<Exclude<keyof LotusText, "parentsA" | "parentsB">, [string, string]> = {
  closing: ["Closing line", "Shown under the names, e.g. ដោយមេត្រីភាព។ សូមអរគុណ!"],
  apology: ["Letter of apology", "Shown as a second card next to the thank-you letter. Leave empty to hide."],
};

export function CustomizeEditor({ initial, agenda }: { initial: EventData; agenda: ScheduleDay[] }) {
  const [tab, setTab] = useState<Tab>("Event & Date");
  const [data, setData] = useState(() => withLegacyParents(initial));
  const [lang, setLang] = useState<"kh" | "en">("kh");
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  const [pending, start] = useTransition();

  const patch = (p: Partial<EventData>) => {
    setData((d) => ({ ...d, ...p }));
    setDirty(true);
    setMsg("");
  };
  const cfg = <K extends keyof EventConfig>(k: K, v: EventConfig[K]) => patch({ config: { ...data.config, [k]: v } });
  const bcfg = <K extends keyof BloomConfig>(k: K, v: BloomConfig[K]) => cfg("bloom", { ...data.config.bloom, [k]: v });
  const bloom = data.config.theme === "bloom";
  const lotus = data.config.theme === "lotus";
  const lcfg = <K extends keyof LotusConfig>(k: K, v: LotusConfig[K]) => cfg("lotus", { ...data.config.lotus, [k]: v });
  const garden = data.config.theme === "garden";
  const gcfg = <K extends keyof GardenConfig>(k: K, v: GardenConfig[K]) => cfg("garden", { ...data.config.garden, [k]: v });
  const typeInfo = EVENT_TYPE_INFO[data.type];
  // Picking a style also applies its colours/script font; they can still be fine-tuned below.
  const pickTheme = (theme: Theme) => patch({ config: { ...data.config, theme, ...THEME_PRESETS[theme] } });
  const txtKey = lang === "kh" ? "text_kh" : "text_en";
  const setText = (k: keyof InvitationText, v: string) => patch({ [txtKey]: { ...data[txtKey], [k]: v } });

  const save = () =>
    start(async () => {
      try {
        unwrap(await saveEvent(data.id, data));
        setDirty(false);
        setMsg("Saved ✓");
        setPreviewKey((k) => k + 1);
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Save failed");
      }
    });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Customize invitation</h2>
          {tab !== "Agenda" && (
            <div className="flex items-center gap-3">
              {msg && <span className="text-sm text-neutral-500">{msg}</span>}
              <Button onClick={save} disabled={!dirty} loading={pending}>
                {pending ? "Saving…" : dirty ? "Save changes" : "Saved"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-neutral-200">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cx(
                "shrink-0 border-b-2 px-3 py-2 text-sm",
                tab === t ? "border-rose-600 font-medium text-rose-700" : "border-transparent text-neutral-500 hover:text-neutral-800",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Event & Date" && (
          <Card className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Event name" hint="Only shown in the admin.">
                <Input value={data.name} onChange={(e) => patch({ name: e.target.value })} />
              </Field>
              <Field label="Event type" hint="Changes the host fields, link-preview title and a few guest-page labels.">
                <Select value={data.type} onChange={(e) => patch({ type: e.target.value as EventType })}>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {EVENT_TYPE_INFO[t].label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`${typeInfo.hostLabels[0]} name`}>
                <Input value={data.host_a} onChange={(e) => patch({ host_a: e.target.value })} />
              </Field>
              {typeInfo.pair && (
                <Field label={`${typeInfo.hostLabels[1]} name`}>
                  <Input value={data.host_b} onChange={(e) => patch({ host_b: e.target.value })} />
                </Field>
              )}
            </div>
            <Field label="Event date & time (Cambodia time)" hint="Used for the countdown. The displayed date text is edited in the Text tab.">
              <Input
                type="datetime-local"
                value={toLocalInput(data.event_date)}
                onChange={(e) => patch({ event_date: fromLocalInput(e.target.value) })}
              />
            </Field>
          </Card>
        )}

        {tab === "Text" && (
          <Card className="space-y-4">
            <div className="inline-flex rounded-lg bg-neutral-100 p-1">
              {(["kh", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cx("rounded-md px-4 py-1.5 text-sm", lang === l ? "bg-white font-medium shadow-sm" : "text-neutral-500")}
                >
                  {l === "kh" ? "ខ្មែរ" : "English"}
                </button>
              ))}
            </div>
            {TEXT_FIELDS.map((k) => (
              <Field key={`${lang}-${k}`} label={TEXT_LABELS[k]} hint={k === "lunar_date" ? LUNAR_HINT : undefined}>
                {LONG_TEXT.has(k) ? (
                  <Textarea rows={k === "location" ? 2 : 5} value={data[txtKey][k]} onChange={(e) => setText(k, e.target.value)} />
                ) : (
                  <Input
                    value={data[txtKey][k]}
                    onChange={(e) => setText(k, e.target.value)}
                    placeholder={k === "lunar_date" && lang === "kh" ? "ថ្ងៃអាទិត្យ ១កើត ខែមិគសិរ ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០" : undefined}
                  />
                )}
              </Field>
            ))}
            {data.type === "wedding" && (
              <div className="space-y-4 border-t border-neutral-100 pt-4">
                <div>
                  <h3 className="text-sm font-semibold">Parents ({lang === "kh" ? "ខ្មែរ" : "English"})</h3>
                  <p className="text-xs text-neutral-500">
                    Shown on every theme with the invitation message, groom&apos;s side on the left and bride&apos;s on the right. Leave a name empty to hide it.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {PARENT_LABELS.map(([k, label, ph]) => (
                    <Field key={`${lang}-${k}`} label={label}>
                      <Input value={data[txtKey][k]} onChange={(e) => setText(k, e.target.value)} placeholder={lang === "kh" ? ph : ""} />
                    </Field>
                  ))}
                </div>
              </div>
            )}
            {lotus && (
              <div className="space-y-4 border-t border-neutral-100 pt-4">
                <h3 className="text-sm font-semibold">Lotus text ({lang === "kh" ? "ខ្មែរ" : "English"})</h3>
                {(Object.keys(LOTUS_TEXT_LABELS) as (keyof typeof LOTUS_TEXT_LABELS)[]).map((k) => (
                  <Field key={`${lang}-lotus-${k}`} label={LOTUS_TEXT_LABELS[k][0]} hint={LOTUS_TEXT_LABELS[k][1]}>
                    <Textarea
                      rows={k === "apology" ? 5 : 2}
                      value={data.config.lotus[lang][k]}
                      onChange={(e) => lcfg(lang, { ...data.config.lotus[lang], [k]: e.target.value })}
                    />
                  </Field>
                ))}
              </div>
            )}
            {garden && (
              <div className="space-y-4 border-t border-neutral-100 pt-4">
                <h3 className="text-sm font-semibold">White garden text ({lang === "kh" ? "ខ្មែរ" : "English"})</h3>
                <Field label="Closing line" hint="Shown under the date and place, e.g. ដោយមេត្រីភាព។ សូមអរគុណ!">
                  <Textarea rows={2} value={data.config.garden[lang].closing} onChange={(e) => gcfg(lang, { ...data.config.garden[lang], closing: e.target.value })} />
                </Field>
              </div>
            )}
          </Card>
        )}

        {tab === "Agenda" && <AgendaEditor eventId={data.id} initial={agenda} onSaved={() => setPreviewKey((k) => k + 1)} />}

        {tab === "Story" && lotus && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Lotus shows its own photo story (Media tab) when you&apos;ve added one; otherwise it shows this timeline.
          </p>
        )}

        {tab === "Story" && <StoryEditor value={data.config.story} onChange={(v) => cfg("story", v)} />}

        {tab === "Video" && <VideoEditor value={data.config.videos} onChange={(v) => cfg("videos", v)} />}

        {tab === "Theme" && (
          <Card className="space-y-5">
            {/* Not a <Field>: that is a <label>, which would forward stray clicks to the first button. */}
            <div className="space-y-1.5" role="group" aria-label="Style">
              <span className="text-sm font-medium text-neutral-700">Style</span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {THEME_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={data.config.theme === o.id}
                    onClick={() => pickTheme(o.id)}
                    className={cx(
                      "flex flex-col gap-2 rounded-xl border p-2 text-left transition",
                      data.config.theme === o.id ? "border-rose-600 ring-2 ring-rose-200" : "border-neutral-200 hover:border-neutral-400",
                    )}
                  >
                    <PreviewThumb key={previewKey} eventId={data.id} theme={o.id} className="mx-auto" />
                    <span className="px-1 pb-1">
                      <span className="block text-sm font-medium">{o.name}</span>
                      <span className="block text-xs text-neutral-500">{o.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
              <span className="block text-xs text-neutral-500">
                Choosing a style also sets matching colours and English font. You can adjust them afterwards. Previews show your saved content.
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <ColorField label="Primary color" value={data.config.primaryColor} onChange={(v) => cfg("primaryColor", v)} />
              <ColorField label="Text color" value={data.config.textColor} onChange={(v) => cfg("textColor", v)} />
              <ColorField label="Guest name color" value={data.config.guestNameColor} onChange={(v) => cfg("guestNameColor", v)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <FontSelect label="Khmer title font" fonts={KH_FONTS} value={data.config.fontKh} onChange={(v) => cfg("fontKh", v)} />
              <FontSelect label="Khmer body font" fonts={KH_FONTS} value={data.config.fontBodyKh} onChange={(v) => cfg("fontBodyKh", v)} />
              <FontSelect label="English / script font" fonts={EN_FONTS} value={data.config.fontEn} onChange={(v) => cfg("fontEn", v)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`Base font size: ${data.config.fontSize}px`}>
                <input type="range" min={12} max={22} value={data.config.fontSize} onChange={(e) => cfg("fontSize", Number(e.target.value))} className="w-full accent-rose-600" />
              </Field>
              <Field label={`Corner radius: ${data.config.borderRadius}px`}>
                <input type="range" min={0} max={32} value={data.config.borderRadius} onChange={(e) => cfg("borderRadius", Number(e.target.value))} className="w-full accent-rose-600" />
              </Field>
            </div>
            {bloom && <BloomOptions value={data.config.bloom} set={bcfg} />}
            {lotus && (
              <LotusOptions
                value={data.config.lotus}
                set={lcfg}
                textColor={data.config.textColor}
                applyPalette={(p) => patch({ config: { ...data.config, textColor: p.textColor, lotus: { ...data.config.lotus, ...p.colors } } })}
              />
            )}
            {garden && <GardenOptions value={data.config.garden} set={gcfg} />}
          </Card>
        )}

        {tab === "Media" && (
          <Card className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <MediaUpload label="Cover background (envelope screen)" value={data.config.coverBackground} onChange={(v) => cfg("coverBackground", v)} />
              <MediaUpload label="Main background" value={data.config.mainBackground} onChange={(v) => cfg("mainBackground", v)} />
              <MediaUpload label="Agenda background" value={data.config.detailsBackground} onChange={(v) => cfg("detailsBackground", v)} />
              <MediaUpload label="Background music (mp3)" kind="audio" value={data.config.music} onChange={(v) => cfg("music", v)} />
            </div>
            {bloom && (
              <div className="space-y-3 border-t border-neutral-100 pt-5">
                <div>
                  <h3 className="text-sm font-semibold">Bloom artwork</h3>
                  <p className="text-xs text-neutral-500">Leave empty to use the built-in watercolor flowers. A video replaces its image.</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <MediaUpload label="Couple photo (hero)" value={data.config.bloom.heroPhoto} onChange={(v) => bcfg("heroPhoto", v)} />
                  <MediaUpload label="Monogram / logo (transparent PNG)" value={data.config.bloom.monogram} onChange={(v) => bcfg("monogram", v)} />
                  <MediaUpload label="Background frame image" value={data.config.bloom.frameImage} onChange={(v) => bcfg("frameImage", v)} />
                  <MediaUpload label="Background frame loop (mp4)" kind="video" value={data.config.bloom.frameVideo} onChange={(v) => bcfg("frameVideo", v)} />
                  <MediaUpload label="Intro flowers, top-left (transparent PNG)" value={data.config.bloom.introFlowerTop} onChange={(v) => bcfg("introFlowerTop", v)} />
                  <MediaUpload label="Intro flowers, bottom-right (transparent PNG)" value={data.config.bloom.introFlowerBottom} onChange={(v) => bcfg("introFlowerBottom", v)} />
                  <MediaUpload label="Intro video (replaces the arch animation)" kind="video" value={data.config.bloom.introVideo} onChange={(v) => bcfg("introVideo", v)} />
                </div>
              </div>
            )}
            {lotus && (
              <div className="space-y-3 border-t border-neutral-100 pt-5">
                <div>
                  <h3 className="text-sm font-semibold">Lotus photos</h3>
                  <p className="text-xs text-neutral-500">Empty photos fall back to the main background and the gallery.</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <MediaUpload label="Hero photo (full screen after the envelope)" value={data.config.lotus.heroPhoto} onChange={(v) => lcfg("heroPhoto", v)} />
                  <MediaUpload label="Arched photo (invitation letter)" value={data.config.lotus.archPhoto} onChange={(v) => lcfg("archPhoto", v)} />
                  <MediaUpload label="Couple photo (scalloped gold frame)" value={data.config.lotus.couplePhoto} onChange={(v) => lcfg("couplePhoto", v)} />
                  <MediaUpload label="Water scene (tap to float a lotus)" value={data.config.lotus.waterPhoto} onChange={(v) => lcfg("waterPhoto", v)} />
                  <MediaUpload label="Monogram (transparent PNG, replaces the names on the card)" value={data.config.lotus.monogram} onChange={(v) => lcfg("monogram", v)} />
                </div>
                <LotusStoryEditor value={data.config.lotus.story} onChange={(v) => lcfg("story", v)} />
              </div>
            )}
            {garden && (
              <div className="space-y-3 border-t border-neutral-100 pt-5">
                <div>
                  <h3 className="text-sm font-semibold">White garden artwork</h3>
                  <p className="text-xs text-neutral-500">All optional: without uploads the seal, curtains, flowers and garland are drawn in.</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <MediaUpload label="Monogram (transparent PNG: seal, hero, footer)" value={data.config.garden.monogram} onChange={(v) => gcfg("monogram", v)} />
                  <MediaUpload label="Curtain backdrop (replaces the drawn curtains)" value={data.config.garden.curtainImage} onChange={(v) => gcfg("curtainImage", v)} />
                  <MediaUpload label="Flowers along the bottom (transparent PNG)" value={data.config.garden.flowerImage} onChange={(v) => gcfg("flowerImage", v)} />
                  <MediaUpload label="Top garland while scrolling (transparent PNG)" value={data.config.garden.garlandImage} onChange={(v) => gcfg("garlandImage", v)} />
                </div>
              </div>
            )}
            <GalleryEditor value={data.config.gallery} onChange={(v) => cfg("gallery", v)} />
            <div className="grid gap-5 border-t border-neutral-100 pt-5 sm:grid-cols-2">
              <MediaUpload label="Map image (optional)" value={data.config.mapImage} onChange={(v) => cfg("mapImage", v)} />
              <Field label="Google Maps link">
                <Input value={data.config.mapUrl} onChange={(e) => cfg("mapUrl", e.target.value)} placeholder="https://maps.app.goo.gl/…" />
              </Field>
              {lotus && (
                <Field label="Embedded map (Lotus)" hint="Google Maps → Share → Embed a map → paste the <iframe> code or its src link.">
                  <Textarea rows={2} value={data.config.lotus.mapEmbed} onChange={(e) => lcfg("mapEmbed", e.target.value)} placeholder="https://www.google.com/maps/embed?pb=…" />
                </Field>
              )}
              {garden && (
                <Field label="Embedded map (White garden)" hint="Google Maps → Share → Embed a map → paste the <iframe> code or its src link. The Google Maps link above also becomes a scannable QR.">
                  <Textarea rows={2} value={data.config.garden.mapEmbed} onChange={(e) => gcfg("mapEmbed", e.target.value)} placeholder="https://www.google.com/maps/embed?pb=…" />
                </Field>
              )}
            </div>
          </Card>
        )}

        {tab === "Gift" && (
          <Card className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <MediaUpload label="KHQR (USD)" value={data.config.qrUsd} onChange={(v) => cfg("qrUsd", v)} />
              <MediaUpload label="KHQR (KHR / Riel)" value={data.config.qrKhr} onChange={(v) => cfg("qrKhr", v)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Bank">
                <Input value={data.config.bankName} onChange={(e) => cfg("bankName", e.target.value)} placeholder="ABA" />
              </Field>
              <Field label="Account name">
                <Input value={data.config.accountName} onChange={(e) => cfg("accountName", e.target.value)} />
              </Field>
              <Field label="Account number">
                <Input value={data.config.accountNumber} onChange={(e) => cfg("accountNumber", e.target.value)} />
              </Field>
            </div>
          </Card>
        )}

        {tab === "Sections" && (
          <Card className="divide-y divide-neutral-100 p-0">
            {SECTION_KEYS.map((k) => (
              <label key={k} className="flex cursor-pointer items-center justify-between px-5 py-3">
                <span className="text-sm">{SECTION_LABELS[k]}</span>
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-rose-600"
                  checked={data.sections[k]}
                  onChange={(e) => patch({ sections: { ...data.sections, [k]: e.target.checked } })}
                />
              </label>
            ))}
          </Card>
        )}
      </div>

      {/* ---------- Live preview ---------- */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="mb-2 flex items-center justify-between text-sm text-neutral-500">
          <span className="flex items-center gap-1.5">
            <Smartphone size={16} /> Preview {dirty && <span className="text-amber-600">(save to update)</span>}
          </span>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setPreviewKey((k) => k + 1)} title="Reload">
              <RotateCw size={14} />
            </Button>
            <a href={`/admin/preview/${data.id}`} target="_blank" className="inline-flex h-8 items-center rounded-lg px-2.5 hover:bg-neutral-100" title="Open in new tab">
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
        <div className="mx-auto h-[760px] max-h-[80dvh] w-full max-w-[390px] overflow-hidden rounded-[2rem] border-8 border-neutral-900 bg-neutral-900 shadow-xl">
          <iframe key={previewKey} src={`/admin/preview/${data.id}`} className="h-full w-full rounded-[1.5rem] bg-white" title="Invitation preview" />
        </div>
      </div>
    </div>
  );
}

function BloomOptions({ value: b, set }: { value: BloomConfig; set: <K extends keyof BloomConfig>(k: K, v: BloomConfig[K]) => void }) {
  return (
    <div className="space-y-4 border-t border-neutral-100 pt-5">
      <h3 className="text-sm font-semibold">Bloom options</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <ColorField label="Gold (light)" value={b.goldFrom} onChange={(v) => set("goldFrom", v)} />
        <ColorField label="Gold (highlight)" value={b.goldVia} onChange={(v) => set("goldVia", v)} />
        <ColorField label="Gold (deep)" value={b.goldTo} onChange={(v) => set("goldTo", v)} />
        <ColorField label="Primary green" value={b.green} onChange={(v) => set("green", v)} />
        <ColorField label="Sage (message cards)" value={b.sage} onChange={(v) => set("sage", v)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Intro animation">
          <Select value={b.intro ? "on" : "off"} onChange={(e) => set("intro", e.target.value === "on")}>
            <option value="on">On</option>
            <option value="off">Off</option>
          </Select>
        </Field>
        <Field label={`Intro length: ${b.introDuration}s`}>
          <input type="range" min={3} max={12} value={b.introDuration} onChange={(e) => set("introDuration", Number(e.target.value))} className="w-full accent-rose-600" />
        </Field>
        <Field label="Skip button">
          <Select value={b.skipButton ? "on" : "off"} onChange={(e) => set("skipButton", e.target.value === "on")}>
            <option value="on">Shown</option>
            <option value="off">Hidden</option>
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Scroll reveals" hint="Replay: sections animate out when they leave the screen and play again on the way back.">
          <Select value={b.revealMode} onChange={(e) => set("revealMode", e.target.value as BloomConfig["revealMode"])}>
            <option value="replay">Replay on scroll</option>
            <option value="once">Animate once</option>
          </Select>
        </Field>
        <Field label="Animation intensity">
          <Select value={b.intensity} onChange={(e) => set("intensity", e.target.value as BloomConfig["intensity"])}>
            <option value="normal">Normal</option>
            <option value="subtle">Subtle</option>
          </Select>
        </Field>
      </div>
    </div>
  );
}

function LotusOptions({
  value: l,
  set,
  textColor,
  applyPalette,
}: {
  value: LotusConfig;
  set: <K extends keyof LotusConfig>(k: K, v: LotusConfig[K]) => void;
  textColor: string;
  applyPalette: (p: (typeof LOTUS_PALETTES)[number]) => void;
}) {
  const current = LOTUS_PALETTES.find((p) => p.colors.olive === l.olive && p.colors.night === l.night && p.textColor === textColor)?.id;
  return (
    <div className="space-y-4 border-t border-neutral-100 pt-5">
      <h3 className="text-sm font-semibold">Lotus options</h3>
      {/* Not a <Field>: that is a <label>, which would forward stray clicks to the first button. */}
      <div className="space-y-1.5" role="group" aria-label="Colour palette">
        <span className="text-sm font-medium text-neutral-700">Colour palette</span>
        <div className="flex flex-wrap gap-2">
          {LOTUS_PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={current === p.id}
              onClick={() => applyPalette(p)}
              className={cx(
                "flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm",
                current === p.id ? "border-rose-600 ring-2 ring-rose-200" : "border-neutral-200 hover:border-neutral-400",
              )}
            >
              <span className="flex overflow-hidden rounded-full border border-black/10">
                {[p.colors.olive, p.colors.night, p.colors.cream, p.colors.gold].map((c) => (
                  <span key={c} className="h-6 w-4" style={{ background: c }} />
                ))}
              </span>
              {p.name}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <ColorField label="Main colour (envelope, sections)" value={l.olive} onChange={(v) => set("olive", v)} />
        <ColorField label="Night (agenda, thanks)" value={l.night} onChange={(v) => set("night", v)} />
        <ColorField label="Cream (paper)" value={l.cream} onChange={(v) => set("cream", v)} />
        <ColorField label="Gold" value={l.gold} onChange={(v) => set("gold", v)} />
        <ColorField label="Gold (highlight)" value={l.goldLight} onChange={(v) => set("goldLight", v)} />
        <ColorField label="Gold (deep)" value={l.goldDeep} onChange={(v) => set("goldDeep", v)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Names in script, first host" hint="Optional romanised name, written in script under the Khmer names.">
          <Input value={l.altHostA} onChange={(e) => set("altHostA", e.target.value)} placeholder="Ngan Veasna" />
        </Field>
        <Field label="Names in script, second host">
          <Input value={l.altHostB} onChange={(e) => set("altHostB", e.target.value)} placeholder="Seng Sreynich" />
        </Field>
      </div>
      <Field label="Water scene (tap to float a lotus)">
        <Select value={l.water ? "on" : "off"} onChange={(e) => set("water", e.target.value === "on")}>
          <option value="on">Shown</option>
          <option value="off">Hidden</option>
        </Select>
      </Field>
    </div>
  );
}

function GardenOptions({ value: g, set }: { value: GardenConfig; set: <K extends keyof GardenConfig>(k: K, v: GardenConfig[K]) => void }) {
  return (
    <div className="space-y-4 border-t border-neutral-100 pt-5">
      <h3 className="text-sm font-semibold">White garden options</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <ColorField label="Green (lettering, buttons)" value={g.green} onChange={(v) => set("green", v)} />
        <ColorField label="Leaf (falling leaves)" value={g.leaf} onChange={(v) => set("leaf", v)} />
        <ColorField label="Ivory (envelope paper)" value={g.ivory} onChange={(v) => set("ivory", v)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Names in script, first host" hint="Optional romanised name. Written in script on the hero; its initials make the monogram.">
          <Input value={g.altHostA} onChange={(e) => set("altHostA", e.target.value)} placeholder="Lengkong" />
        </Field>
        <Field label="Names in script, second host">
          <Input value={g.altHostB} onChange={(e) => set("altHostB", e.target.value)} placeholder="Romnea" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Falling leaves">
          <Select value={g.leaves ? "on" : "off"} onChange={(e) => set("leaves", e.target.value === "on")}>
            <option value="on">Shown</option>
            <option value="off">Hidden</option>
          </Select>
        </Field>
        <Field label="Crystal chandelier in the garland">
          <Select value={g.chandelier ? "on" : "off"} onChange={(e) => set("chandelier", e.target.value === "on")}>
            <option value="on">Shown</option>
            <option value="off">Hidden</option>
          </Select>
        </Field>
      </div>
    </div>
  );
}

function LotusStoryEditor({ value, onChange }: { value: LotusConfig["story"]; onChange: (v: LotusConfig["story"]) => void }) {
  const update = (i: number, p: Partial<LotusConfig["story"][number]>) => onChange(value.map((s, j) => (j === i ? { ...s, ...p } : s)));
  return (
    <div className="space-y-3">
      <div>
        <span className="text-sm font-medium text-neutral-700">Love story carousel</span>
        <p className="text-xs text-neutral-500">Photos with a short caption each. Empty: the first gallery photos are used without captions.</p>
      </div>
      {value.map((s, i) => (
        <div key={i} className="grid gap-3 rounded-lg border border-neutral-200 p-3 sm:grid-cols-[180px_1fr]">
          <MediaUpload label={`Photo ${i + 1}`} value={s.src} onChange={(v) => update(i, { src: v })} />
          <div className="space-y-2">
            <Field label="Caption (ខ្មែរ)">
              <Input value={s.kh} onChange={(e) => update(i, { kh: e.target.value })} placeholder="ជួបគ្នាដំបូង" />
            </Field>
            <Field label="Caption (English)">
              <Input value={s.en} onChange={(e) => update(i, { en: e.target.value })} placeholder="The first time we met" />
            </Field>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => onChange(value.map((x, j) => (j === i - 1 ? value[i] : j === i ? value[i - 1] : x)))}>
                Move up
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      ))}
      <Button size="sm" variant="ghost" onClick={() => onChange([...value, { src: "", kh: "", en: "" }])}>
        + Add story photo
      </Button>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-12 cursor-pointer rounded border border-neutral-300" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" />
      </div>
    </Field>
  );
}

function FontSelect({ label, fonts, value, onChange }: { label: string; fonts: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        {(fonts.includes(value) ? fonts : [value, ...fonts]).map((f) => (
          <option key={f}>{f}</option>
        ))}
      </Select>
    </Field>
  );
}
