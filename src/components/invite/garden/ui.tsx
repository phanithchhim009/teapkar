"use client";

import { motion } from "framer-motion";
import { createContext, useContext } from "react";
import type { Labels, Lang } from "../i18n";
import { Sprig } from "./Art";

export const EASE = [0.22, 1, 0.36, 1] as const;

type Ctx = { lang: Lang; t: Labels };
const GardenCtx = createContext<Ctx | null>(null);
export const GardenProvider = GardenCtx.Provider;
export function useGarden() {
  const ctx = useContext(GardenCtx);
  if (!ctx) throw new Error("useGarden must be used inside <GardenProvider>");
  return ctx;
}

const FROM = {
  up: { opacity: 0, y: 34 },
  fade: { opacity: 0 },
  zoom: { opacity: 0, scale: 0.92 },
  left: { opacity: 0, x: -26 },
  right: { opacity: 0, x: 26 },
} as const;
export type From = keyof typeof FROM;

/** Fades in once when it scrolls into view. */
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
  from?: From;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={FROM[from]}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Green section title with a leaf sprig under it. */
export function Heading({ children, icon, className = "" }: { children: React.ReactNode; icon?: React.ReactNode; className?: string }) {
  return (
    <Reveal className={`mb-7 text-center ${className}`}>
      <h2 className="gd-green font-title inline-flex items-center gap-2 text-[1.45rem]">
        {icon}
        {children}
      </h2>
      <Sprig className="gd-green mx-auto mt-1 h-3 w-36 opacity-70" />
    </Reveal>
  );
}

export function Section({ id, className = "", children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={`relative px-6 py-14 ${className}`}>
      {children}
    </section>
  );
}
