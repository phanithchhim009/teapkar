"use client";

import { AnimatePresence, MotionConfig, useReducedMotion } from "framer-motion";
import { Camera, CalendarDays, Home, MapPin, MessageCircle, QrCode } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trackOpen } from "@/app/actions/guest";
import type { EventData, ScheduleDay } from "@/lib/types";
import type { InviteGuest } from "../Invitation";
import { labels, type Lang } from "../i18n";
import { Lightbox } from "../Lightbox";
import type { PublicWish } from "../Wishes";
import { coverExitLead } from "./animations/variants";
import { BloomProvider } from "./BloomContext";
import { BottomDock, type DockItem } from "./BottomDock";
import { COVER_ITEMS, CoverScene } from "./CoverScene";
import { FloatingControls } from "./FloatingControls";
import { FloralFrame } from "./FloralFrame";
import { Monogram } from "./FlowerArt";
import { IntroArch } from "./IntroArch";
import { Footer } from "./sections/Footer";
import { GallerySection } from "./sections/GallerySection";
import { KhqrSection } from "./sections/KhqrSection";
import { LocationSection } from "./sections/LocationSection";
import { MainSection } from "./sections/MainSection";
import { MessagesSection } from "./sections/MessagesSection";
import { ScheduleSection } from "./sections/ScheduleSection";

type Props = {
  event: EventData;
  agenda: ScheduleDay[];
  guest: InviteGuest;
  wishes: PublicWish[];
  initialLang: Lang;
  preview?: boolean;
};

/** cover → opening (exit cascade) → intro (arch reveal, optional) → main (scrolling sections). */
type Scene = "cover" | "opening" | "intro" | "main";

const firstChar = (s: string) => Array.from(s.trim())[0] ?? "";

function preload(src: string) {
  if (!src) return;
  if (/\.(mp4|webm|mov)(\?|$)/i.test(src)) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = src;
    document.head.appendChild(link);
  } else {
    new Image().src = src;
  }
}

