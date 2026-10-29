"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { Music, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { trackOpen } from "@/app/actions/guest";
import { EVENT_TYPE_INFO, eventHosts, shareTitle } from "@/lib/event-types";
import type { EventData, ScheduleDay } from "@/lib/types";
import type { InviteGuest } from "../Invitation";
import { labelsFor, withLunar, type Lang } from "../i18n";
import { downloadIcs } from "../calendar";
import { Lightbox, type Zoom } from "../Lightbox";
import { weddingParents } from "../parents";
import type { PublicWish } from "../Wishes";
import { LotusIcon } from "./Art";
import { Envelope } from "./Envelope";
import { Agenda, Couple, Family, Films, Gallery, Gift, Hero, LotusCountdown, Location, Messages, Story, Thanks, Timeline, Water } from "./sections";
import { LotusProvider } from "./ui";

type Props = {
  event: EventData;
  agenda: ScheduleDay[];
  guest: InviteGuest;
  wishes: PublicWish[];
  initialLang: Lang;
  preview?: boolean;
};

/**
 * "Lotus" theme: a sealed olive envelope opens into a full-bleed couple photo, then alternating
 * cream / olive / night sections with gold lettering, a scroll-lit timeline, a love-story
 * carousel, a tap-the-water lotus scene and candle-lit thanks.
 */
