import type { Variants } from "framer-motion";
import type { BloomConfig } from "@/lib/types";

/**
 * Every motion value of the Bloom theme lives here so timing can be tuned in one place.
 * Durations are in seconds (Framer Motion's unit).
 */

export const EASE = [0.22, 1, 0.36, 1] as const;
export const DUR = 0.8;

type Intensity = BloomConfig["intensity"];

/* ---------- Scroll reveals ---------- */

export type RevealVariant = "fadeUpLg" | "fadeUp" | "fadeUpMd" | "fadeUpSm" | "scaleIn" | "popIn" | "slideLeft" | "slideRight" | "grow";

const FROM: Record<RevealVariant, { x?: number; y?: number; scale?: number }> = {
  fadeUpLg: { y: 60 }, // section blocks, section titles
  fadeUp: { y: 30 }, // headings, subtitles
  fadeUpMd: { y: 50 }, // gallery images, schedule rows, KHQR card
  fadeUpSm: { y: 20 }, // small text groups
  scaleIn: { scale: 0.9 }, // map, large cards
  popIn: { scale: 0.8 }, // countdown boxes, QR
  slideLeft: { x: -20 }, // paired labels
  slideRight: { x: 20 },
  grow: { scale: 0 }, // separators and dots
};

/** Delay between siblings inside one section (countdown boxes, schedule rows, gallery tiles). */
export const STAGGER = 0.12;

/** "subtle" halves every offset; reduced motion keeps only the fade. */
export function revealVariants(variant: RevealVariant, intensity: Intensity, reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      show: (delay = 0) => ({ opacity: 1, transition: { duration: 0.4, delay } }),
    };
  }
  const k = intensity === "subtle" ? 0.5 : 1;
  const f = FROM[variant];
  return {
    hidden: {
      opacity: 0,
      x: (f.x ?? 0) * k,
      y: (f.y ?? 0) * k,
      scale: f.scale === undefined ? 1 : 1 - (1 - f.scale) * k,
      // Leaving the viewport (replay mode) is quicker than arriving.
      transition: { duration: DUR * 0.6, ease: EASE },
    },
    show: (delay = 0) => ({ opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: DUR, ease: EASE, delay } }),
  };
}

/** Gallery parallax travel in px (each direction). */
export const PARALLAX = 20;

/* ---------- Cover ---------- */

export const COVER = {
  enterStagger: 0.15,
  enterY: 30,
  exitDuration: 0.8,
  exitStagger: 0.2,
  exitY: 60,
  /** Open button "breathing" loop. */
  breatheScale: 1.025,
  breatheDuration: 2,
};

export const coverItem: Variants = {
  hidden: { opacity: 0, y: COVER.enterY },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: DUR, ease: EASE, delay: 0.2 + i * COVER.enterStagger } }),
  exit: (i: number) => ({
    opacity: 0,
    y: COVER.exitY,
    transition: { duration: COVER.exitDuration, ease: EASE, delay: i * COVER.exitStagger },
  }),
};

/** Seconds until the last cover element has started leaving; the intro overlay fades in from here. */
export const coverExitLead = (items: number) => (items - 1) * COVER.exitStagger + 0.2;

/* ---------- Fixed controls (slide in once the invitation is open) ---------- */

export const CONTROLS = { duration: 0.5, langX: -25, musicX: 25, dockY: 50, topY: 50, topExtraDelay: 0.15 };

/* ---------- Intro "arch reveal" ---------- */

export const INTRO = {
  /** Default hold length; the admin can change the total (3–12s). */
  total: 7,
  fadeIn: 0.3,
  archGrow: { delay: 0.2, duration: 1.0 },
  flowersIn: { delay: 0.8, duration: 1.2 },
  archSettle: { delay: 1.5, duration: 0.8 },
  monogram: { delay: 2.3, duration: 0.7 },
  date: { delay: 3.0, stagger: 0.12 },
  fadeOut: 0.4,
};

/* ---------- Ambient loops ---------- */

/** Floral frame corners and intro flowers drift back and forth on this period. */
export const SWAY = { duration: 4, rotate: 2, x: 4, y: 3 };

/** KH/EN text swap. */
export const LANG_FADE = 0.15;
