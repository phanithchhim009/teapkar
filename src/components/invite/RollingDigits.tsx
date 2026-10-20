"use client";

import { AnimatePresence, motion } from "framer-motion";
import { khDigits } from "./bloom/date";
import type { Lang } from "./i18n";

/** One digit that slides up out of its slot when it changes. */
function Digit({ value, lang }: { value: string; lang: Lang }) {
  // Fixed width so the number doesn't shift as digits change; Khmer digits are up to 0.861em wide.
  const size = lang === "kh" ? "h-[1.2em] w-[0.9em]" : "h-[1.2em] w-[0.62em]";
  return (
    <span className={`relative inline-block overflow-hidden align-top ${size}`}>
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

/** A number whose digits roll individually, shown in Khmer numerals for `kh`. */
export function RollingDigits({ text, lang }: { text: string; lang: Lang }) {
  const shown = lang === "kh" ? khDigits(text) : text;
  return (
    <>
      {Array.from(shown).map((ch, j) => (
        <Digit key={j} value={ch} lang={lang} />
      ))}
    </>
  );
}
