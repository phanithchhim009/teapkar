"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { EventConfig } from "@/lib/types";
import { Tx, useBloom } from "../BloomContext";
import { Reveal } from "../Reveal";
import { Heading, Section } from "./Heading";

export function KhqrSection({ config: c, onZoom }: { config: EventConfig; onZoom: (src: string) => void }) {
  const { t } = useBloom();
  const options = [
    { id: "usd", label: "USD", src: c.qrUsd },
    { id: "khr", label: t.riel, src: c.qrKhr },
  ].filter((o) => o.src);
  const [cur, setCur] = useState(options[0]?.id);
  const shown = options.find((o) => o.id === cur) ?? options[0];
  if (!shown) return null;

  return (
    <Section id="khqr">
      <Heading title={t.khqr} />
      {options.length > 1 && (
        <Reveal variant="fadeUpSm" className="mb-5 flex justify-center">
          <div role="tablist" aria-label="Currency" className="bloom-glass inline-flex rounded-full p-1">
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                role="tab"
                aria-selected={o.id === shown.id}
                onClick={() => setCur(o.id)}
                className="relative w-24 rounded-full py-1.5 text-sm font-semibold"
              >
                {o.id === shown.id && (
                  <motion.span layoutId="bloom-currency" className="absolute inset-0 rounded-full" style={{ background: "var(--green)" }} transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                )}
                <span className={`relative transition-colors duration-300 ${o.id === shown.id ? "text-white" : "text-[var(--green)]"}`}>
                  <Tx>{o.label}</Tx>
                </span>
              </button>
            ))}
          </div>
        </Reveal>
      )}

      <Reveal variant="fadeUpMd" className="bloom-card mx-auto max-w-[300px] p-4 text-center">
        <button type="button" onClick={() => onZoom(shown.src)} className="block w-full" aria-label={`KHQR ${shown.label}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={shown.id}
              src={shown.src}
              alt={`KHQR ${shown.label}`}
              className="mx-auto aspect-square w-full rounded-xl object-contain"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.25 }}
            />
          </AnimatePresence>
        </button>
        {(c.bankName || c.accountName || c.accountNumber) && (
          <div className="mt-3 space-y-0.5 text-sm leading-[1.8] text-[var(--green)]">
            {c.bankName && <p className="font-semibold">{c.bankName}</p>}
            {c.accountName && <p>{c.accountName}</p>}
            {c.accountNumber && <p className="tabular-nums">{c.accountNumber}</p>}
          </div>
        )}
        <p className="mt-2 text-xs leading-[1.8] text-[var(--green)]/70">
          <Tx>{t.giftNote}</Tx>
        </p>
      </Reveal>
    </Section>
  );
}
