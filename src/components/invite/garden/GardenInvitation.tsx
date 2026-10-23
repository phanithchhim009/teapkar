"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { Languages, Music, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { trackOpen } from "@/app/actions/guest";
import { EVENT_TYPE_INFO, eventHosts, shareTitle } from "@/lib/event-types";
import type { EventData, ScheduleDay } from "@/lib/types";
import type { InviteGuest } from "../Invitation";
import { downloadIcs } from "../calendar";
import { labelsFor, type Lang } from "../i18n";
import { Lightbox } from "../Lightbox";
import { weddingParents } from "../parents";
import type { PublicWish } from "../Wishes";
import { FallingLeaf, Garland, initials } from "./Art";
import { Envelope } from "./Envelope";
import { Hero } from "./Hero";
import { Agenda, GardenCountdown, Gallery, Gift, Letter, Location, Messages, Thanks } from "./sections";
import { GardenProvider } from "./ui";

type Props = {
  event: EventData;
  agenda: ScheduleDay[];
  guest: InviteGuest;
  wishes: PublicWish[];
  initialLang: Lang;
  preview?: boolean;
};

/** Fixed positions for the falling leaves: left %, size px, duration s, delay s. */
const LEAVES = [
  [8, 14, 13, 0],
  [22, 10, 16, 5],
  [37, 16, 12, 9],
  [52, 11, 15, 2],
  [66, 15, 14, 7],
  [80, 12, 17, 11],
  [92, 14, 13, 4],
  [44, 9, 18, 13],
] as const;

/**
 * "Garden" theme: a white damask envelope sealed in pearl wax opens onto silk curtains that part
 * over a bed of white blossoms. While scrolling, ivy and a crystal chandelier hang across the top
 * of the screen and leaves drift down over white-silk sections lettered in deep green.
 */
