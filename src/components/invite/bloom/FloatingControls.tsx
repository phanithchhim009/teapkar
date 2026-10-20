"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { CONTROLS, EASE } from "./animations/variants";
import { useBloom } from "./BloomContext";
import type { Lang } from "../i18n";

const enter = (from: { x?: number; y?: number }, delay = 0) => ({
  initial: { opacity: 0, ...from },
  animate: { opacity: 1, x: 0, y: 0 },
  transition: { duration: CONTROLS.duration, ease: EASE, delay },
});

/** ខ្មែរ / EN pill with a sliding dot under the active language. */
export function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="bloom-glass relative flex h-9 items-center rounded-full px-1 text-xs font-semibold" aria-label="Switch language / ប្តូរភាសា">
      <span
        aria-hidden
        className="absolute top-1 h-7 w-[3.25rem] rounded-full transition-transform duration-300 ease-out"
        style={{ background: "var(--green)", transform: `translateX(${lang === "kh" ? 0 : "100%"})` }}
      />
      {(["kh", "en"] as const).map((l) => (
        <span key={l} className={`relative z-10 w-[3.25rem] text-center transition-colors duration-300 ${lang === l ? "text-white" : "text-[var(--green)]"}`}>
          {l === "kh" ? "ខ្មែរ" : "EN"}
        </span>
      ))}
    </button>
  );
}

type Props = { lang: Lang; onLang: () => void; hasMusic: boolean; playing: boolean; onMusic: () => void };

/** Language + music (top) and scroll-to-top (bottom right), slid in once the invitation is open. */
export function FloatingControls({ lang, onLang, hasMusic, playing, onMusic }: Props) {
  const { t, scrollRef, reduced } = useBloom();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Show once the first (hero) section has scrolled away.
    const onScroll = () => setShowTop(el.scrollTop > el.clientHeight * 0.9);
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  return (
    <>
      <motion.div className="absolute left-4 top-4 z-30" {...enter({ x: CONTROLS.langX })}>
        <LangToggle lang={lang} onToggle={onLang} />
      </motion.div>

      {hasMusic && (
        <motion.button
          type="button"
          onClick={onMusic}
          aria-label={t.music}
          aria-pressed={playing}
          className="bloom-glass absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full text-[var(--green)]"
          {...enter({ x: CONTROLS.musicX })}
        >
          {playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </motion.button>
      )}

      <motion.div className="absolute bottom-24 right-4 z-30" {...enter({ y: CONTROLS.topY }, CONTROLS.topExtraDelay)}>
        <AnimatePresence>
          {showTop && (
            <motion.button
              type="button"
              aria-label={t.toTop}
              onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
              className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg"
              style={{ background: "var(--green)" }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              // Framer owns this element's transform, so hover scale goes through it rather than a CSS class.
              whileHover={{ scale: 1.1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25 }}
            >
              <ChevronUp size={22} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
