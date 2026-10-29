"use client";

import { motion } from "framer-motion";
import { KbachDivider } from "./angkor/Ornaments";

export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({ children, angkor = false }: { children: React.ReactNode; angkor?: boolean }) {
  // Script fonts are unreadable in ALL CAPS, so fall back to the heading font.
  const caps = typeof children === "string" && /[A-Z]/.test(children) && children === children.toUpperCase();
  return (
    <div className="mb-6 text-center">
      {!angkor && <Flourish />}
      <h2 className={`${caps ? "font-heading tracking-widest" : "font-title"} text-xl leading-relaxed`} style={{ color: "var(--primary)" }}>
        {children}
      </h2>
      {angkor ? (
        <KbachDivider className="mx-auto mt-2 h-7 w-56" style={{ color: "var(--primary)" }} />
      ) : (
        <div className="divider mx-auto mt-3 w-40" />
      )}
    </div>
  );
}

export function Flourish({ className = "mx-auto mb-2 h-4 w-28" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 16" className={className} fill="none" stroke="var(--primary)" strokeWidth="1" strokeLinecap="round">
      <path d="M6 8 Q 30 1 52 8" />
      <path d="M68 8 Q 90 1 114 8" />
      <path d="M18 9.5 Q 34 13 48 10" opacity="0.5" />
      <path d="M72 10 Q 86 13 102 9.5" opacity="0.5" />
      <path d="M60 3 L65 8 L60 13 L55 8 Z" fill="var(--primary)" />
    </svg>
  );
}
