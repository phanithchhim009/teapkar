"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { unoptimized } from "../../media";
import { PARALLAX } from "../animations/variants";
import { useBloom } from "../BloomContext";
import { Reveal } from "../Reveal";
import { Heading, Section } from "./Heading";

/** Repeating rhythm: 1 wide, 2 tall side by side, 1 wide. A tall photo left alone in its pair goes wide. */
function isWide(i: number, count: number) {
  const pos = i % 4;
  if (pos === 0 || pos === 3) return true;
  return pos === 1 && i === count - 1;
}

function Photo({ src, wide, onOpen }: { src: string; wide: boolean; onOpen: () => void }) {
  const { t, scrollRef, reduced, intensity } = useBloom();
  const ref = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef, target: ref, offset: ["start end", "end start"] });
  const travel = reduced ? 0 : intensity === "subtle" ? PARALLAX / 2 : PARALLAX;
  const y = useTransform(scrollYProgress, [0, 1], [-travel, travel]);

  return (
    <button ref={ref} type="button" onClick={onOpen} className="relative block w-full overflow-hidden rounded-2xl shadow-sm" aria-label={t.viewPhoto}>
      {/* Oversized by the parallax travel so the edges never show. */}
      <motion.div className={`relative ${wide ? "aspect-[4/3]" : "aspect-[3/4]"}`} style={{ y, scale: travel ? 1.12 : 1 }}>
        <Image
          src={src}
          alt=""
          fill
          loading="lazy"
          unoptimized={unoptimized(src)}
          sizes={wide ? "(max-width: 512px) 100vw, 512px" : "(max-width: 512px) 50vw, 256px"}
          className="object-cover"
        />
      </motion.div>
    </button>
  );
}

export function GallerySection({ photos, onOpen }: { photos: string[]; onOpen: (src: string) => void }) {
  const { t } = useBloom();
  return (
    <Section id="gallery" className="px-4">
      <Heading title={t.gallery} />
      <div className="grid grid-cols-2 gap-3">
        {photos.map((src, i) => {
          const wide = isWide(i, photos.length);
          return (
            <Reveal key={src + i} variant="fadeUpMd" delay={wide ? 0 : (i % 4 === 2 ? 1 : 0) * 0.12} className={wide ? "col-span-2" : ""}>
              <Photo src={src} wide={wide} onOpen={() => onOpen(src)} />
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
