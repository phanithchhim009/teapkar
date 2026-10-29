"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CornerFlourish, flapPath, LotusIcon, WaxSeal } from "./Art";
import { EASE, useLotus } from "./ui";

const FLAP = flapPath(300, 124);
export const CORNERS = ["left-3 top-3", "right-3 top-3 -scale-x-100", "bottom-3 left-3 -scale-y-100", "bottom-3 right-3 -scale-x-100 -scale-y-100"] as const;
/** ms from the tap to each step: seal pops → flap opens → card rises → card zooms → done. */
const STEPS = [0, 380, 1150, 2050, 2900] as const;

type Props = {
  title: string;
  subtitle: string;
  hosts: [string] | [string, string];
  monogram: string;
  background: string;
  greeting: string;
  guestName: string;
  onOpen: () => void;
  onDone: () => void;
};

/**
 * The cover: an olive envelope sealed with a gold lotus. Tapping it breaks the seal, opens the
 * scalloped flap, lifts the name card out and zooms it toward the guest before the page shows.
 */
export function Envelope({ title, subtitle, hosts, monogram, background, greeting, guestName, onOpen, onDone }: Props) {
  const { t } = useLotus();
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const open = () => {
    if (step) return;
    onOpen();
    if (reduced) {
      onDone();
      return;
    }
    setStep(1);
    STEPS.slice(2).forEach((ms, i) => timers.current.push(setTimeout(() => setStep(i + 2), ms)));
    timers.current.push(setTimeout(onDone, STEPS[4] + 650));
  };

  const shell = step >= 4 ? { opacity: 0, y: 70 } : { opacity: 1, y: 0 };

  return (
    <motion.section
      className="fixed inset-0 z-50 mx-auto flex max-w-[480px] flex-col items-center justify-center overflow-hidden bg-[#121310] px-6"
      exit={{ opacity: 0, filter: "blur(8px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Blurred, darkened couple photo behind everything. */}
      {background && (
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${background.replace(/["\\\n\r]/g, encodeURIComponent)}")`, filter: "blur(4px) brightness(0.32) saturate(0.8)" }}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 12, ease: "easeOut" }}
        />
      )}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_45%,transparent,rgb(0_0_0/0.65))]" />
      {CORNERS.map((c) => (
        <CornerFlourish key={c} className={`absolute h-16 w-16 text-[var(--lt-gold)] opacity-60 ${c}`} />
      ))}

      <motion.div className="relative z-10 mb-10 text-center" animate={step >= 3 ? { opacity: 0, y: -30 } : { opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <motion.p
          className="lt-gold font-title text-[1.55rem] leading-[1.9]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.2 }}
        >
          {title}
        </motion.p>
        {subtitle && (
          <motion.p
            className="font-[Cormorant_Garamond] text-lg italic tracking-wide text-[#f4ead2]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>

      {/* ---------- Envelope ---------- */}
      <motion.button
        type="button"
        onClick={open}
        aria-label={t.open}
        className="relative z-10 block aspect-[3/2] w-full max-w-[380px] cursor-pointer [perspective:1400px]"
        initial={{ opacity: 0, y: 40, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
      >
        {/* Back of the envelope (the inside you see once the flap lifts). */}
        <motion.div className="absolute inset-0 rounded-[5px] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)]" style={{ background: "color-mix(in srgb, var(--lt-olive) 78%, #000)" }} animate={shell} transition={{ duration: 0.7 }} />

        {/* Name card. */}
        <motion.div
          className="lt-card absolute inset-x-[5%] bottom-[4%] top-[5%] z-10 flex flex-col items-center justify-center rounded-[3px] px-6"
          animate={
            step >= 4
              ? { y: "-30%", scale: 1.32 }
              : step >= 3
                ? { y: "-56%", scale: 1 }
                : { y: "0%", scale: 1 }
          }
          transition={{ duration: step >= 4 ? 0.85 : 0.9, ease: EASE }}
        >
          <div aria-hidden className="absolute inset-[6px] rounded-[2px] border border-[var(--lt-gold)]/60" />
          {monogram ? (
            <img src={monogram} alt="" className="max-h-[78%] max-w-[80%] object-contain" />
          ) : (
            <>
              <LotusIcon className="h-7 w-12 text-[var(--lt-gold-deep)]" />
              <span className="lt-gold-ink font-title mt-1 self-start pl-[12%] text-[1.35rem] leading-[1.8]">{hosts[0]}</span>
              {hosts[1] && (
                <>
                  <span aria-hidden className="my-0.5 h-px w-[46%] bg-gradient-to-r from-transparent via-[var(--lt-gold-deep)] to-transparent" />
                  <span className="lt-gold-ink font-title self-end pr-[12%] text-[1.35rem] leading-[1.8]">{hosts[1]}</span>
                </>
              )}
            </>
          )}
        </motion.div>

        {/* Front pocket with diagonal folds. */}
        <motion.svg viewBox="0 0 300 200" preserveAspectRatio="none" className="absolute inset-0 z-20 h-full w-full" aria-hidden animate={shell} transition={{ duration: 0.7 }}>
          <path d="M0,0 L150,116 L300,0 L300,200 L0,200Z" fill="var(--lt-olive)" />
          <path d="M0,200 L150,116 L300,200" fill="none" stroke="#000" strokeOpacity={0.18} strokeWidth={1} />
          <path d="M0,0 L150,116 L0,200Z" fill="#fff" fillOpacity={0.035} />
        </motion.svg>

        {/* Flap: olive outside with a gold scalloped edge, cream inside. */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[62%] [transform-style:preserve-3d]"
          style={{ transformOrigin: "50% 0%", zIndex: step >= 3 ? 5 : 30 }}
          animate={step >= 4 ? { rotateX: 180, opacity: 0 } : { rotateX: step >= 2 ? 180 : 0, opacity: 1 }}
          transition={{ duration: step >= 4 ? 0.5 : 0.85, ease: [0.45, 0, 0.2, 1] }}
        >
          <svg viewBox="0 0 300 124" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible [backface-visibility:hidden]" aria-hidden>
            <path d={FLAP} fill="var(--lt-olive)" style={{ filter: "drop-shadow(0 4px 4px rgb(0 0 0 / 0.3))" }} />
            <path d={FLAP} fill="none" stroke="var(--lt-gold)" strokeWidth={2.2} />
          </svg>
          <svg
            viewBox="0 0 300 124"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible [backface-visibility:hidden] [transform:rotateX(180deg)]"
            aria-hidden
          >
            <path d={FLAP} transform="translate(0 124) scale(1 -1)" fill="var(--lt-cream)" />
          </svg>
        </motion.div>

        {/* Wax seal. */}
        <motion.span
          className="absolute -right-[5%] top-[20%] z-40 block w-[22%]"
          animate={step >= 1 ? { scale: 1.35, opacity: 0, rotate: 30 } : { scale: [1, 1.06, 1], rotate: [0, -3, 0] }}
          transition={step >= 1 ? { duration: 0.45, ease: "easeOut" } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span aria-hidden className="absolute inset-[-25%] rounded-full bg-[radial-gradient(circle,rgb(255_220_140/0.45),transparent_65%)]" />
          <WaxSeal className="relative h-auto w-full drop-shadow-[0_6px_8px_rgb(0_0_0/0.5)]" />
        </motion.span>
      </motion.button>

      <motion.div className="relative z-10 mt-10 w-full text-center" animate={step >= 1 ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.8 }}>
          <p className="text-sm text-[#efe5cc]/85">{greeting}</p>
          <p className="font-title mt-1 text-xl leading-[1.9]" style={{ color: "var(--guest)" }}>
            {guestName}
          </p>
          <motion.p
            className="mt-5 text-xs tracking-wide text-[#efe5cc]/70"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            {t.tapSeal}
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
