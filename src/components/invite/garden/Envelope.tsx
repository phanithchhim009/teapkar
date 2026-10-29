"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Damask, Monogram, WaxSeal } from "./Art";
import { EASE, useGarden } from "./ui";

/** ms from the tap: seal lifts → flap opens → envelope falls away → done. */
const STEPS = [0, 420, 1250, 1900] as const;
const FLAP = "polygon(0 0, 100% 0, 100% 46%, 50% 100%, 0 46%)";

type Props = {
  title: string;
  letters: string[];
  monogram: string;
  greeting: string;
  guestName: string;
  onOpen: () => void;
  onDone: () => void;
};

/**
 * The cover: a full-screen white damask envelope with a pearl wax seal at the tip of its flap.
 * Tapping lifts the seal, opens the flap upward and lets the envelope fall away to the curtains.
 */
export function Envelope({ title, letters, monogram, greeting, guestName, onOpen, onDone }: Props) {
  const { t } = useGarden();
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const open = () => {
    if (step) return;
    onOpen();
    if (reduced) return onDone();
    setStep(1);
    timers.current.push(setTimeout(() => setStep(2), STEPS[1]));
    timers.current.push(setTimeout(() => setStep(3), STEPS[2]));
    timers.current.push(setTimeout(onDone, STEPS[3]));
  };

  return (
    <motion.section
      // Clear once the envelope starts to fall, so the curtains behind show through.
      className={`fixed inset-0 z-50 mx-auto max-w-[480px] overflow-hidden transition-colors duration-500 [perspective:1600px] ${step >= 3 ? "bg-transparent" : "bg-[var(--gd-ivory)]"}`}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      {/* Body of the envelope. */}
      <motion.div
        className="absolute inset-0"
        animate={step >= 3 ? { y: "18%", opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.5, 0, 0.75, 0] }}
      >
        <div className="gd-paper absolute inset-0" />
        <Damask opacity={0.55} />

        <motion.div
          className="absolute inset-x-0 bottom-0 top-[60%] flex flex-col items-center justify-center px-8 pb-6 text-center"
          animate={step >= 1 ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}>
            <p className="gd-green font-title text-[1.05rem]">{greeting}</p>
            <p className="font-title mt-1 text-[1.3rem]" style={{ color: "var(--guest)" }}>
              {guestName}
            </p>
            <button type="button" onClick={open} className="gd-btn mt-5 px-9 py-2.5 text-[0.95rem]">
              {t.open}
            </button>
            <motion.p className="mt-3 text-[0.72rem] text-[var(--gd-ink)]/60" animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 2.4, repeat: Infinity }}>
              {t.tapToOpen}
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Flap: hinges at the top edge and opens away from the guest. */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[60%] [transform-style:preserve-3d]"
        style={{ transformOrigin: "50% 0%" }}
        initial={{ y: "-6%", opacity: 0 }}
        animate={step >= 2 ? { rotateX: 178, opacity: 0, y: 0 } : { rotateX: 0, opacity: 1, y: 0 }}
        transition={step >= 2 ? { duration: 1, ease: [0.45, 0, 0.2, 1] } : { duration: 1, ease: EASE }}
      >
        <div className="absolute inset-0 drop-shadow-[0_10px_14px_rgb(60_55_40/0.22)] [backface-visibility:hidden]">
          <div className="gd-paper absolute inset-0" style={{ clipPath: FLAP }}>
            <Damask />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
              <path d="M0 46L50 100 100 46" fill="none" stroke="#d5d0c4" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        </div>
        <motion.p
          className="gd-green font-title absolute inset-x-0 top-[50%] px-6 text-center text-[1.55rem] [backface-visibility:hidden]"
          initial={{ opacity: 0, y: 12 }}
          animate={step >= 1 ? { opacity: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: step >= 1 ? 0.35 : 1, ease: EASE, delay: step >= 1 ? 0 : 0.4 }}
        >
          {title}
        </motion.p>
      </motion.div>

      {/* Seal at the tip of the flap. */}
      <motion.button
        type="button"
        onClick={open}
        aria-label={t.open}
        className="absolute left-1/2 top-[60%] z-10 w-[27%] max-w-[130px] -translate-x-1/2 -translate-y-1/2 cursor-pointer"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={step >= 1 ? { opacity: 0, scale: 1.25, y: -30 } : { opacity: 1, scale: [1, 1.04, 1] }}
        transition={step >= 1 ? { duration: 0.5, ease: "easeOut" } : { opacity: { duration: 0.8, delay: 0.5 }, scale: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } }}
      >
        <WaxSeal>
          <Monogram letters={letters} image={monogram} className="h-full max-h-full w-full text-[2.1rem]" />
        </WaxSeal>
      </motion.button>
    </motion.section>
  );
}
