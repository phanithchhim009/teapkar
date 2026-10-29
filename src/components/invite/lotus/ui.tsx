"use client";

import { motion } from "framer-motion";
import { createContext, useContext } from "react";
import type { Labels, Lang } from "../i18n";
import { GoldRule, LotusIcon } from "./Art";

export const EASE = [0.22, 1, 0.36, 1] as const;

type Ctx = { lang: Lang; t: Labels };
const LotusCtx = createContext<Ctx | null>(null);
export const LotusProvider = LotusCtx.Provider;
export function useLotus() {
  const ctx = useContext(LotusCtx);
  if (!ctx) throw new Error("useLotus must be used inside <LotusProvider>");
  return ctx;
}

const FROM = {
  up: { opacity: 0, y: 36 },
  fade: { opacity: 0 },
  zoom: { opacity: 0, scale: 0.9 },
  left: { opacity: 0, x: -28 },
  right: { opacity: 0, x: 28 },
} as const;

/** Animates in once when it scrolls into view. */
export function Reveal({
  children,
  className,
  style,
  delay = 0,
  from = "up",
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  from?: keyof typeof FROM;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={FROM[from]}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Gold gradient lettering with a slow shimmer. */
export function Gold({ as: Tag = "span", className = "", children }: { as?: "span" | "p" | "h1" | "h2" | "h3"; className?: string; children: React.ReactNode }) {
  return <Tag className={`lt-gold ${className}`}>{children}</Tag>;
}

/** Section heading: gold title, optional lotus above and a ruled diamond below. */
export function Heading({ children, lotus = false, className = "" }: { children: React.ReactNode; lotus?: boolean; className?: string }) {
  return (
    <Reveal className={`mb-8 text-center ${className}`}>
      {lotus && <LotusIcon className="mx-auto mb-2 h-6 w-11 text-[var(--lt-gold)]" />}
      <Gold as="h2" className="font-title text-[1.6rem]">
        {children}
      </Gold>
      <GoldRule className="mx-auto mt-2 h-3 w-40 text-[var(--lt-gold)] opacity-80" />
    </Reveal>
  );
}

export function Section({
  id,
  tone,
  className = "",
  style,
  children,
}: {
  id?: string;
  tone: "cream" | "olive" | "night" | "deep";
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`lt-${tone} relative overflow-hidden px-6 py-16 ${className}`} style={style}>
      {children}
    </section>
  );
}
