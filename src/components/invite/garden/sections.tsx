"use client";

import { AnimatePresence, motion, useScroll } from "framer-motion";
import {
  CalendarPlus,
  Camera,
  Download,
  Flower2,
  Gem,
  Gift as GiftIcon,
  HandHeart,
  Heart,
  MapPin,
  Music,
  Scissors,
  Sparkles,
  Users,
  Utensils,
  Wine,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import type { EventConfig, ScheduleDay, StoryItem, Video } from "@/lib/types";
import { diff } from "../Countdown";
import { dateParts, khDigits, shortStamp } from "../bloom/date";
import type { InviteGuest } from "../Invitation";
import type { Zoom } from "../Lightbox";
import { unoptimized } from "../media";
import type { ParentSides } from "../parents";
import { RollingDigits } from "../RollingDigits";
import { Rsvp } from "../Rsvp";
import { Story as StoryTimeline } from "../Story";
import { Videos } from "../Videos";
import { useWishes, type PublicWish } from "../Wishes";
import { Monogram, Sprig } from "./Art";
import { EASE, Heading, Reveal, Section, useGarden } from "./ui";

type Hosts = [string] | [string, string];

/* ---------------------------------------------------------------- Invitation letter */

export function Letter({
  pair,
  title,
  letters,
  monogram,
  parents,
  greeting,
  invitationTitle,
  message,
  hosts,
  dateText,
  location,
  closing,
}: {
  pair: boolean;
  title: string;
  letters: string[];
  monogram: string;
  parents: ParentSides | null;
  greeting: string;
  invitationTitle: string;
  message: string;
  hosts: Hosts;
  dateText: string;
  location: string;
  closing: string;
}) {
  const { t } = useGarden();
  const sides = parents ?? [];
  return (
    <Section id="invitation" className="pt-36 text-center">
      <Reveal from="zoom">
        <Monogram letters={letters} image={monogram} className="gd-green mx-auto h-16 w-auto text-[3.2rem]" />
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="gd-green font-title mt-3 text-[1.6rem]">{title}</h2>
      </Reveal>
      {parents && (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2">
          {sides.map((names, i) => (
            <Reveal key={i} from={i ? "right" : "left"} delay={0.1}>
              <p className="gd-green mb-1 text-[0.72rem] opacity-75">{i ? t.parentsB : t.parentsA}</p>
              {names.map((n, k) => (
                <p key={k} className="text-[0.85rem] leading-8">
                  {n}
                </p>
              ))}
            </Reveal>
          ))}
        </div>
      )}
      <Reveal className="mt-6">
        <p className="gd-green font-title text-[1.1rem]">{invitationTitle || greeting}</p>
      </Reveal>
      {message && (
        <Reveal delay={0.05}>
          <p className="mt-3 whitespace-pre-line text-justify text-[0.88rem] leading-8 [text-align-last:center]">{message}</p>
        </Reveal>
      )}
      <div className={`mt-7 grid gap-3 ${hosts[1] ? "grid-cols-2" : "grid-cols-1"}`}>
        {hosts.map((h, i) => (
          <Reveal key={i} from={i ? "right" : "left"} delay={0.1}>
            {pair && <p className="text-[0.8rem] opacity-75">{i ? t.hostBNamed : t.hostANamed}</p>}
            <p className="gd-green font-title mt-1 text-[1.2rem]">{h}</p>
          </Reveal>
        ))}
      </div>
      {(dateText || location) && (
        <Reveal className="mt-7">
          <Sprig className="gd-green mx-auto mb-3 h-3 w-32 opacity-60" />
          {dateText && <p className="gd-green font-title whitespace-pre-line text-[0.95rem] leading-8">{dateText}</p>}
          {location && <p className="mt-1 whitespace-pre-line text-[0.85rem] leading-7">{location}</p>}
        </Reveal>
      )}
      {closing && (
        <Reveal className="mt-5">
          <p className="gd-green font-title whitespace-pre-line text-base">{closing}</p>
        </Reveal>
      )}
    </Section>
  );
}

/* ---------------------------------------------------------------- Countdown */

export function GardenCountdown({ date }: { date: string }) {
  const { t, lang } = useGarden();
  const target = new Date(date).getTime();
  const [left, setLeft] = useState<ReturnType<typeof diff> | null>(null);
  useEffect(() => {
    setLeft(diff(target));
    const id = setInterval(() => setLeft(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  const cells: [number | undefined, string][] = [
    [left?.d, t.days],
    [left?.h, t.hours],
    [left?.m, t.minutes],
    [left?.s, t.seconds],
  ];
  return (
    <Section id="countdown" className="py-10">
      {left?.done ? (
        <Reveal>
          <p className="gd-green font-title text-center text-xl">{t.started}</p>
        </Reveal>
      ) : (
        <div className="grid grid-cols-4 gap-2.5">
          {cells.map(([n, label], i) => {
            const text = n === undefined ? "--" : String(n).padStart(2, "0");
            return (
              <Reveal key={label} from="zoom" delay={i * 0.08} className="gd-card py-4 text-center">
                <div className="gd-green font-[Cormorant_Garamond] text-[1.9rem] font-semibold leading-[1.2] [font-variant-numeric:lining-nums_tabular-nums]" aria-hidden>
                  <RollingDigits text={text} lang={lang} />
                </div>
                <span className="sr-only">
                  {text} {label}
                </span>
                <div className="font-title mt-1 text-[0.72rem] opacity-80" aria-hidden>
                  {label}
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </Section>
  );
}

/* ---------------------------------------------------------------- Agenda */

/** Picks a line icon for an agenda item from words in its name (Khmer or English). */
const ICONS: [RegExp, LucideIcon][] = [
  [/កាត់សក់|hair/i, Scissors],
  [/ចិញ្ចៀន|ring|vow|សច្ចា/i, Gem],
  [/ចងដៃ|bless|tying|ព្រះសង្ឃ|សូត្រ|monk|pray/i, HandHeart],
  [/ជំនូន|ហែ|procession|dowry|gift/i, GiftIcon],
  [/ផ្កាស្លា|sla|flower|ផ្កា/i, Flower2],
  [/អាហារ|ពិសា|ញ៉ាំ|lunch|dinner|breakfast|meal|banquet/i, Utensils],
  [/ល្ងាច|ពិធីជប់លៀង|party|reception|cheers|toast|wine|ស្រា/i, Wine],
  [/ថតរូប|photo/i, Camera],
  [/តន្ត្រី|រាំ|music|dance/i, Music],
  [/ជួបជុំ|ទទួល|welcome|arrival|guest|ភ្ញៀវ/i, Users],
  [/ពិធី|ceremony/i, Sparkles],
];
const iconFor = (name: string) => ICONS.find(([re]) => re.test(name))?.[1] ?? Heart;

export function Agenda({ title, agenda }: { title: string; agenda: ScheduleDay[] }) {
  const { t, lang } = useGarden();
  return (
    <Section id="agenda">
      <Heading>{title}</Heading>
      <div className="space-y-10">
        {agenda.map((day, i) => {
          const when = day.date ? dateParts(day.date, lang) : null;
          const label = [day.title || `${t.dayN}${lang === "kh" ? khDigits(i + 1) : i + 1}`, when && `${when.weekday} ${when.day} ${when.month} ${when.year}`]
            .filter(Boolean)
            .join(" · ");
          return <Day key={day.id} label={label} day={day} />;
        })}
      </div>
    </Section>
  );
}

function Day({ label, day }: { label: string; day: ScheduleDay }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 60%"] });
  return (
    <div>
      <Reveal>
        <p className="gd-green font-title mb-5 text-center text-[1rem]">{label}</p>
      </Reveal>
      <ol ref={ref} className="relative">
        <span aria-hidden className="absolute bottom-3 left-[76px] top-3 w-px bg-[var(--gd-green)]/20" />
        <motion.span aria-hidden className="absolute bottom-3 left-[76px] top-3 w-px origin-top bg-[var(--gd-green)]" style={{ scaleY: scrollYProgress }} />
        {day.items.map((it) => {
          const Icon = iconFor(it.name);
          return (
            <motion.li
              key={it.id}
              className="relative grid grid-cols-[60px_33px_1fr] items-start py-3"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <span className="flex justify-center pt-0.5">
                <Icon aria-hidden size={30} strokeWidth={1.1} className="gd-green" />
              </span>
              <span className="flex justify-center pt-2.5">
                <motion.span
                  aria-hidden
                  className="relative z-[1] block h-3 w-3 rounded-full bg-[var(--gd-green)] ring-4 ring-[var(--gd-ivory)]"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: 0.15 }}
                />
              </span>
              <span>
                <span className="gd-green block text-[0.9rem] font-semibold [font-variant-numeric:lining-nums_tabular-nums]">{it.time}</span>
                <span className="mt-0.5 block text-[0.88rem] leading-7">{it.name}</span>
              </span>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------------------------------------------------------------- Location */

/** Accepts either an embed URL or the whole `<iframe …>` snippet from Google Maps. */
function embedSrc(raw: string) {
  const s = raw.trim();
  const src = s.startsWith("<") ? (s.match(/src=["']([^"']+)["']/)?.[1] ?? "") : s;
  return /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(src) ? src : "";
}

export function Location({
  location,
  mapUrl,
  mapImage,
  mapEmbed,
  color,
  onCalendar,
}: {
  location: string;
  mapUrl: string;
  mapImage: string;
  mapEmbed: string;
  color: string;
  onCalendar: (() => void) | null;
}) {
  const { t } = useGarden();
  const embed = embedSrc(mapEmbed);
  const [qr, setQr] = useState("");
  useEffect(() => {
    if (!mapUrl) return;
    QRCode.toDataURL(mapUrl, { width: 360, margin: 1, color: { dark: color, light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [mapUrl, color]);

  return (
    <Section id="location" className="text-center">
      <Heading icon={<MapPin size={20} strokeWidth={1.5} />}>{t.location}</Heading>
      {location && (
        <Reveal>
          <p className="mb-6 whitespace-pre-line text-[0.88rem] leading-7">{location}</p>
        </Reveal>
      )}
      {qr && (
        <Reveal from="zoom" className="gd-card mx-auto w-[62%] max-w-[230px] p-3">
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" aria-label={t.openMap}>
            <img src={qr} alt="Google Maps QR" className="h-auto w-full" />
          </a>
        </Reveal>
      )}
      {qr && (
        <Reveal delay={0.1}>
          <p className="gd-green mt-3 text-[0.85rem]">{t.scanMap}</p>
        </Reveal>
      )}
      {(embed || mapImage) && (
        <Reveal from="zoom" className="gd-card mt-6 overflow-hidden p-1.5">
          {embed ? (
            <iframe src={embed} title={t.location} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="aspect-[4/3] w-full rounded-xl border-0" allowFullScreen />
          ) : (
            <Image src={mapImage} alt={t.location} width={960} height={720} unoptimized={unoptimized(mapImage)} sizes="(max-width: 480px) 100vw, 480px" className="h-auto w-full rounded-xl" />
          )}
        </Reveal>
      )}
      {(mapUrl || onCalendar) && (
        <Reveal delay={0.1} className="mt-6 flex flex-wrap justify-center gap-3">
          {mapUrl && (
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="gd-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm">
              <MapPin size={16} /> {t.openMap}
            </a>
          )}
          {onCalendar && (
            <button type="button" onClick={onCalendar} className="gd-btn-ghost inline-flex items-center gap-2 px-5 py-2.5 text-sm">
              <CalendarPlus size={16} /> {t.addCalendar}
            </button>
          )}
        </Reveal>
      )}
    </Section>
  );
}

/* ---------------------------------------------------------------- Love story + pre-wedding films */

export function Story({ items, onZoom }: { items: StoryItem[]; onZoom: (z: Zoom) => void }) {
  const { t, lang } = useGarden();
  return (
    <Section id="story">
      <Heading>{t.story}</Heading>
      <StoryTimeline items={items} lang={lang} onZoom={onZoom} />
    </Section>
  );
}

export function Films({ videos, onPlay, onStop }: { videos: Video[]; onPlay: () => void; onStop: () => void }) {
  const { t } = useGarden();
  return (
    <Section id="video" className="gd-films px-4">
      <Heading>{t.video}</Heading>
      <Videos videos={videos} t={t} onPlay={onPlay} onStop={onStop} />
    </Section>
  );
}

/* ---------------------------------------------------------------- Gallery */

export function Gallery({ photos, onOpen }: { photos: string[]; onOpen: (src: string) => void }) {
  const { t } = useGarden();
  // A full-width photo, then a pair, and so on.
  const rows: string[][] = [];
  for (let i = 0; i < photos.length; ) {
    const take = rows.length % 2 === 0 || i === photos.length - 1 ? 1 : 2;
    rows.push(photos.slice(i, i + take));
    i += take;
  }
  return (
    <Section id="gallery" className="px-4">
      <Heading>{t.gallery}</Heading>
      <div className="space-y-3">
        {rows.map((row, r) => (
          <div key={r} className={`grid gap-3 ${row.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {row.map((src, k) => (
              <Reveal key={src + k} from={row.length === 2 ? (k ? "right" : "left") : "zoom"}>
                <button type="button" onClick={() => onOpen(src)} className="gd-photo relative block w-full overflow-hidden" aria-label={t.viewPhoto}>
                  <span className={`relative block w-full ${row.length === 2 ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
                    <Image
                      src={src}
                      alt=""
                      fill
                      unoptimized={unoptimized(src)}
                      sizes={row.length === 2 ? "(max-width: 480px) 50vw, 240px" : "(max-width: 480px) 100vw, 480px"}
                      className="object-cover transition duration-[1.2s] hover:scale-105"
                    />
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- RSVP + wishes */

export function Messages({
  code,
  preview,
  wishes,
  rsvp,
}: {
  code: string;
  preview: boolean;
  wishes: PublicWish[] | null;
  rsvp: { status: InviteGuest["rsvp_status"]; count: number } | null;
}) {
  const { t } = useGarden();
  return (
    <Section id="messages">
      {rsvp && (
        <div className={wishes ? "mb-12" : ""}>
          <Heading>{t.rsvp}</Heading>
          <Reveal from="zoom">
            <Rsvp code={code} initialStatus={rsvp.status} initialCount={rsvp.count} preview={preview} t={t} />
          </Reveal>
        </div>
      )}
      {wishes && <Guestbook code={code} preview={preview} initial={wishes} />}
    </Section>
  );
}

function Guestbook({ code, preview, initial }: { code: string; preview: boolean; initial: PublicWish[] }) {
  const { t, lang } = useGarden();
  const { wishes, message, setMessage, error, pending, submit } = useWishes({ code, initial, preview, t });
  return (
    <>
      <Heading>{t.wishes}</Heading>
      <Reveal className="gd-card p-4">
        {wishes.length > 0 ? (
          <ul className="gd-noscroll -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
            <AnimatePresence initial={false}>
              {wishes.map((w) => (
                <motion.li
                  key={w.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="gd-wish flex w-[72%] shrink-0 snap-start flex-col p-4"
                >
                  <p className="gd-green font-[Cormorant_Garamond] text-[0.95rem] font-semibold italic">{w.name}</p>
                  <p className="mt-1 line-clamp-6 flex-1 whitespace-pre-line text-[0.85rem] leading-7">{w.message}</p>
                  <p className="mt-2 text-[0.68rem] opacity-55">{shortStamp(w.created_at, lang)}</p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <p className="py-4 text-center text-sm opacity-60">{t.noWishes}</p>
        )}
        <form onSubmit={submit} className="mt-3 space-y-3 border-t border-[var(--gd-green)]/10 pt-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder={t.wishPlaceholder}
            aria-label={t.wishPlaceholder}
            className="w-full resize-none rounded-xl border border-[var(--gd-green)]/25 bg-white p-3 text-sm leading-7 outline-none focus:ring-2 focus:ring-[var(--gd-green)]/30"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={pending || !message.trim()} className="gd-btn w-full py-2.5 text-sm disabled:opacity-60">
            {pending ? "…" : t.send}
          </button>
        </form>
      </Reveal>
    </>
  );
}

/* ---------------------------------------------------------------- Gift (KHQR) */

async function saveImage(src: string, name: string) {
  try {
    const res = await fetch(src, { mode: "cors" });
    if (!res.ok) throw new Error();
    const url = URL.createObjectURL(await res.blob());
    const a = Object.assign(document.createElement("a"), { href: url, download: name });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch {
    window.open(src, "_blank", "noopener");
  }
}

export function Gift({ config: c, onZoom }: { config: EventConfig; onZoom: (src: string) => void }) {
  const { t } = useGarden();
  const options = [
    { id: "usd", label: "USD", src: c.qrUsd },
    { id: "khr", label: t.riel, src: c.qrKhr },
  ].filter((o) => o.src);
  const [cur, setCur] = useState(options[0]?.id);
  const shown = options.find((o) => o.id === cur) ?? options[0];
  if (!shown) return null;
  return (
    <Section id="gift" className="text-center">
      <Heading>{t.gift}</Heading>
      {options.length > 1 && (
        <div role="tablist" aria-label={t.currency} className="mb-5 inline-flex rounded-full border border-[var(--gd-green)]/30 bg-white p-1">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={o.id === shown.id}
              onClick={() => setCur(o.id)}
              className={`w-20 rounded-full py-1 text-sm font-semibold transition ${o.id === shown.id ? "bg-[var(--gd-green)] text-white" : "gd-green"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
      <Reveal from="zoom" className="gd-card mx-auto max-w-[300px] overflow-hidden">
        {c.bankName && <p className="gd-green border-b border-[var(--gd-green)]/10 py-2.5 text-sm font-bold tracking-wide">{c.bankName}</p>}
        <div className="px-6 pb-5 pt-4">
          {c.accountName && <p className="font-[Cormorant_Garamond] text-lg font-semibold">{c.accountName}</p>}
          <button type="button" onClick={() => onZoom(shown.src)} className="mt-2 block w-full" aria-label={`KHQR ${shown.label}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={shown.id}
                src={shown.src}
                alt={`KHQR ${shown.label}`}
                className="mx-auto w-full rounded-lg object-contain"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              />
            </AnimatePresence>
          </button>
          {c.accountNumber && <p className="mt-2 text-sm font-semibold tabular-nums opacity-80">{c.accountNumber}</p>}
        </div>
      </Reveal>
      <Reveal delay={0.1} className="mt-6">
        <button type="button" onClick={() => saveImage(shown.src, `khqr-${shown.id}.png`)} className="gd-btn inline-flex items-center gap-2 px-6 py-2.5 text-sm">
          <Download size={16} /> {t.saveQr}
        </button>
        <p className="mt-3 text-xs opacity-60">{t.giftNote}</p>
      </Reveal>
    </Section>
  );
}

/* ---------------------------------------------------------------- Thank you */

export function Thanks({ title, message, hosts, letters, monogram }: { title: string; message: string; hosts: Hosts; letters: string[]; monogram: string }) {
  const { t } = useGarden();
  return (
    <Section className="pb-28 text-center">
      <Heading>{title || t.gratitudeLetter}</Heading>
      {message && (
        <Reveal>
          <p className="whitespace-pre-line text-[0.88rem] leading-8">{message}</p>
        </Reveal>
      )}
      <Reveal from="zoom" className="mt-10">
        <Monogram letters={letters} image={monogram} className="gd-green mx-auto h-16 w-auto text-[3.2rem]" />
        <p className="gd-green font-title mt-3 text-lg">{hosts.join(" & ")}</p>
        <p className="mt-6 text-[0.7rem] tracking-wide opacity-50">{t.madeWith}</p>
      </Reveal>
    </Section>
  );
}
