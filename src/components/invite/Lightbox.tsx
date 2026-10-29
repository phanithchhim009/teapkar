"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";

export type Zoom = { images: string[]; index: number } | null;

type Props =
  | { zoom: Zoom; onChange: (z: Zoom) => void }
  /** A single photo, as the Bloom, Lotus and Garden themes use it. */
  | { src: string | null; onClose: () => void };

/** Full-screen photo viewer. Swipe, arrow keys or the side buttons page through `images`. */
export function Lightbox(props: Props) {
  const { zoom, onChange } =
    "zoom" in props
      ? props
      : { zoom: props.src ? { images: [props.src], index: 0 } : null, onChange: (z: Zoom) => !z && props.onClose() };
  const count = zoom?.images.length ?? 0;
  const go = (d: -1 | 1) => zoom && count > 1 && onChange({ ...zoom, index: (zoom.index + d + count) % count });
  const close = () => onChange(null);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onChange(null);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  });

  const src = zoom?.images[zoom.index];

  return (
    <AnimatePresence>
      {zoom && src && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur" aria-label="Close" onClick={close}>
            <X size={24} />
          </button>

          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={src + zoom.index}
              src={src}
              alt=""
              draggable={false}
              className="max-h-full max-w-full touch-pan-y select-none rounded-lg object-contain"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              drag={count > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(1);
                else if (info.offset.x > 60) go(-1);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </AnimatePresence>

          {count > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
              >
                <ChevronLeft size={26} />
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
              >
                <ChevronRight size={26} />
              </button>
              <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs tabular-nums text-white backdrop-blur">
                {zoom.index + 1} / {count}
              </p>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