export function LotusInvitation({ event, agenda, guest, wishes, initialLang, preview = false }: Props) {
  const { config: c, sections } = event;
  const l = c.lotus;
  const [lang, setLang] = useState<Lang>(initialLang);
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState<Zoom>(null);
  const zoomOne = (src: string) => setZoom({ images: [src], index: 0 });
  const audio = useRef<HTMLAudioElement>(null);
  const tracked = useRef(false);
  const pausedForVideo = useRef(false);

  const t = labelsFor(lang, event.type);
  const text = lang === "kh" ? event.text_kh : event.text_en;
  const extra = l[lang];
  const hosts = eventHosts(event);
  const pair = EVENT_TYPE_INFO[event.type].pair && hosts.length === 2;
  const altHosts = [l.altHostA, pair ? l.altHostB : ""].filter((s) => s.trim()).join(" & ");
  // The shared four-parent fields win; events set up before them keep Lotus's own text boxes.
  const shared = weddingParents(event, text);
  const parentText: [string, string] = shared ? [shared[0].join("\n"), shared[1].join("\n")] : [extra.parentsA, extra.parentsB];

  // Photos fall back down the chain so the theme still looks complete with only a few uploads.
  const g = c.gallery;
  const hero = l.heroPhoto || c.mainBackground || g[0] || "";
  const cover = c.coverBackground || hero;
  const arch = l.archPhoto || g[1] || hero;
  const couple = l.couplePhoto || g[2] || hero;
  const water = l.waterPhoto || g[3] || g[0] || "";
  // Lotus's own photo story wins; without one, the shared timeline tells the story, and only failing that does
  // the carousel borrow gallery photos (both are titled "Our story", so never show two).
  const timeline = c.story.filter((s) => s.photo || s.title_kh || s.title_en || s.text_kh || s.text_en);
  const showTimeline = sections.story && timeline.length > 0 && !l.story.some((s) => s.src);
  const story = l.story.length ? l.story.filter((s) => s.src) : showTimeline ? [] : g.slice(0, 6).map((src) => ({ src, kh: "", en: "" }));
  const videos = c.videos.filter((v) => v.src);

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
    pausedForVideo.current = false;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
    else {
      a.pause();
      setPlaying(false);
    }
  };

  // Hush the background music while a video plays, and bring it back afterwards if we were the ones who stopped it.
  const videoStarted = () => {
    const a = audio.current;
    if (!a || a.paused) return;
    a.pause();
    setPlaying(false);
    pausedForVideo.current = true;
  };
  const videoStopped = () => {
    if (!pausedForVideo.current) return;
    pausedForVideo.current = false;
    audio.current?.play().then(() => setPlaying(true)).catch(() => {});
  };

  const vars = useMemo(
    () =>
      ({
        "--lt-olive": l.olive,
        "--lt-night": l.night,
        "--lt-cream": l.cream,
        "--lt-gold": l.gold,
        "--lt-gold-light": l.goldLight,
        "--lt-gold-deep": l.goldDeep,
        "--lt-ink": c.textColor,
        // The shared RSVP form reads these.
        "--primary": l.olive,
        "--text": c.textColor,
        "--guest": c.guestNameColor,
        "--radius": `${c.borderRadius}px`,
        "--font-title": lang === "kh" ? `"${c.fontKh}"` : `"${c.fontEn}"`,
        "--font-heading": lang === "kh" ? `"${c.fontKh}"` : `"${c.fontEn}"`,
        "--font-body": lang === "kh" ? `"${c.fontBodyKh}"` : `"${c.fontEn}"`,
        fontSize: `${c.fontSize}px`,
      }) as React.CSSProperties,
    [l, c, lang],
  );

  const calendar = event.event_date
    ? () => downloadIcs({ title: shareTitle(event, lang), start: event.event_date!, location: text.location })
    : null;
  const showRsvp = sections.rsvp;
  const showWishes = sections.wishes;

  return (
    <MotionConfig reducedMotion="user">
      <LotusProvider value={{ lang, t }}>
        <div lang={lang === "kh" ? "km" : "en"} className="invite theme-lotus min-h-dvh bg-[#0d0e0a]" style={vars}>
          {c.music && <audio ref={audio} src={c.music} loop preload="none" />}

          <div className="relative mx-auto min-h-dvh max-w-[480px] overflow-hidden shadow-2xl">
            <Hero
              play={opened}
              photo={hero}
              title={text.main_title}
              hosts={hosts}
              altHosts={altHosts}
              greeting={text.subtitle || t.dear}
              guestName={guest.name}
              date={event.event_date}
              dateText={withLunar(text)}
              location={text.location}
            />
            <Family
              pair={pair}
              parents={parentText}
              title={text.invitation_title}
              message={text.invitation_message}
              photo={arch}
              hosts={hosts}
              closing={extra.closing}
            />
            {pair && <Couple photo={couple} hosts={hosts as [string, string]} />}
            {sections.countdown && event.event_date && <LotusCountdown date={event.event_date} watermark={hosts.join(" ")} />}
            {sections.agenda && agenda.length > 0 && <Agenda title={text.details_title || t.schedule} agenda={agenda} />}
            {sections.gallery && story.length > 0 && <Story items={story} onOpen={zoomOne} />}
            {showTimeline && <Timeline items={timeline} onZoom={setZoom} />}
            {sections.video && videos.length > 0 && <Films videos={videos} onPlay={videoStarted} onStop={videoStopped} />}
            {l.water && water && <Water photo={water} />}
            {sections.gallery && g.length > 0 && <Gallery photos={g} onOpen={zoomOne} />}
            {sections.map && (c.mapUrl || c.mapImage || l.mapEmbed) && (
              <Location location={text.location} mapUrl={c.mapUrl} mapImage={c.mapImage} mapEmbed={l.mapEmbed} onCalendar={calendar} />
            )}
            {sections.gift && (c.qrUsd || c.qrKhr) && <Gift config={c} onZoom={zoomOne} />}
            {(showRsvp || showWishes) && (
              <Messages
                code={guest.code}
                preview={preview}
                wishes={showWishes ? wishes : null}
                rsvp={showRsvp ? { status: guest.rsvp_status, count: guest.rsvp_count } : null}
              />
            )}
            <Thanks title={text.gratitude_title} message={text.gratitude_message} apology={extra.apology} hosts={hosts} />
          </div>

          {/* ---------- Floating controls ---------- */}
          <AnimatePresence>
            {opened && (
              <motion.div
                className="pointer-events-none fixed inset-x-0 top-0 z-30 mx-auto flex max-w-[480px] items-start justify-between px-3 pt-3"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  aria-label={t.toTop}
                  className="pointer-events-auto flex flex-col items-center rounded-lg px-1.5 py-1 text-[var(--lt-gold)] drop-shadow-[0_1px_3px_rgb(0_0_0/0.8)]"
                >
                  {l.monogram ? (
                    <img src={l.monogram} alt="" className="h-10 w-auto" />
                  ) : (
                    <>
                      <LotusIcon className="h-3 w-6" />
                      <span className="font-title max-w-[5.5rem] truncate text-[0.55rem] leading-[1.8]">{hosts[0]}</span>
                      {hosts[1] && <span className="font-title -mt-1 max-w-[5.5rem] truncate pl-3 text-[0.55rem] leading-[1.8]">{hosts[1]}</span>}
                    </>
                  )}
                </button>
                <div className="pointer-events-auto flex gap-2">
                  {c.music && (
                    <button type="button" onClick={toggleMusic} aria-label={t.music} className="lt-ctl flex h-10 w-10 items-center justify-center rounded-full">
                      {playing ? <Music size={17} className="animate-spin [animation-duration:4s]" /> : <VolumeX size={17} />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setLang((x) => (x === "kh" ? "en" : "kh"))}
                    aria-label="Switch language"
                    className="lt-ctl h-10 min-w-10 rounded-full px-3 text-xs font-bold"
                  >
                    {lang === "kh" ? "EN" : "ខ្មែរ"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!opened && (
              <Envelope
                key="cover"
                title={text.main_title}
                subtitle={lang === "kh" ? event.text_en.main_title : ""}
                hosts={hosts}
                monogram={l.monogram}
                background={cover}
                greeting={text.subtitle || t.dear}
                guestName={guest.name}
                onOpen={startMusic}
                onDone={() => setOpened(true)}
              />
            )}
          </AnimatePresence>

          <Lightbox zoom={zoom} onChange={setZoom} />
        </div>
      </LotusProvider>
    </MotionConfig>
  );
}
