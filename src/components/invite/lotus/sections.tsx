"use client";

import { AnimatePresence, motion, useInView, useScroll } from "framer-motion";
import { CalendarPlus, Download, MapPin } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EventConfig, LotusStory, ScheduleDay, StoryItem, Video } from "@/lib/types";
import { diff } from "../Countdown";
import { dateParts, khDigits, shortStamp } from "../bloom/date";
import type { InviteGuest } from "../Invitation";
import type { Zoom } from "../Lightbox";
import { unoptimized } from "../media";
import { RollingDigits } from "../RollingDigits";
import { Rsvp } from "../Rsvp";
import { Story as StoryTimeline } from "../Story";
import { Videos } from "../Videos";
import { useWishes, type PublicWish } from "../Wishes";
import { Candle, CornerFlourish, GoldRule, LotusIcon, ScallopPhoto } from "./Art";
import { CORNERS } from "./Envelope";
import { EASE, Gold, Heading, Reveal, Section, useLotus } from "./ui";

type Hosts = [string] | [string, string];

/* ---------------------------------------------------------------- Hero */

export function Hero({
  photo,
  title,
  hosts,
  altHosts,
  greeting,
  guestName,
  date,
  dateText,
  location,
  play,
}: {
  play: boolean;
  photo: string;
  title: string;
  hosts: Hosts;
  altHosts: string;
  greeting: string;
  guestName: string;
  date: string | null;
  dateText: string;
  location: string;
}) {
  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col items-center justify-between overflow-hidden px-6 pb-12 pt-16 text-center text-[#f6efdc]">
      {photo ? (
        <motion.div className="absolute inset-0" initial={{ scale: 1.14 }} animate={play ? { scale: 1 } : { scale: 1.14 }} transition={{ duration: 9, ease: "easeOut" }}>
          <Image src={photo} alt="" fill priority unoptimized={unoptimized(photo)} sizes="(max-width: 480px) 100vw, 480px" className="object-cover" />
        </motion.div>
      ) : (
        <div className="lt-night absolute inset-0" />
      )}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.72)_0%,rgb(0_0_0/0.25)_32%,rgb(0_0_0/0.2)_52%,rgb(0_0_0/0.82)_100%)]" />
      {CORNERS.map((c) => (
        <CornerFlourish key={c} className={`absolute h-20 w-20 text-[var(--lt-gold)] opacity-80 ${c}`} />
      ))}

      <div className="relative">
        <In play={play} from="fade">
          <Gold as="h1" className="font-title text-[1.45rem] leading-[1.9]">
            {title}
          </Gold>
        </In>
        <In play={play} from="zoom" delay={0.25}>
          <LotusIcon className="mx-auto my-1 h-7 w-12 text-[var(--lt-gold)]" />
        </In>
        <In play={play} delay={0.4}>
          <Gold as="p" className="font-title text-[1.9rem] leading-[1.75]">
            {hosts[0]}
          </Gold>
          {hosts[1] && (
            <>
              <GoldRule className="mx-auto h-3 w-32 text-[var(--lt-gold)]" />
              <Gold as="p" className="font-title text-[1.9rem] leading-[1.75]">
                {hosts[1]}
              </Gold>
            </>
          )}
        </In>
        {altHosts && (
          <In play={play} from="fade" delay={0.7}>
            <p className="mt-1 font-[Great_Vibes] text-[1.7rem] text-[#f8efd8] drop-shadow">{altHosts}</p>
          </In>
        )}
      </div>

      <div className="relative w-full">
        <In play={play} from="fade">
          <p className="text-sm text-[#f3ead3]/90">{greeting}</p>
          <p className="font-title mb-4 mt-1 text-lg leading-[1.9]" style={{ color: "var(--guest)" }}>
            {guestName}
          </p>
        </In>
        {date && (
          <In play={play} delay={0.15}>
            <DateRow iso={date} />
          </In>
        )}
        {dateText && (
          <In play={play} from="fade" delay={0.3}>
            <p className="mx-auto mt-4 max-w-[22rem] whitespace-pre-line text-[0.8rem] leading-7 text-[#f3ead3]/90">{dateText}</p>
          </In>
        )}
        {location && (
          <In play={play} from="fade" delay={0.4}>
            <p className="mx-auto mt-2 max-w-[22rem] whitespace-pre-line text-[0.8rem] leading-7 text-[#f3ead3]/80">{location}</p>
          </In>
        )}
      </div>
    </section>
  );
}