export function BloomInvitation({ event, agenda, guest, wishes, initialLang, preview = false }: Props) {
  const { config: c, sections } = event;
  const b = c.bloom;
  const reducedPref = useReducedMotion();
  // The server can't know the preference; render as "motion allowed" until mounted so hydration matches.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = mounted && !!reducedPref;
  const [lang, setLang] = useState<Lang>(initialLang);
  const [scene, setScene] = useState<Scene>("cover");
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);

  const t = labels[lang];
  const text = lang === "kh" ? event.text_kh : event.text_en;
  const hero = b.heroPhoto || c.mainBackground || c.gallery[0] || "";
  const playIntro = b.intro && !reduced;

  useEffect(() => {
    if (preview || tracked.current) return;
    tracked.current = true;
    trackOpen(guest.code).catch(() => {});
  }, [guest.code, preview]);

  // Warm the cache while the guest is still reading the cover.
  useEffect(() => {
    [hero, b.introFlowerTop, b.introFlowerBottom, b.introVideo, b.monogram].forEach(preload);
  }, [hero, b.introFlowerTop, b.introFlowerBottom, b.introVideo, b.monogram]);

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

  const open = () => {
    if (scene !== "cover") return;
    // Music must start inside this tap to satisfy autoplay rules.
    if (audio.current && c.music) audio.current.play().then(() => setPlaying(true)).catch(() => {});
    setScene("opening");
    setTimeout(() => setScene(playIntro ? "intro" : "main"), coverExitLead(COVER_ITEMS) * 1000);
  };

  const finishIntro = useCallback(() => setScene("main"), []);

  const toggleMusic = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
    else {
      a.pause();
      setPlaying(false);
    }
  };
  const toggleLang = () => setLang((l) => (l === "kh" ? "en" : "kh"));

  const monogram = b.monogram ? (
    <img src={b.monogram} alt={`${event.groom} & ${event.bride}`} className="h-auto w-full" />
  ) : (
    <Monogram a={firstChar(event.groom)} b={firstChar(event.bride)} className="h-auto w-full" />
  );

  const showSchedule = sections.agenda && agenda.length > 0;
  const showMap = sections.map && !!(c.mapUrl || c.mapImage);
  const showGallery = sections.gallery && c.gallery.length > 0;
  const showKhqr = sections.gift && !!(c.qrUsd || c.qrKhr);
  const showMessages = sections.wishes || sections.rsvp;

  const dock = useMemo<DockItem[]>(
    () =>
      [
        { id: "main", icon: Home, label: t.navHome, on: true },
        { id: "schedule", icon: CalendarDays, label: t.navSchedule, on: showSchedule },
        { id: "location", icon: MapPin, label: t.navLocation, on: showMap },
        { id: "gallery", icon: Camera, label: t.navGallery, on: showGallery },
        { id: "khqr", icon: QrCode, label: t.navKhqr, on: showKhqr },
        { id: "messages", icon: MessageCircle, label: t.navMessages, on: showMessages },
      ]
        .filter((d) => d.on)
        .map(({ id, icon, label }) => ({ id, icon, label })),
    [t, showSchedule, showMap, showGallery, showKhqr, showMessages],
  );

  const vars = {
    "--gold-from": b.goldFrom,
    "--gold-via": b.goldVia,
    "--gold-to": b.goldTo,
    "--green": b.green,
    "--sage": b.sage,
    "--primary": b.green,
    "--text": b.green,
    "--guest": c.guestNameColor,
    "--radius": `${c.borderRadius}px`,
    "--font-title": lang === "kh" ? `"${c.fontKh}"` : `"${c.fontEn}"`,
    "--font-heading": lang === "kh" ? `"${c.fontKh}"` : `"${c.fontEn}"`,
    "--font-body": lang === "kh" ? `"${c.fontBodyKh}"` : `"${c.fontEn}"`,
    fontSize: `${c.fontSize}px`,
  } as React.CSSProperties;

  return (
    <MotionConfig reducedMotion="user">
      <BloomProvider value={{ lang, t, reduced, revealMode: b.revealMode, intensity: b.intensity, scrollRef }}>
        <div lang={lang === "kh" ? "km" : "en"} className="invite theme-bloom fixed inset-0 overflow-hidden bg-gradient-to-br from-pink-50 to-yellow-50" style={vars}>
          {c.music && <audio ref={audio} src={c.music} loop preload="none" />}

          <div className="relative mx-auto h-full max-w-lg overflow-hidden bg-[#fffaf3] shadow-2xl">
            <FloralFrame config={b} reduced={reduced} />

            {scene === "main" && (
              <div ref={scrollRef} className="bloom-scroll relative z-10 h-full overflow-y-auto overflow-x-hidden">
                <MainSection event={event} text={text} hero={hero} guestName={guest.name} />
                {showSchedule && <ScheduleSection title={text.details_title || t.schedule} subtitle={text.date_time} agenda={agenda} />}
                {showMap && <LocationSection mapUrl={c.mapUrl} mapImage={c.mapImage} location={text.location} />}
                {showGallery && <GallerySection photos={c.gallery} onOpen={setZoom} />}
                {showKhqr && <KhqrSection config={c} onZoom={setZoom} />}
                {showMessages && (
                  <MessagesSection
                    code={guest.code}
                    preview={preview}
                    wishes={sections.wishes ? wishes : null}
                    rsvp={sections.rsvp ? { status: guest.rsvp_status, count: guest.rsvp_count } : null}
                  />
                )}
                <Footer text={text} groom={event.groom} bride={event.bride} />
              </div>
            )}

            <AnimatePresence>
              {(scene === "cover" || scene === "opening") && (
                <CoverScene
                  key="cover"
                  leaving={scene === "opening"}
                  title={text.main_title}
                  guestName={guest.name}
                  monogram={monogram}
                  onOpen={open}
                  onLang={toggleLang}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {scene === "intro" && <IntroArch key="intro" config={b} date={event.event_date} monogram={monogram} onDone={finishIntro} />}
            </AnimatePresence>

            {scene === "main" && (
              <>
                <FloatingControls lang={lang} onLang={toggleLang} hasMusic={!!c.music} playing={playing} onMusic={toggleMusic} />
                <BottomDock items={dock} />
              </>
            )}
          </div>

          <Lightbox src={zoom} onClose={() => setZoom(null)} />
        </div>
      </BloomProvider>
    </MotionConfig>
  );
}
