"use client";

import { ExternalLink, RotateCw, Smartphone } from "lucide-react";
import { useState, useTransition } from "react";
import { saveEvent } from "@/app/actions/admin";
import { unwrap } from "@/lib/action-result";
import {
  EN_FONTS,
  KH_FONTS,
  SECTION_KEYS,
  TEXT_FIELDS,
  THEME_PRESETS,
  type Theme,
  type BloomConfig,
  type EventConfig,
  type EventData,
  type InvitationText,
  type ScheduleDay,
} from "@/lib/types";
import { AgendaEditor } from "./AgendaEditor";
import { GalleryEditor, MediaUpload } from "./MediaUpload";
import { Button, Card, Field, Input, Select, Textarea, cx } from "./ui";

const TABS = ["Couple & Date", "Text", "Agenda", "Theme", "Media", "Gift", "Sections"] as const;
type Tab = (typeof TABS)[number];

const TEXT_LABELS: Record<keyof InvitationText, string> = {
  main_title: "Main title",
  subtitle: "Greeting before guest name",
  invitation_title: "Invitation title",
  invitation_message: "Invitation message",
  date_time: "Date & time (display text)",
  location: "Location (display text)",
  details_title: "Agenda title",
  gratitude_title: "Gratitude title",
  gratitude_message: "Gratitude message",
};
const LONG_TEXT = new Set<keyof InvitationText>(["invitation_message", "gratitude_message", "location"]);

const SECTION_LABELS: Record<(typeof SECTION_KEYS)[number], string> = {
  countdown: "Countdown timer",
  agenda: "Agenda",
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

const THEME_OPTIONS: { id: Theme; name: string; desc: string; swatch: string[] }[] = [
  { id: "classic", name: "Classic", desc: "Soft cream and peach with floating petals", swatch: ["#fffaf2", "#f9af59", "#B08E4F"] },
  {
    id: "angkor",
    name: "Angkor temple",
    desc: "Sandstone and gold: Angkor Wat skyline, naga arch, lotus and kbach ornament",
    swatch: ["#f4ead6", "#b7862f", "#6b4a2b"],
  },
  {
    id: "bloom",
    name: "Bloom",
    desc: "Watercolor florals and gold lettering, with an animated arch intro and scroll reveals",
    swatch: ["#fdf2f5", "#eab308", "#43652F"],
  },
];

export function CustomizeEditor({ initial, agenda }: { initial: EventData; agenda: ScheduleDay[] }) {
  const [tab, setTab] = useState<Tab>("Couple & Date");
  const [data, setData] = useState(initial);
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
  // Picking a style also applies its colours/script font; they can still be fine-tuned below.
  const pickTheme = (theme: Theme) => patch({ config: { ...data.config, theme, ...THEME_PRESETS[theme] } });
  const txtKey = lang === "kh" ? "text_kh" : "text_en";
  const setText = (k: keyof InvitationText, v: string) => patch({ [txtKey]: { ...data[txtKey], [k]: v } });

  const save = () =>
    start(async () => {
      try {
        unwrap(await saveEvent(data));
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
          <h1 className="text-2xl font-semibold">Customize invitation</h1>
          {tab !== "Agenda" && (
            <div className="flex items-center gap-3">
              {msg && <span className="text-sm text-neutral-500">{msg}</span>}
              <Button onClick={save} disabled={!dirty || pending}>
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

        {tab === "Couple & Date" && (
          <Card className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Groom name">
                <Input value={data.groom} onChange={(e) => patch({ groom: e.target.value })} />
              </Field>
              <Field label="Bride name">
                <Input value={data.bride} onChange={(e) => patch({ bride: e.target.value })} />
              </Field>
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
              <Field key={`${lang}-${k}`} label={TEXT_LABELS[k]}>
                {LONG_TEXT.has(k) ? (
                  <Textarea rows={k === "location" ? 2 : 5} value={data[txtKey][k]} onChange={(e) => setText(k, e.target.value)} />
                ) : (
                  <Input value={data[txtKey][k]} onChange={(e) => setText(k, e.target.value)} />
                )}
              </Field>
            ))}
          </Card>
        )}

        {tab === "Agenda" && <AgendaEditor initial={agenda} onSaved={() => setPreviewKey((k) => k + 1)} />}

        {tab === "Theme" && (
          <Card className="space-y-5">
            {/* Not a <Field>: that is a <label>, which would forward stray clicks to the first button. */}
            <div className="space-y-1.5" role="radiogroup" aria-label="Style">
              <span className="text-sm font-medium text-neutral-700">Style</span>
              <div className="grid gap-3 sm:grid-cols-2">
                {THEME_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={data.config.theme === o.id}
                    onClick={() => pickTheme(o.id)}
                    className={cx(
                      "flex items-center gap-3 rounded-xl border p-3 text-left transition",
                      data.config.theme === o.id ? "border-rose-600 ring-2 ring-rose-200" : "border-neutral-200 hover:border-neutral-400",
                    )}
                  >
                    <span className="flex shrink-0 overflow-hidden rounded-lg border border-neutral-200">
                      {o.swatch.map((col) => (
                        <span key={col} className="h-10 w-4" style={{ background: col }} />
                      ))}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{o.name}</span>
                      <span className="block text-xs text-neutral-500">{o.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
              <span className="block text-xs text-neutral-500">Choosing a style also sets matching colours and English font. You can adjust them afterwards.</span>
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
            <GalleryEditor value={data.config.gallery} onChange={(v) => cfg("gallery", v)} />
            <div className="grid gap-5 border-t border-neutral-100 pt-5 sm:grid-cols-2">
              <MediaUpload label="Map image (optional)" value={data.config.mapImage} onChange={(v) => cfg("mapImage", v)} />
              <Field label="Google Maps link">
                <Input value={data.config.mapUrl} onChange={(e) => cfg("mapUrl", e.target.value)} placeholder="https://maps.app.goo.gl/…" />
              </Field>
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
            <a href="/admin/preview" target="_blank" className="inline-flex h-8 items-center rounded-lg px-2.5 hover:bg-neutral-100" title="Open in new tab">
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
        <div className="mx-auto h-[760px] max-h-[80dvh] w-full max-w-[390px] overflow-hidden rounded-[2rem] border-8 border-neutral-900 bg-neutral-900 shadow-xl">
          <iframe key={previewKey} src="/admin/preview" className="h-full w-full rounded-[1.5rem] bg-white" title="Invitation preview" />
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
