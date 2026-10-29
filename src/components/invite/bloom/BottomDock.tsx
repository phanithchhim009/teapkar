"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { CONTROLS, EASE } from "./animations/variants";
import { useBloom } from "./BloomContext";

export type DockItem = { id: string; icon: LucideIcon; label: string };

/** Floating glass nav. Scroll-spy marks the section crossing the middle of the scroll container. */
export function BottomDock({ items }: { items: DockItem[] }) {
  const { scrollRef, reduced } = useBloom();
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      // A thin band across the middle of the viewport: whichever section covers it is "current".
      { root, rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    for (const it of items) {
      const el = root.querySelector(`#${it.id}`);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [items, scrollRef]);

  const go = (id: string) => {
    const root = scrollRef.current;
    const el = root?.querySelector<HTMLElement>(`#${id}`);
    if (!root || !el) return;
    root.scrollTo({ top: el.offsetTop, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <motion.nav
      aria-label="Sections"
      className="absolute inset-x-0 bottom-4 z-30 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-1 rounded-full bg-white/75 p-1.5 shadow-[0_8px_30px_-12px_rgba(67,101,47,0.45)] ring-1 ring-white/60 backdrop-blur-md"
      initial={{ opacity: 0, y: CONTROLS.dockY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: CONTROLS.duration, ease: EASE }}
    >
      {items.map(({ id, icon: Icon, label }) => {
        const on = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => go(id)}
            aria-label={label}
            aria-current={on ? "true" : undefined}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          >
            {on && (
              <motion.span
                layoutId="bloom-dock-active"
                className="absolute inset-0 rounded-full"
                style={{ background: "var(--green)" }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <Icon size={18} className={`relative z-10 transition-colors duration-300 ${on ? "text-white" : "text-[var(--green)]"}`} />
            {on && (
              <span aria-hidden className="absolute right-0.5 top-0.5 z-20 flex h-2.5 w-2.5">
                {!reduced && <span className="absolute inset-0 animate-ping rounded-full bg-[var(--gold-from)] opacity-75" />}
                <span className="relative h-2.5 w-2.5 rounded-full border border-white bg-[var(--gold-to)]" />
              </span>
            )}
          </button>
        );
      })}
    </motion.nav>
  );
}
