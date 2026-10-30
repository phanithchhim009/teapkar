import type { Labels, Lang } from "./i18n";
import { khNum } from "./SaveTheDate";

/** Confetti colours for the Party style: raspberry, sun, sky, mint, lilac. */
export const CONFETTI = ["#f06292", "#ffb300", "#4fc3f7", "#81c784", "#ba68c8"];

/** Three balloons on curly strings, drawn in the confetti colours. */
export function Balloons({ className = "" }: { className?: string }) {
  const balloons = [
    { cx: 38, cy: 42, r: 22, color: CONFETTI[0], tilt: -8 },
    { cx: 70, cy: 30, r: 25, color: CONFETTI[2], tilt: 4 },
    { cx: 100, cy: 46, r: 21, color: CONFETTI[1], tilt: 10 },
  ];
  return (
    <svg aria-hidden viewBox="0 0 140 150" className={className}>
      {balloons.map((b, i) => (
        <g key={i} transform={`rotate(${b.tilt} ${b.cx} ${b.cy})`}>
          <path
            d={`M${b.cx} ${b.cy + b.r * 1.15} q -6 14 0 26 q 6 14 -2 28 q -6 12 2 24`}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="1.2"
          />
          <ellipse cx={b.cx} cy={b.cy} rx={b.r} ry={b.r * 1.15} fill={b.color} />
          <path d={`M${b.cx - 4} ${b.cy + b.r * 1.15 + 4} l4 -5 l4 5 z`} fill={b.color} />
          {/* Highlight */}
          <ellipse cx={b.cx - b.r * 0.38} cy={b.cy - b.r * 0.42} rx={b.r * 0.22} ry={b.r * 0.32} fill="#fff" opacity="0.45" />
        </g>
      ))}
    </svg>
  );
}

/** "Turning 30" / "គម្រប់អាយុ ៣០ ឆ្នាំ" in a round badge. */
export function AgeBadge({ age, lang, t, className = "" }: { age: number; lang: Lang; t: Labels; className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <span className="text-xs tracking-wide">{t.ageTurning}</span>
      <span
        className="font-heading flex h-20 w-20 flex-col items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white/70"
        style={{ background: "linear-gradient(145deg, var(--primary), var(--guest))" }}
      >
        <span className="text-3xl leading-none tabular-nums">{lang === "kh" ? khNum(age) : age}</span>
        {t.ageYears && <span className="mt-1 text-[11px] leading-none">{t.ageYears}</span>}
      </span>
    </div>
  );
}
