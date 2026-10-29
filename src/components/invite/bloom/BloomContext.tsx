"use client";

import { motion } from "framer-motion";
import { createContext, useContext, type RefObject } from "react";
import type { BloomConfig } from "@/lib/types";
import { LANG_FADE } from "./animations/variants";
import type { Labels, Lang } from "../i18n";

type BloomCtx = {
  lang: Lang;
  t: Labels;
  reduced: boolean;
  revealMode: BloomConfig["revealMode"];
  intensity: BloomConfig["intensity"];
  /** The inner scroll container: viewport root for reveals, scroll-spy and parallax. */
  scrollRef: RefObject<HTMLDivElement | null>;
};

const Ctx = createContext<BloomCtx | null>(null);
export const BloomProvider = Ctx.Provider;

export function useBloom() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBloom must be used inside <BloomProvider>");
  return ctx;
}

/** Text that cross-fades on KH/EN switch without remounting (and so replaying) the reveal around it. */
export function Tx({ children, className }: { children: React.ReactNode; className?: string }) {
  const { lang } = useBloom();
  return (
    <motion.span key={lang} className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: LANG_FADE }}>
      {children}
    </motion.span>
  );
}

/** Gold gradient lettering (colour stops come from the --gold-* variables). */
export function GoldText({ as: Tag = "p", className = "", children }: { as?: "p" | "h1" | "h2" | "span"; className?: string; children: React.ReactNode }) {
  return (
    <Tag className={`font-title ${className}`}>
      {/* The clip goes on the span itself: Chrome drops clipped text whose child has its own opacity layer. */}
      <Tx className="bloom-gold inline-block">{children}</Tx>
    </Tag>
  );
}
