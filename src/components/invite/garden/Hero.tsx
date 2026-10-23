"use client";

import { motion } from "framer-motion";
import { dateParts } from "../bloom/date";
import { FlowerBed, Monogram, Valance } from "./Art";
import { EASE, useGarden } from "./ui";

type Props = {
  play: boolean;
  title: string;
  hosts: [string] | [string, string];
  altHosts: string;
  letters: string[];
  monogram: string;
  curtainImage: string;
  flowerImage: string;
  date: string | null;
};

// Same number of points open and closed, so the browser can tween the clip-path between them.
const CLOSED = "polygon(0 0, 100% 0, 100% 8%, 100% 16%, 100% 26%, 100% 36%, 100% 44%, 100% 52%, 100% 62%, 100% 74%, 100% 87%, 100% 100%, 0 100%)";
const OPEN = "polygon(0 0, 64% 0, 56% 8%, 42% 16%, 30% 26%, 22% 36%, 19% 44%, 21% 52%, 18% 62%, 15% 74%, 13% 87%, 12% 100%, 0 100%)";
/** Curtains finish opening at this point (s); the lettering follows. */
const OPENED = 1.9;

function cssUrl(u: string) {
  return `url("${u.replace(/["\\\n\r]/g, encodeURIComponent)}")`;
}

/** White silk curtains draw back onto a garden of white blossoms and the couple's names. */
export function Hero({ play, title, hosts, altHosts, letters, monogram, curtainImage, flowerImage, date }: Props) {
  const { lang } = useGarden();
  const dateLine = date ? dateParts(date, lang) : null;

  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col items-center overflow-hidden text-center">
      {/* The wall behind the curtains. */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_38%,#ffffff,#f3f2ee_60%,#e9e8e3)]" />
      {curtainImage && <div aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: cssUrl(curtainImage) }} />}

      <div className="relative z-[5] mt-[21svh] w-full px-10">
        <In play={play} delay={0}>
          <h1 className={`gd-green ${lang === "en" ? "font-[Cormorant_Garamond] text-[1.9rem] uppercase tracking-[0.08em]" : "font-title text-[1.7rem]"}`}>{title}</h1>
        </In>
        <In play={play} delay={0.25}>
          {altHosts ? (
            <p className="gd-script mt-1 text-[2.1rem] leading-tight">{altHosts}</p>
          ) : (
            <p className="gd-green font-title mt-1 text-[1.4rem]">{hosts.join(" & ")}</p>
          )}
        </In>
        <In play={play} delay={0.5} zoom>
          <Monogram letters={letters} image={monogram} className="gd-green mx-auto my-6 h-28 w-auto text-[5.2rem]" />
        </In>
        {dateLine && (
          <In play={play} delay={0.75}>
            <p className="font-[Cormorant_Garamond] text-[1.05rem] tracking-[0.18em] text-[var(--gd-ink)]/75">
              {dateLine.day} . {dateLine.month.replace(/^ខែ/, "")} . {dateLine.year.replace(/^ឆ្នាំ/, "")}
            </p>
          </In>
        )}
      </div>

      {/* Flowers rise from the bottom as the curtains part. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[34%]"
        initial={{ y: "45%", opacity: 0 }}
        animate={play ? { y: "0%", opacity: 1 } : { y: "45%", opacity: 0 }}
        transition={{ duration: 1.8, ease: EASE, delay: 0.6 }}
      >
        {flowerImage ? <img src={flowerImage} alt="" className="absolute inset-x-0 bottom-0 h-full w-full object-cover object-bottom" /> : <FlowerBed className="absolute inset-0 h-full w-full" />}
      </motion.div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-8 bg-gradient-to-b from-transparent to-white/70" />

      {/* Curtains. */}
      {!curtainImage && (
        <>
          {[0, 1].map((i) => (
            <div key={i} aria-hidden className={`pointer-events-none absolute inset-y-0 z-[3] w-1/2 drop-shadow-[0_0_14px_rgb(80_80_70/0.22)] ${i ? "right-0 -scale-x-100" : "left-0"}`}>
              <div className={`gd-curtain h-full w-full ${play ? "gd-curtain-open" : ""}`} style={{ clipPath: play ? OPEN : CLOSED }} />
            </div>
          ))}
          <Valance className="pointer-events-none absolute inset-x-0 top-0 z-[4] h-[13svh] w-full drop-shadow-[0_4px_6px_rgb(80_80_70/0.18)]" />
        </>
      )}
    </section>
  );
}

function In({ play, delay, zoom = false, children }: { play: boolean; delay: number; zoom?: boolean; children: React.ReactNode }) {
  const from = zoom ? { opacity: 0, scale: 0.7 } : { opacity: 0, y: 18 };
  return (
    <motion.div initial={from} animate={play ? { opacity: 1, y: 0, scale: 1 } : from} transition={{ duration: 1.1, ease: EASE, delay: play ? OPENED * 0.55 + delay : 0 }}>
      {children}
    </motion.div>
  );
}
