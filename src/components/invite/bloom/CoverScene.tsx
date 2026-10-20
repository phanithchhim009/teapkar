"use client";

import { motion } from "framer-motion";
import { COVER, coverItem, EASE } from "./animations/variants";
import { GoldText, Tx, useBloom } from "./BloomContext";
import { NameFrame } from "./FlowerArt";
import { LangToggle } from "./FloatingControls";

type Props = {
  leaving: boolean;
  title: string;
  guestName: string;
  monogram: React.ReactNode;
  onOpen: () => void;
  onLang: () => void;
};

/** Cover items in exit order (top to bottom); the index drives both the entrance and the exit cascade. */
export const COVER_ITEMS = 5;

export function CoverScene({ leaving, title, guestName, monogram, onOpen, onLang }: Props) {
  const { t, lang, reduced } = useBloom();
  const item = (i: number) => ({ variants: coverItem, custom: i, initial: "hidden", animate: leaving ? "exit" : "show" }) as const;

  return (
    <motion.section
      className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 pb-10 pt-16 text-center"
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <motion.div
        className="absolute left-4 top-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <LangToggle lang={lang} onToggle={onLang} />
      </motion.div>

      <motion.div {...item(0)} className="mb-4 w-24">
        {monogram}
      </motion.div>

      <motion.div {...item(1)}>
        <GoldText as="h1" className="bloom-title text-[1.65rem]">
          {title}
        </GoldText>
      </motion.div>

      <motion.div {...item(2)} className="mt-4">
        <GoldText className="text-sm">{t.dear}</GoldText>
      </motion.div>

      <motion.div {...item(3)} className="relative mt-4 w-full max-w-[300px] px-6 py-5">
        <NameFrame className="absolute inset-0 h-full w-full" />
        <p className="font-title relative text-lg leading-[1.8]" style={{ color: "var(--guest)" }}>
          {guestName}
        </p>
      </motion.div>

      <motion.div {...item(4)} className="mt-10">
        <motion.button
          type="button"
          onClick={onOpen}
          disabled={leaving}
          className="bloom-pill px-8 py-3 text-sm font-semibold"
          animate={reduced || leaving ? undefined : { scale: [1, COVER.breatheScale, 1] }}
          transition={{ duration: COVER.breatheDuration, ease: "easeInOut", repeat: Infinity }}
        >
          <Tx>{t.tapToOpen}</Tx>
        </motion.button>
      </motion.div>
    </motion.section>
  );
}
