"use client";

import { motion, type Variants } from "framer-motion";
import { useEffect } from "react";
import type { BloomConfig } from "@/lib/types";
import { EASE, INTRO, SWAY } from "./animations/variants";
import { useBloom } from "./BloomContext";
import { dateParts } from "./date";
import { IntroCluster } from "./FlowerArt";

type Props = { config: BloomConfig; date: string | null; monogram: React.ReactNode; onDone: () => void };

// Arch scale keyframes over one tween: small pill → overfills the screen → settles to its framed size.
const ARCH_START = INTRO.archGrow.delay;
const ARCH_END = INTRO.archSettle.delay + INTRO.archSettle.duration;
const archSpan = ARCH_END - ARCH_START;
const archTimes = [0, INTRO.archGrow.duration / archSpan, (INTRO.archSettle.delay - ARCH_START) / archSpan, 1];

const dateBlock: Variants = {
  hidden: {},
  show: { transition: { delayChildren: INTRO.date.delay, staggerChildren: INTRO.date.stagger } },
};
const piece = (from: { x?: number; y?: number; scale?: number; scaleX?: number }): Variants => ({
  hidden: { opacity: 0, x: 0, y: 0, scale: 1, scaleX: 1, ...from },
  show: { opacity: 1, x: 0, y: 0, scale: 1, scaleX: 1, transition: { duration: 0.6, ease: EASE } },
});
const fade = piece({ y: 10 });

/** Flower cluster that flies in with a slight overshoot, then idles. */
function Flowers({ corner, src }: { corner: "tl" | "br"; src: string }) {
  const tl = corner === "tl";
  return (
    <motion.div
      className={`absolute z-20 w-[68%] max-w-[330px] ${tl ? "-left-[3%] -top-[2%]" : "-bottom-[2%] -right-[3%]"}`}
      style={{ willChange: "transform" }}
      initial={{ opacity: 0, x: tl ? "-40%" : "40%", y: tl ? "-20%" : "20%", rotate: tl ? -8 : 8 }}
      animate={{ opacity: 1, x: "0%", y: "0%", rotate: 0 }}
      transition={{
        // Underdamped spring: overshoots a little, then settles inside the flowers-in window.
        default: { type: "spring", stiffness: 70, damping: 11, mass: 1, delay: INTRO.flowersIn.delay },
        opacity: { duration: 0.4, delay: INTRO.flowersIn.delay },
      }}
    >
      <motion.div
        style={{ transformOrigin: tl ? "0% 0%" : "100% 100%" }}
        animate={{ rotate: [0, SWAY.rotate] }}
        transition={{ duration: SWAY.duration, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: INTRO.flowersIn.delay + INTRO.flowersIn.duration }}
      >
        {src ? (
          <img src={src} alt="" className="block h-auto w-full" />
        ) : (
          <IntroCluster className={`block h-auto w-full ${tl ? "" : "rotate-180"}`} />
        )}
      </motion.div>
    </motion.div>
  );
}

/** The ~7s "arch reveal" played once after the cover opens. Skippable; an uploaded MP4 can replace it. */
export function IntroArch({ config, date, monogram, onDone }: Props) {
  const { t, lang } = useBloom();
  const video = config.introVideo;

  useEffect(() => {
    if (video) return; // the video's own end decides
    const id = setTimeout(onDone, config.introDuration * 1000);
    return () => clearTimeout(id);
  }, [video, config.introDuration, onDone]);

  const parts = date ? dateParts(date, lang) : null;

  return (
    <motion.div
      className="absolute inset-0 z-40 overflow-hidden bg-[#fbf6ec]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: INTRO.fadeIn } }}
      exit={{ opacity: 0, transition: { duration: INTRO.fadeOut } }}
    >
      {video ? (
        <video className="absolute inset-0 h-full w-full object-cover" src={video} autoPlay muted playsInline onEnded={onDone} onError={onDone} />
      ) : (
        <>
          {/* Arch: cream panel, double gold rim, soft outer shadow. */}
          <motion.div
            className="absolute inset-x-[6%] inset-y-[9%] z-10 flex flex-col items-center justify-center rounded-full border-2 px-6 text-center"
            style={{
              borderColor: "var(--gold-to)",
              background: "#fffaf0",
              boxShadow: "inset 0 0 0 5px #fffaf0, inset 0 0 0 6px var(--gold-from), 0 20px 50px -18px rgba(120, 90, 40, 0.45)",
              willChange: "transform",
            }}
            initial={{ scale: 0.22 }}
            animate={{ scale: [0.22, 1.35, 1.35, 1] }}
            transition={{ duration: archSpan, delay: ARCH_START, times: archTimes, ease: ["easeOut", "linear", EASE] }}
          >
            <motion.div
              className="w-20"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ delay: INTRO.monogram.delay, duration: INTRO.monogram.duration, ease: EASE }}
            >
              {monogram}
            </motion.div>

            {parts && (
              <motion.div className="mt-5 w-full max-w-[260px]" variants={dateBlock} initial="hidden" animate="show">
                <motion.p variants={fade} className="bloom-gold font-title text-base leading-[1.8]">
                  {t.dateLabel}
                </motion.p>
                <motion.div variants={piece({ scaleX: 0 })} className="mx-auto my-2 h-px w-full bg-[var(--gold-to)]/60" />
                <div className="flex items-center justify-center gap-3 text-[var(--green)]">
                  <motion.span variants={piece({ x: -20 })} className="flex-1 text-right text-sm leading-[1.8]">
                    {parts.weekday}
                  </motion.span>
                  <motion.span variants={piece({ scale: 0.6 })} className="bloom-gold font-title px-1 text-4xl leading-[1.6]">
                    {parts.day}
                  </motion.span>
                  <motion.span variants={piece({ x: 20 })} className="flex-1 text-left text-sm leading-[1.8]">
                    {parts.month}
                  </motion.span>
                </div>
                <motion.div variants={piece({ scaleX: 0 })} className="mx-auto my-2 h-px w-full bg-[var(--gold-to)]/60" />
                <motion.p variants={fade} className="text-sm leading-[1.8] text-[var(--green)]">
                  {parts.year}
                </motion.p>
                <motion.p
                  variants={fade}
                  className="mt-1 text-sm italic text-[var(--green)]/80"
                  style={{ fontFamily: '"Cormorant Garamond", serif' }}
                >
                  {parts.long}
                </motion.p>
              </motion.div>
            )}
          </motion.div>

          <Flowers corner="tl" src={config.introFlowerTop} />
          <Flowers corner="br" src={config.introFlowerBottom} />
        </>
      )}

      {config.skipButton && (
        <button
          type="button"
          onClick={onDone}
          className="bloom-glass absolute right-4 top-4 z-50 rounded-full px-4 py-1.5 text-xs font-semibold text-[var(--green)]"
        >
          {t.skip}
        </button>
      )}
    </motion.div>
  );
}
