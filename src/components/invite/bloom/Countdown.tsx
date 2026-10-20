"use client";

import { useEffect, useState } from "react";
import { diff } from "../Countdown";
import { RollingDigits } from "../RollingDigits";
import { STAGGER } from "./animations/variants";
import { Tx, useBloom } from "./BloomContext";
import { Reveal } from "./Reveal";

export function BloomCountdown({ date }: { date: string }) {
  const { t, lang } = useBloom();
  const target = new Date(date).getTime();
  const [left, setLeft] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setLeft(diff(target));
    const id = setInterval(() => setLeft(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (left?.done) return <p className="font-title text-center text-lg leading-[1.8] text-[var(--green)]">{t.started}</p>;

  const cells: [number | undefined, string][] = [
    [left?.d, t.days],
    [left?.h, t.hours],
    [left?.m, t.minutes],
    [left?.s, t.seconds],
  ];
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {cells.map(([n, label], i) => {
        const text = n === undefined ? "--" : String(n).padStart(2, "0");
        return (
          <Reveal key={i} variant="popIn" delay={i * STAGGER} className="bloom-glass-green rounded-2xl py-3 text-center text-white">
            <div className="text-2xl font-semibold tabular-nums leading-tight" aria-hidden>
              <RollingDigits text={text} lang={lang} />
            </div>
            <span className="sr-only">
              {text} {label}
            </span>
            <div className="mt-1 text-[0.7rem] leading-[1.7] opacity-90" aria-hidden>
              <Tx>{label}</Tx>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