export function GardenInvitation({ event, agenda, guest, wishes, initialLang, preview = false }: Props) {
  const { config: c, sections } = event;
  const gd = c.garden;
  const [lang, setLang] = useState<Lang>(initialLang);
  const [opened, setOpened] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const tracked = useRef(false);

  const t = labelsFor(lang, event.type);
  const text = lang === "kh" ? event.text_kh : event.text_en;
  const extra = gd[lang];
  const hosts = eventHosts(event);
  const pair = EVENT_TYPE_INFO[event.type].pair && hosts.length === 2;
  const alt = [gd.altHostA, pair ? gd.altHostB : ""].filter((s) => s.trim());
  const altHosts = alt.join(" & ");
  // Romanised initials read best in the script monogram; fall back to the Khmer names.
  const letters = initials(alt.length ? alt : hosts);

  useEffect(() => {
    if (preview || tracked.current) return;
    tracked.current = true;
    trackOpen(guest.code).catch(() => {});
  }, [guest.code, preview]);

  // The cover is a fixed layer; keep the page underneath from scrolling until it opens.
  useEffect(() => {
    if (opened) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      root.style.overflow = prev;
    };
  }, [opened]);

  // The garland drops in once the hero's curtains are mostly scrolled away.
  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.55);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pause the music while the tab is hidden; resume only if it was playing.
  useEffect(() => {
    const onVis = () => {
      const a = audio.current;
      if (!a) return;
      if (document.hidden) a.pause();
      else if (playing) a.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [playing]);

  const startMusic = () => {
    if (audio.current && c.music) audio.current.play().then(() => setPlaying(true)).catch(() => {});
  };
  const toggleMusic = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
    else {
      a.pause();
      setPlaying(false);
    }
  };

  const vars = useMemo(
    () =>
      ({
        "--gd-green": gd.green,
        "--gd-leaf": gd.leaf,
        "--gd-ivory": gd.ivory,
        "--gd-ink": c.textColor,
        // The shared RSVP form reads these.
        "--primary": gd.green,
        "--text": c.textColor,
        "--guest": c.guestNameColor,
        "--radius": `${c.borderRadius}px`,
        "--font-title": lang === "kh" ? `"${c.fontKh}"` : `"${c.fontEn}"`,
        "--font-heading": lang === "kh" ? `"${c.fontKh}"` : `"${c.fontEn}"`,
        "--font-body": lang === "kh" ? `"${c.fontBodyKh}"` : `"${c.fontEn}"`,
        fontSize: `${c.fontSize}px`,
      }) as React.CSSProperties,
    [gd, c, lang],
  );

  const calendar = event.event_date
    ? () => downloadIcs({ title: shareTitle(event, lang), start: event.event_date!, location: text.location })
    : null;
  const g = c.gallery;

  return (
    <MotionConfig reducedMotion="user">
      <GardenProvider value={{ lang, t }}>
        <div lang={lang === "kh" ? "km" : "en"} className="invite theme-garden min-h-dvh bg-[#e9e8e3]" style={vars}>
          {c.music && <audio ref={audio} src={c.music} loop preload="none" />}

          <div className="gd-silk relative mx-auto min-h-dvh max-w-[480px] overflow-hidden shadow-2xl">
            <Hero
              play={opened}
              title={text.main_title}
              hosts={hosts}
              altHosts={altHosts}
              letters={letters}
              monogram={gd.monogram}
              curtainImage={gd.curtainImage}
              flowerImage={gd.flowerImage}
              date={event.event_date}
            />
            <Letter
              pair={pair}
              title={text.main_title}
              letters={letters}
              monogram={gd.monogram}
              parents={weddingParents(event, text)}
              greeting={text.subtitle || t.dear}
              invitationTitle={text.invitation_title}
              message={text.invitation_message}
              hosts={hosts}
              dateText={text.date_time}
              location={text.location}
              closing={extra.closing}
            />
            {sections.countdown && event.event_date && <GardenCountdown date={event.event_date} />}
            {sections.agenda && agenda.length > 0 && <Agenda title={text.details_title || t.schedule} agenda={agenda} />}
            {sections.map && (c.mapUrl || c.mapImage || gd.mapEmbed) && (
              <Location location={text.location} mapUrl={c.mapUrl} mapImage={c.mapImage} mapEmbed={gd.mapEmbed} color={gd.green} onCalendar={calendar} />
            )}
            {sections.gallery && g.length > 0 && <Gallery photos={g} onOpen={setZoom} />}
            {(sections.rsvp || sections.wishes) && (
              <Messages
                code={guest.code}
                preview={preview}
                wishes={sections.wishes ? wishes : null}
                rsvp={sections.rsvp ? { status: guest.rsvp_status, count: guest.rsvp_count } : null}
              />
            )}
            {sections.gift && (c.qrUsd || c.qrKhr) && <Gift config={c} onZoom={setZoom} />}
            <Thanks title={text.gratitude_title} message={text.gratitude_message} hosts={hosts} letters={letters} monogram={gd.monogram} />
          </div>

          {/* ---------- Garland hanging over the top while scrolling ---------- */}
          <AnimatePresence>
            {opened && pastHero && (
              <motion.div
                aria-hidden
                className="pointer-events-none fixed inset-x-0 top-0 z-20 mx-auto h-[150px] max-w-[480px]"
                initial={{ y: -150, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -150, opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="absolute inset-x-0 top-0 h-[70px] bg-gradient-to-b from-white/85 to-transparent" />
                {gd.garlandImage ? (
                  <img src={gd.garlandImage} alt="" className="relative h-full w-full object-cover object-top" />
                ) : (
                  <Garland chandelier={gd.chandelier} className="relative h-full w-full" />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---------- Falling leaves ---------- */}
          {opened && gd.leaves && (
            <div aria-hidden className="pointer-events-none fixed inset-0 z-10 mx-auto max-w-[480px] overflow-hidden">
              {LEAVES.map(([left, size, dur, delay], i) => (
                <span
                  key={i}
                  className="gd-leaf absolute -top-8 block"
                  style={{ left: `${left}%`, width: size, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
                >
                  <FallingLeaf className="h-auto w-full" />
                </span>
              ))}
            </div>
          )}

          {/* ---------- Floating controls ---------- */}
          <AnimatePresence>
            {opened && (
              <motion.div
                className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[480px] justify-end px-4 pb-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="pointer-events-auto flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => setLang((x) => (x === "kh" ? "en" : "kh"))}
                    aria-label="Switch language"
                    className="gd-ctl flex h-11 w-11 flex-col items-center justify-center rounded-full text-[0.62rem] font-bold leading-none"
                  >
                    <Languages size={14} className="mb-0.5" />
                    {lang === "kh" ? "EN" : "ខ្មែរ"}
                  </button>
                  {c.music && (
                    <button type="button" onClick={toggleMusic} aria-label={t.music} className="gd-ctl flex h-11 w-11 items-center justify-center rounded-full">
                      {playing ? <Music size={18} className="animate-spin [animation-duration:4s]" /> : <VolumeX size={18} />}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!opened && (
              <Envelope
                key="cover"
                title={text.main_title}
                letters={letters}
                monogram={gd.monogram}
                greeting={text.subtitle || t.dear}
                guestName={guest.name}
                onOpen={startMusic}
                onDone={() => setOpened(true)}
              />
            )}
          </AnimatePresence>

          <Lightbox src={zoom} onClose={() => setZoom(null)} />
        </div>
      </GardenProvider>
    </MotionConfig>
  );
}