const HERO_FROM = { up: { opacity: 0, y: 30 }, fade: { opacity: 0 }, zoom: { opacity: 0, scale: 0.6 } } as const;

/** Like Reveal, but waits for the envelope to open instead of for the viewport (the hero sits under the cover). */
function In({ play, from = "up", delay = 0, children }: { play: boolean; from?: keyof typeof HERO_FROM; delay?: number; children: React.ReactNode }) {
  return (
    <motion.div initial={HERO_FROM[from]} animate={play ? { opacity: 1, y: 0, scale: 1 } : HERO_FROM[from]} transition={{ duration: 1, ease: EASE, delay: delay + 0.2 }}>
      {children}
    </motion.div>
  );
}

function DateRow({ iso }: { iso: string }) {
  const { lang, t } = useLotus();
  const p = dateParts(iso, lang);
  const cells: [string, string][] = [
    [t.weekday, p.weekday.replace(/^ថ្ងៃ/, "")],
    [t.dayOfMonth, p.day],
    [t.month, p.month.replace(/^ខែ/, "")],
    [t.year, p.year.replace(/^ឆ្នាំ/, "")],
  ];
  return (
    <div className="mx-auto flex max-w-[24rem] items-stretch justify-center">
      {cells.map(([label, value], i) => (
        <div key={i} className={`flex flex-col items-center px-3 ${i ? "border-l border-[var(--lt-gold)]/70" : ""}`}>
          <span className="text-[0.7rem] text-[#f3ead3]/75">{label}</span>
          <Gold className="font-title text-lg leading-[1.9]">{value}</Gold>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Family & invitation letter */

export function Family({
  pair,
  parents,
  title,
  message,
  photo,
  hosts,
  closing,
}: {
  pair: boolean;
  parents: [string, string];
  title: string;
  message: string;
  photo: string;
  hosts: Hosts;
  closing: string;
}) {
  const { t } = useLotus();
  const showParents = parents[0] || parents[1];
  return (
    <Section tone="cream" className="text-center">
      {showParents && (
        <div className={`grid gap-4 ${pair ? "grid-cols-2" : "grid-cols-1"}`}>
          {(pair ? [0, 1] : [0]).map((i) => (
            <Reveal key={i} from={i ? "right" : "left"}>
              {pair && <p className="lt-gold-ink font-title mb-2 text-[0.85rem] leading-[1.9]">{i ? t.parentsB : t.parentsA}</p>}
              <p className="whitespace-pre-line text-sm leading-8">{parents[i]}</p>
            </Reveal>
          ))}
        </div>
      )}
      {title && (
        <Reveal className={showParents ? "mt-8" : ""}>
          <p className="font-title text-base leading-[1.9]">{title}</p>
        </Reveal>
      )}
      {photo && (
        <Reveal from="zoom" className="mx-auto my-8 w-[80%]">
          <div className="lt-arch relative aspect-[3/4] overflow-hidden rounded-t-full">
            <Image src={photo} alt="" fill unoptimized={unoptimized(photo)} sizes="(max-width: 480px) 80vw, 384px" className="object-cover" />
          </div>
        </Reveal>
      )}
      {message && (
        <Reveal>
          <p className="whitespace-pre-line text-[0.9rem] leading-8">{message}</p>
        </Reveal>
      )}
      {pair && (
        <Reveal className="mt-5 space-y-1">
          <p className="lt-gold-ink font-title text-lg leading-[1.9]">
            {t.hostANamed} {hosts[0]}
          </p>
          {hosts[1] && (
            <p className="lt-gold-ink font-title text-lg leading-[1.9]">
              {t.hostBNamed} {hosts[1]}
            </p>
          )}
        </Reveal>
      )}
      {closing && (
        <Reveal className="mt-5">
          <p className="lt-gold-ink font-title whitespace-pre-line text-base leading-[1.9]">{closing}</p>
        </Reveal>
      )}
    </Section>
  );
}

/* ---------------------------------------------------------------- The couple */

export function Couple({ photo, hosts }: { photo: string; hosts: [string, string] }) {
  const { t } = useLotus();
  return (
    <Section tone="olive" className="text-center">
      <Heading>{t.couple}</Heading>
      {photo && (
        <Reveal from="zoom" className="mx-auto w-[88%]">
          <ScallopPhoto id="lt-couple" src={photo} />
        </Reveal>
      )}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {[t.hostA, t.hostB].map((label, i) => (
          <Reveal key={label} from={i ? "right" : "left"} delay={0.1}>
            <p className="text-xs text-[#efe5cc]/80">{label}</p>
            <Gold as="p" className="font-title text-xl leading-[1.9]">
              {hosts[i]}
            </Gold>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------- Countdown */

export function LotusCountdown({ date, watermark }: { date: string; watermark: string }) {
  const { t, lang } = useLotus();
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
    <Section id="countdown" tone="deep" className="py-20">
      {/* Huge faint names drifting behind the boxes. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden whitespace-nowrap">
        <div className="lt-marquee font-title inline-block text-[5.5rem] leading-[1.6] text-[var(--lt-gold)] opacity-[0.07]">
          {watermark}&nbsp;&nbsp;·&nbsp;&nbsp;{watermark}&nbsp;&nbsp;·&nbsp;&nbsp;
        </div>
      </div>
      <Heading>{t.countdown}</Heading>
      {left?.done ? (
        <Gold as="p" className="font-title relative block text-center text-xl leading-[1.9]">
          {t.started}
        </Gold>
      ) : (
        <div className="relative grid grid-cols-4 gap-2.5">
          {cells.map(([n, label], i) => {
            const text = n === undefined ? "--" : String(n).padStart(2, "0");
            return (
              <Reveal key={label} from="zoom" delay={i * 0.1} className="border border-[var(--lt-gold)]/55 bg-black/15 py-4 text-center backdrop-blur-[2px]">
                <div className="lt-gold-soft font-title text-[1.6rem] leading-[1.5] tabular-nums" aria-hidden>
                  <RollingDigits text={text} lang={lang} />
                </div>
                <span className="sr-only">
                  {text} {label}
                </span>
                <div className="mt-1 text-[0.7rem] text-[#efe5cc]/80" aria-hidden>
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

/* ---------------------------------------------------------------- Agenda timeline */

export function Agenda({ title, agenda }: { title: string; agenda: ScheduleDay[] }) {
  const { t, lang } = useLotus();
  return (
    <Section id="agenda" tone="night">
      <Heading>{title}</Heading>
      <div className="space-y-10">
        {agenda.map((day, i) => (
          <Day key={day.id} label={`${t.dayN}${lang === "kh" ? khDigits(i + 1) : i + 1}${day.title ? ` · ${day.title}` : ""}`} day={day} />
        ))}
      </div>
    </Section>
  );
}

function Day({ label, day }: { label: string; day: ScheduleDay }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  return (
    <div>
      <Reveal from="left">
        <Gold as="h3" className="font-title text-[1.05rem] leading-[1.9]">
          {label}
        </Gold>
      </Reveal>
      <ol ref={ref} className="relative mt-4 space-y-6 pl-9">
        <span aria-hidden className="absolute bottom-1 left-[9px] top-1 w-px bg-[var(--lt-gold)]/20" />
        <motion.span aria-hidden className="absolute bottom-1 left-[9px] top-1 w-px origin-top bg-[var(--lt-gold)]" style={{ scaleY: scrollYProgress }} />
        {day.items.map((it) => (
          <motion.li
            key={it.id}
            className="relative"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <motion.span
              aria-hidden
              className="absolute -left-[33px] top-1.5 h-3.5 w-3.5 rounded-full bg-[var(--lt-gold)]"
              initial={{ scale: 0, boxShadow: "0 0 0 0 rgb(230 196 120 / 0)" }}
              whileInView={{ scale: 1, boxShadow: "0 0 0 5px rgb(230 196 120 / 0.18)" }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ duration: 0.5, delay: 0.15 }}
            />
            <p className="lt-gold-soft text-sm font-semibold tabular-nums">{it.time}</p>
            <p className="mt-0.5 text-[0.95rem] leading-7 text-[#f1e9d4]">{it.name}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/* ---------------------------------------------------------------- Love story carousel */

export function Story({ items, onOpen }: { items: LotusStory[]; onOpen: (src: string) => void }) {
  const { t, lang } = useLotus();
  const track = useRef<HTMLDivElement>(null);
  const inView = useInView(track, { amount: 0.5 });
  const [active, setActive] = useState(0);
  const touched = useRef(0);

  const step = () => {
    const el = track.current;
    const first = el?.children[0] as HTMLElement | undefined;
    return el && first ? first.offsetWidth + 16 : 1;
  };
  const go = useCallback((i: number) => track.current?.scrollTo({ left: i * step(), behavior: "smooth" }), []);

  // Drift to the next photo every few seconds while visible, unless the guest is swiping.
  useEffect(() => {
    if (!inView || items.length < 2) return;
    const id = setInterval(() => {
      if (Date.now() - touched.current < 6000) return;
      setActive((a) => {
        const next = (a + 1) % items.length;
        go(next);
        return next;
      });
    }, 4500);
    return () => clearInterval(id);
  }, [inView, items.length, go]);

  const bg = items[active]?.src;
  return (
    <section id="story" className="relative overflow-hidden py-16">
      <AnimatePresence initial={false}>
        <motion.div
          key={bg}
          aria-hidden
          className="absolute inset-0 scale-125 bg-cover bg-center"
          style={{ backgroundImage: `url("${(bg ?? "").replace(/["\\\n\r]/g, encodeURIComponent)}")`, filter: "blur(22px) brightness(0.55) saturate(0.9)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        />
      </AnimatePresence>
      <div aria-hidden className="absolute inset-0 bg-black/20" />
      <div className="relative">
        <Heading>{t.story}</Heading>
        <div
          ref={track}
          className="lt-noscroll flex snap-x snap-mandatory gap-4 overflow-x-auto px-[14%] pb-2"
          onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / step()))}
          onPointerDown={() => (touched.current = Date.now())}
          onTouchStart={() => (touched.current = Date.now())}
        >
          {items.map((it, i) => {
            const caption = lang === "kh" ? it.kh || it.en : it.en || it.kh;
            return (
              <motion.figure
                key={it.src + i}
                className="w-[72%] shrink-0 snap-center"
                animate={{ scale: i === active ? 1 : 0.9, opacity: i === active ? 1 : 0.65 }}
                transition={{ duration: 0.5 }}
              >
                <button type="button" onClick={() => onOpen(it.src)} className="lt-frame relative block aspect-[3/4] w-full overflow-hidden" aria-label={t.viewPhoto}>
                  <Image src={it.src} alt={caption} fill unoptimized={unoptimized(it.src)} sizes="(max-width: 480px) 72vw, 346px" className="object-cover" />
                </button>
                {caption && <figcaption className="mt-3 text-center text-sm leading-7 text-[#f6efdc]">{caption}</figcaption>}
              </motion.figure>
            );
          })}
        </div>
        {items.length > 1 && (
          <div className="mt-4 flex justify-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i + 1}`}
                onClick={() => {
                  touched.current = Date.now();
                  go(i);
                }}
                className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-[var(--lt-gold)]" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Shared story timeline + pre-wedding films */

/** The shared timeline, used when the couple hasn't built Lotus's own photo story. */
export function Timeline({ items, onZoom }: { items: StoryItem[]; onZoom: (z: Zoom) => void }) {
  const { t, lang } = useLotus();
  return (
    <Section id="story" tone="cream" className="lt-timeline">
      <Heading lotus>{t.story}</Heading>
      <StoryTimeline items={items} lang={lang} onZoom={onZoom} />
    </Section>
  );
}

export function Films({ videos, onPlay, onStop }: { videos: Video[]; onPlay: () => void; onStop: () => void }) {
  const { t } = useLotus();
  return (
    <Section id="video" tone="night" className="lt-films px-4">
      <Heading>{t.video}</Heading>
      <Videos videos={videos} t={t} onPlay={onPlay} onStop={onStop} />
    </Section>
  );
}

/* ---------------------------------------------------------------- Water: tap to float a lotus */

type Ripple = { id: number; x: number; y: number };

export function Water({ photo }: { photo: string }) {
  const { t } = useLotus();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [touched, setTouched] = useState(false);
  const seq = useRef(0);

  const tap = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = ++seq.current;
    setTouched(true);
    setRipples((rs) => [...rs.slice(-10), { id, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }]);
    setTimeout(() => setRipples((rs) => rs.filter((x) => x.id !== id)), 3600);
  };

  return (
    <section className="relative h-[88svh] select-none overflow-hidden">
      <Image src={photo} alt="" fill unoptimized={unoptimized(photo)} sizes="(max-width: 480px) 100vw, 480px" className="object-cover" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.15),rgb(0_0_0/0.05)_40%,rgb(0_0_0/0.55))]" />
      <div className="absolute inset-0 cursor-pointer touch-manipulation" onPointerDown={tap} role="button" aria-label={t.touchWater} tabIndex={-1}>
        {!touched && (
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-[78%] -translate-x-1/2 -translate-y-1/2">
            {[0, 1].map((i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80"
                animate={{ scale: [0.4, 1.8], opacity: [0.9, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: i * 1.1, ease: "easeOut" }}
              />
            ))}
            <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/90" />
          </div>
        )}
        {ripples.map((r) => (
          <div key={r.id} className="pointer-events-none absolute" style={{ left: `${r.x}%`, top: `${r.y}%` }}>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute left-0 top-0 h-10 w-28 rounded-[50%] border border-white/80"
                style={{ x: "-50%", y: "-50%" }}
                initial={{ scale: 0.15, opacity: 0.9 }}
                animate={{ scale: 2.6, opacity: 0 }}
                transition={{ duration: 2.4, delay: i * 0.35, ease: "easeOut" }}
              />
            ))}
            <motion.span
              className="absolute left-0 top-0 block w-14 text-[var(--lt-gold-light)] drop-shadow-[0_2px_6px_rgb(0_0_0/0.6)]"
              style={{ x: "-50%", y: "-70%" }}
              initial={{ opacity: 0, scale: 0.3, y: "-40%" }}
              animate={{ opacity: [0, 1, 1, 0], scale: 1, y: "-260%", rotate: [0, -4, 4, 0] }}
              transition={{ duration: 3.4, ease: "easeOut" }}
            >
              <LotusIcon className="h-auto w-full" />
            </motion.span>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-[52%] text-center">
        <Reveal from="fade">
          <div className="flex items-center justify-center gap-3">
            <LotusIcon className="h-5 w-9 text-[var(--lt-gold)]" />
            <Gold as="h2" className="font-title text-2xl leading-[1.9]">
              {t.floatLotus}
            </Gold>
            <LotusIcon className="h-5 w-9 text-[var(--lt-gold)]" />
          </div>
          <p className="mt-1 text-sm text-white/90 drop-shadow">{t.touchWater}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Gallery */

export function Gallery({ photos, onOpen }: { photos: string[]; onOpen: (src: string) => void }) {
  const { t } = useLotus();
  return (
    <Section id="gallery" tone="cream" className="px-4">
      <Heading lotus>{t.gallery}</Heading>
      <div className="columns-2 gap-2.5">
        {photos.map((src, i) => (
          <Reveal key={src + i} delay={(i % 2) * 0.1} className="mb-2.5 break-inside-avoid">
            <button type="button" onClick={() => onOpen(src)} className="block w-full overflow-hidden" aria-label={t.viewPhoto}>
              <Image
                src={src}
                alt=""
                width={480}
                height={i % 3 === 1 ? 480 : 640}
                unoptimized={unoptimized(src)}
                sizes="(max-width: 480px) 50vw, 240px"
                className="h-auto w-full transition duration-700 hover:scale-105"
              />
            </button>
          </Reveal>
        ))}
      </div>
    </Section>
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
  onCalendar,
}: {
  location: string;
  mapUrl: string;
  mapImage: string;
  mapEmbed: string;
  onCalendar: (() => void) | null;
}) {
  const { t } = useLotus();
  const embed = embedSrc(mapEmbed);
  return (
    <Section id="location" tone="olive" className="text-center">
      <Heading>{t.location}</Heading>
      {location && (
        <Reveal>
          <p className="mb-6 whitespace-pre-line text-sm leading-7 text-[#f1e9d4]">{location}</p>
        </Reveal>
      )}
      {(embed || mapImage) && (
        <Reveal from="zoom" className="overflow-hidden rounded-xl border border-[var(--lt-gold)]/45 bg-black/10 shadow-[0_18px_30px_-18px_rgb(0_0_0/0.8)]">
          {embed ? (
            <iframe src={embed} title={t.location} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="aspect-[4/3] w-full border-0" allowFullScreen />
          ) : (
            <Image src={mapImage} alt={t.location} width={960} height={720} unoptimized={unoptimized(mapImage)} sizes="(max-width: 480px) 100vw, 480px" className="h-auto w-full" />
          )}
        </Reveal>
      )}
      {(mapUrl || onCalendar) && (
        <Reveal delay={0.1} className="mt-7 flex flex-wrap justify-center gap-3">
          {mapUrl && (
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="lt-pill inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold">
              <MapPin size={16} /> {t.openMap}
            </a>
          )}
          {onCalendar && (
            <button type="button" onClick={onCalendar} className="lt-pill inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold">
              <CalendarPlus size={16} /> {t.addCalendar}
            </button>
          )}
        </Reveal>
      )}
    </Section>
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
  const { t } = useLotus();
  const options = [
    { id: "usd", label: "USD", src: c.qrUsd },
    { id: "khr", label: t.riel, src: c.qrKhr },
  ].filter((o) => o.src);
  const [cur, setCur] = useState(options[0]?.id);
  const shown = options.find((o) => o.id === cur) ?? options[0];
  if (!shown) return null;

  return (
    <Section id="gift" tone="cream" className="text-center">
      <Heading lotus>{t.gift}</Heading>
      {c.accountName && (
        <Reveal from="fade" className="-mt-3 mb-5">
          <p className="text-xs opacity-75">{c.bankName}</p>
          <p className="lt-gold-ink font-[Cormorant_Garamond] text-xl font-semibold">{c.accountName}</p>
        </Reveal>
      )}
      {options.length > 1 && (
        <div role="tablist" aria-label={t.currency} className="mb-5 inline-flex rounded-full border border-[var(--lt-gold)]/60 p-1">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={o.id === shown.id}
              onClick={() => setCur(o.id)}
              className={`w-20 rounded-full py-1 text-sm font-semibold transition ${o.id === shown.id ? "lt-pill" : "opacity-70"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
      <Reveal from="zoom" className="mx-auto max-w-[290px] rounded-2xl bg-white p-4 shadow-[0_24px_40px_-24px_rgb(60_50_20/0.7)]">
        <button type="button" onClick={() => onZoom(shown.src)} className="block w-full" aria-label={`KHQR ${shown.label}`}>
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
        {c.accountNumber && <p className="mt-2 text-sm font-semibold tabular-nums text-neutral-700">{c.accountNumber}</p>}
      </Reveal>
      <Reveal delay={0.1} className="mt-6">
        <button type="button" onClick={() => saveImage(shown.src, `khqr-${shown.id}.png`)} className="lt-pill inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold">
          <Download size={16} /> {t.saveQr}
        </button>
        <p className="mt-3 text-xs opacity-60">{t.giftNote}</p>
      </Reveal>
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
  const { t } = useLotus();
  return (
    <Section id="messages" tone="olive">
      {rsvp && (
        <div className={wishes ? "mb-14" : ""}>
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
  const { t, lang } = useLotus();
  const { wishes, message, setMessage, error, pending, submit } = useWishes({ code, initial, preview, t });
  return (
    <>
      <Heading>{t.wishes}</Heading>
      <Reveal>
        <form onSubmit={submit} className="card space-y-3 p-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder={t.wishPlaceholder}
            aria-label={t.wishPlaceholder}
            className="w-full resize-none rounded-lg border border-[var(--lt-gold)]/60 bg-white/80 p-3 text-sm leading-7 outline-none focus:ring-2 focus:ring-[var(--lt-gold)]/50"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={pending || !message.trim()} className="lt-pill w-full py-2.5 text-sm font-semibold disabled:opacity-60">
            {pending ? "…" : t.send}
          </button>
        </form>
      </Reveal>
      {wishes.length > 0 && (
        <ul className="lt-noscroll mt-5 max-h-[24rem] space-y-3 overflow-y-auto overscroll-contain">
          {wishes.map((w) => (
            <motion.li
              key={w.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-[var(--lt-gold)]/35 bg-black/10 p-4 text-[#f1e9d4]"
            >
              <p className="lt-gold-soft font-semibold">{w.name}</p>
              <p className="mt-1 whitespace-pre-line text-sm leading-7">{w.message}</p>
              <p className="mt-1 text-right text-[0.7rem] opacity-60">{shortStamp(w.created_at, lang)}</p>
            </motion.li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- Thank you */

export function Thanks({ title, message, apology, hosts }: { title: string; message: string; apology: string; hosts: Hosts }) {
  const { t } = useLotus();
  const heights = [54, 64, 72, 64, 54];
  return (
    <Section tone="night" className="pb-24 text-center">
      <Reveal from="fade" className="mb-6 flex items-end justify-center gap-4">
        {heights.map((h, i) => (
          <Candle key={i} height={h} delay={i * 0.37} />
        ))}
      </Reveal>
      <Heading>{title || t.gratitudeLetter}</Heading>
      {message && <Letter title={t.gratitudeLetter}>{message}</Letter>}
      {apology && <Letter title={t.apologyLetter}>{apology}</Letter>}
      <Reveal className="mt-10">
        <LotusIcon className="mx-auto h-7 w-12 text-[var(--lt-gold)]" />
        <Gold as="p" className="font-title mt-2 text-xl leading-[1.9]">
          {hosts.join(" & ")}
        </Gold>
        <p className="mt-6 text-[0.7rem] tracking-wide text-[#efe5cc]/50">{t.madeWith}</p>
      </Reveal>
    </Section>
  );
}

function Letter({ title, children }: { title: string; children: string }) {
  return (
    <Reveal className="relative mb-5 border border-[var(--lt-gold)]/60 px-5 py-6 text-[#f1e9d4]">
      <span aria-hidden className="absolute inset-[4px] border border-[var(--lt-gold)]/25" />
      <Gold as="h3" className="font-title text-lg leading-[1.9]">
        {title}
      </Gold>
      <p className="mt-2 whitespace-pre-line text-sm leading-8">{children}</p>
    </Reveal>
  );
}
