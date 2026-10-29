"use client";

import { Heart } from "lucide-react";
import Image from "next/image";
import type { StoryItem } from "@/lib/types";
import type { Lang } from "./i18n";
import type { Zoom } from "./Lightbox";
import { unoptimized } from "./media";
import { Reveal } from "./Reveal";

/** The couple's story as a vertical timeline, one card per chapter. */
export function Story({ items, lang, onZoom }: { items: StoryItem[]; lang: Lang; onZoom: (z: Zoom) => void }) {
  // Fall back to the other language so a chapter filled in only once still shows.
  const pick = (kh: string, en: string) => (lang === "kh" ? kh || en : en || kh);
  const photos = items.map((it) => it.photo).filter(Boolean);

  return (
    <div className="relative space-y-8 pl-9">
      <span
        aria-hidden
        className="absolute bottom-0 left-[11px] top-3 w-px"
        style={{ background: "linear-gradient(var(--primary), color-mix(in srgb, var(--primary) 10%, transparent))" }}
      />
      {items.map((it, i) => {
        const title = pick(it.title_kh, it.title_en);
        const text = pick(it.text_kh, it.text_en);
        return (
          <Reveal key={it.id || i} className="relative">
            <span
              aria-hidden
              className="absolute -left-9 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm"
              style={{ border: "1px solid var(--primary)" }}
            >
              <Heart size={12} fill="var(--primary)" stroke="var(--primary)" />
            </span>
            {it.date && (
              <p className="font-heading mb-2 inline-block rounded-full px-3 py-0.5 text-xs text-white" style={{ background: "var(--primary)" }}>
                {it.date}
              </p>
            )}
            <div className="card overflow-hidden">
              {it.photo && (
                <button onClick={() => onZoom({ images: photos, index: photos.indexOf(it.photo) })} className="block w-full overflow-hidden">
                  <Image
                    src={it.photo}
                    alt={title}
                    unoptimized={unoptimized(it.photo)}
                    width={880}
                    height={660}
                    sizes="(max-width: 480px) 90vw, 420px"
                    className="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105"
                  />
                </button>
              )}
              {(title || text) && (
                <div className="space-y-2 p-4">
                  {title && (
                    <p className="font-heading text-base leading-relaxed" style={{ color: "var(--primary)" }}>
                      {title}
                    </p>
                  )}
                  {text && <p className="whitespace-pre-line text-sm leading-7">{text}</p>}
                </div>
              )}
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
