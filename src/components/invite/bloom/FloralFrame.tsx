"use client";

import { motion } from "framer-motion";
import type { BloomConfig } from "@/lib/types";
import { SWAY } from "./animations/variants";
import { FrameCorner } from "./FlowerArt";

type Corner = { pos: string; flip: string; origin: string; size: string; phase: number };

const CORNERS: Corner[] = [
  { pos: "left-0 top-0", flip: "", origin: "0% 0%", size: "w-[62%]", phase: 0 },
  { pos: "right-0 top-0", flip: "-scale-x-100", origin: "100% 0%", size: "w-[42%]", phase: 1.3 },
  { pos: "left-0 bottom-0", flip: "-scale-y-100", origin: "0% 100%", size: "w-[40%]", phase: 2.1 },
  { pos: "right-0 bottom-0", flip: "-scale-x-100 -scale-y-100", origin: "100% 100%", size: "w-[60%]", phase: 0.7 },
];

/**
 * The fixed watercolor frame behind every scene. An uploaded loop video or image replaces the
 * built-in art; otherwise each corner cluster sways gently on its own phase.
 */
export function FloralFrame({ config, reduced }: { config: BloomConfig; reduced: boolean }) {
  if (config.frameVideo) {
    return (
      <video
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        src={config.frameVideo}
        poster={config.frameImage || undefined}
        muted
        playsInline
        loop
        autoPlay={!reduced}
      />
    );
  }
  if (config.frameImage) {
    return <img aria-hidden alt="" src={config.frameImage} className="pointer-events-none absolute inset-0 h-full w-full object-cover" />;
  }

  return (
    <div aria-hidden className="bloom-wash pointer-events-none absolute inset-0 overflow-hidden">
      {CORNERS.map((c) => (
        <motion.div
          // Remount when the preference resolves so a started loop doesn't keep running.
          key={`${c.pos}-${reduced}`}
          className={`absolute ${c.pos} ${c.size} max-w-[300px]`}
          style={{ transformOrigin: c.origin, willChange: reduced ? undefined : "transform" }}
          animate={reduced ? undefined : { rotate: [0, SWAY.rotate], x: [0, SWAY.x], y: [0, SWAY.y] }}
          transition={{ duration: SWAY.duration, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: c.phase }}
        >
          <FrameCorner className={`block h-auto w-full ${c.flip}`} />
        </motion.div>
      ))}
    </div>
  );
}
