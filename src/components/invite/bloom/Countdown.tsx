"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { diff } from "../Countdown";
import { khDigits } from "./date";
import { STAGGER } from "./animations/variants";
import { Tx, useBloom } from "./BloomContext";
import { Reveal } from "./Reveal";

/** One digit that slides up out of its slot when it changes. */
function Digit({ value }: { value: string }) {
  return (
    <span className="relative inline-block h-[1.2em] w-[0.62em] overflow-hidden align-top">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          className="absolute inset-0 text-center"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function BloomCountdown({ date }: { date: string }) {
  const { t, lang } = useBloom();
  const target = new Date(date).getTime();
  const [left, setLeft] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setLeft(diff(target));
    const id = setInterval(() => setLeft(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (left?.done) return <p className="font-title text-center text-lg leading-[1.8] text-[var(--green)]">{t.started}</p>;

  const cells: [number | undefined, string][] = [
    [left?.d, t.days],
    [left?.h, t.hours],
    [left?.m, t.minutes],
    [left?.s, t.seconds],
  ];
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {cells.map(([n, label], i) => {
        const text = n === undefined ? "--" : String(n).padStart(2, "0");
        const shown = lang === "kh" ? khDigits(text) : text;
        return (
          <Reveal key={i} variant="popIn" delay={i * STAGGER} className="bloom-glass-green rounded-2xl py-3 text-center text-white">
            <div className="text-2xl font-semibold tabular-nums leading-tight" aria-hidden>
              {Array.from(shown).map((ch, j) => (
                <Digit key={j} value={ch} />
              ))}
            </div>
            <span className="sr-only">
              {text} {label}
            </span>
            <div className="mt-1 text-[0.7rem] leading-[1.7] opacity-90" aria-hidden>
              <Tx>{label}</Tx>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
