/**
 * Line-art ornaments for the "angkor" theme, drawn from Angkorian temple carving:
 * the lotus-bud towers of Angkor Wat, naga-framed pediments (frontons), kbach scrollwork
 * (snail curls and flame leaves) and the lotus. Everything is drawn in `currentColor`
 * so it follows the invitation's primary colour.
 */

import { useId } from "react";

type SvgProps = { className?: string; style?: React.CSSProperties };

/* ------------------------------------------------------------------ */
/* Geometry helpers (pure + deterministic so SSR and hydration match)  */
/* ------------------------------------------------------------------ */

type Pt = [number, number];
type Cubic = [Pt, Pt, Pt, Pt];

const r = (n: number) => Math.round(n * 10) / 10;

function bezier([p0, p1, p2, p3]: Cubic, t: number): { p: Pt; n: Pt } {
  const u = 1 - t;
  const p: Pt = [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ];
  const d: Pt = [
    3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]),
    3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]),
  ];
  const len = Math.hypot(d[0], d[1]) || 1;
  return { p, n: [d[1] / len, -d[0] / len] };
}

const cubicPath = (segs: Cubic[]) =>
  `M${segs[0][0].join(",")}` + segs.map(([, a, b, c]) => ` C${a.join(",")} ${b.join(",")} ${c.join(",")}`).join("");

/* ------------------------------------------------------------------ */
/* Lotus                                                               */
/* ------------------------------------------------------------------ */

/** Side view of an open lotus: the flower held by devatas and the base of every Khmer finial. */
function LotusShapes() {
  return (
    <g fill="currentColor">
      <path d="M30 37C17 37 5 31 1 21c11-2 23 4 29 16Z" opacity=".45" />
      <path d="M30 37C43 37 55 31 59 21c-11-2-23 4-29 16Z" opacity=".45" />
      <path d="M30 37C21 33 14 22 16 9c8 4 13 15 14 28Z" opacity=".7" />
      <path d="M30 37C39 33 46 22 44 9c-8 4-13 15-14 28Z" opacity=".7" />
      <path d="M30 2c7 9 8 24 0 35-8-11-7-26 0-35Z" />
      <path d="M17 38.5q13 3 26 0" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

export function Lotus({ className, style }: SvgProps) {
  return (
    <svg viewBox="0 0 60 40" className={className} style={style} aria-hidden>
      <LotusShapes />
    </svg>
  );
}

/** Closed lotus bud: used as timeline markers (and the shape of Angkor Wat's towers). */
export function LotusBud({ className, style }: SvgProps) {
  return (
    <svg viewBox="0 0 16 22" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M8 1c5 5 6 11 3 16H5C2 12 3 6 8 1Z" />
      <path d="M8 4c2.5 4 2.8 8.5 1 13H7C5.2 12.5 5.5 8 8 4Z" fill="#fff" opacity=".35" />
      <path d="M2 17.5h12l-1.5 3h-9Z" opacity=".75" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Kbach divider: lotus centre + snail-curl scrolls + flame leaves     */
/* ------------------------------------------------------------------ */

function ScrollHalf() {
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* main vine ending in a snail curl (kbach hien) */}
      <path d="M134 18c14 0 20-9 30-9 8 0 10 8 4 10-4 1.4-6-3-2.6-4.2" strokeWidth="1.6" />
      {/* second vine sweeping out to a fine point */}
      <path d="M146 18c16 1 26 6 38 4 9-1.5 11-10 4-11-4-.6-5.5 4-1.8 4.6" strokeWidth="1.3" />
      <path d="M190 20.5c14 1 30-1 46-2.5" strokeWidth="1" />
      {/* flame leaves (kbach phni phleung) rising from the vines */}
      <path d="M150 15.6c-1-5 2-9 6-11-1.6 4-1 7 1 9.6" strokeWidth="1.1" />
      <path d="M174 21c2 3.6 6 5 10 4.6-3-1.6-4.6-3.6-5-6" strokeWidth="1.1" />
      <path d="M200 19.8c1-4 4-6.4 8-7-2 2-2.8 4.4-2.4 6.8" strokeWidth="1" />
      <circle cx="220" cy="15.6" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="228" cy="15" r=".9" fill="currentColor" stroke="none" />
    </g>
  );
}

export function KbachDivider({ className, style }: SvgProps) {
  return (
    <svg viewBox="0 0 240 30" className={className} style={style} color="currentColor" aria-hidden>
      <ScrollHalf />
      <g transform="translate(240 0) scale(-1 1)">
        <ScrollHalf />
      </g>
      <g transform="translate(102 1) scale(.6)">
        <LotusShapes />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Naga pediment (fronton)                                             */
/* ------------------------------------------------------------------ */

// Poly-lobed arch: three lobes each side rising to a pointed crown, like a Khmer fronton.
const ARCH: Cubic[] = [
  [[34, 128], [34, 104], [42, 92], [56, 86]],
  [[56, 86], [56, 70], [70, 60], [86, 58]],
  [[86, 58], [90, 40], [108, 30], [124, 30]],
  [[124, 30], [132, 18], [142, 10], [150, 4]],
  [[150, 4], [158, 10], [168, 18], [176, 30]],
  [[176, 30], [192, 30], [210, 40], [214, 58]],
  [[214, 58], [230, 60], [244, 70], [244, 86]],
  [[244, 86], [258, 92], [266, 104], [266, 128]],
];

// Flame leaves standing on the outside of the arch, as on carved naga bodies.
const FLAMES = ARCH.flatMap((seg, si) =>
  [0.2, 0.5, 0.8].map((t) => {
    const { p, n } = bezier(seg, t);
    const h = si === 3 || si === 4 ? 9 : 7; // taller flames toward the crown
    const tip: Pt = [p[0] + n[0] * h, p[1] + n[1] * h];
    const side: Pt = [-n[1] * 2.6, n[0] * 2.6];
    // Flame bends toward the crown (the arch's centre line).
    const lean = p[0] < 150 ? 2.2 : -2.2;
    return `M${r(p[0] - side[0])},${r(p[1] - side[1])} Q${r(tip[0] - lean)},${r(tip[1] + 1)} ${r(tip[0] + lean)},${r(tip[1] - 1.5)} Q${r(p[0] + n[0] * 2)},${r(p[1] + n[1] * 2)} ${r(p[0] + side[0])},${r(p[1] + side[1])}`;
  }),
).join(" ");

/** Seven-headed naga raised like a fan, the terminal of every Angkorian balustrade and pediment. */
function NagaHead({ x, y, flip }: { x: number; y: number; flip?: boolean }) {
  const heads = [-60, -40, -20, 0, 20, 40, 60];
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      {/* hood */}
      <path d="M0 0C-16-4-22-18-18-30 -10-36 10-36 18-30 22-18 16-4 0 0Z" fill="currentColor" opacity=".18" />
      {heads.map((a) => {
        const rad = (a * Math.PI) / 180;
        const len = a === 0 ? 26 : 23 - Math.abs(a) / 12;
        const hx = r(Math.sin(rad) * len);
        const hy = r(-Math.cos(rad) * len);
        return (
          <g key={a}>
            <path d={`M0 0Q${r(hx * 0.4)} ${r(hy * 0.6)} ${hx} ${hy}`} stroke="currentColor" strokeWidth="1.3" fill="none" />
            <ellipse cx={hx} cy={hy} rx="2.6" ry="4" transform={`rotate(${a} ${hx} ${hy})`} fill="currentColor" />
          </g>
        );
      })}
      {/* coiled tail of the body where it meets the arch */}
      <path d="M0 0c6 4 12 3 12-2 0-3-4-4-5-1" stroke="currentColor" strokeWidth="1.3" fill="none" />
    </g>
  );
}

/** Naga-bodied pediment arch with flame leaves and a lotus finial. Frames titles. */
export function NagaArch({ className, style }: SvgProps) {
  const arch = cubicPath(ARCH);
  return (
    <svg viewBox="0 -12 300 148" className={className} style={style} aria-hidden>
      <path d={FLAMES} fill="currentColor" opacity=".8" />
      <path d={arch} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      {/* inner moulding line */}
      <path d={arch} fill="none" stroke="currentColor" strokeWidth=".9" transform="translate(150 132) scale(.92) translate(-150 -132)" opacity=".7" />
      <NagaHead x={34} y={128} flip />
      <NagaHead x={266} y={128} />
      <g transform="translate(138 -9) scale(.4)">
        <LotusShapes />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Angkor Wat skyline with sugar palms and moat reflection             */
/* ------------------------------------------------------------------ */

/** Lotus-bud (ogival) tower outline. */
function tower(cx: number, base: number, w: number, h: number) {
  const hw = w / 2;
  return (
    `M${cx - hw},${base} L${cx - hw},${r(base - h * 0.22)}` +
    ` C${cx - hw},${r(base - h * 0.62)} ${r(cx - w * 0.2)},${r(base - h * 0.9)} ${cx},${base - h}` +
    ` C${r(cx + w * 0.2)},${r(base - h * 0.9)} ${cx + hw},${r(base - h * 0.62)} ${cx + hw},${r(base - h * 0.22)}` +
    ` L${cx + hw},${base}Z`
  );
}

/** Gallery body with colonnade openings cut out (evenodd), plus its tiled roof. */
function gallery(x1: number, x2: number, top: number, bottom: number, roof: number, gap = 7) {
  let d = `M${x1},${bottom} L${x1},${top} L${x2},${top} L${x2},${bottom}Z`;
  const h = bottom - top;
  for (let x = x1 + 4; x + 3 <= x2 - 3; x += gap) d += ` M${x},${bottom - 1} h3 v${-(h - 4)} h-3Z`;
  d += ` M${x1 - 3},${top} L${x1 + 8},${top - roof} L${x2 - 8},${top - roof} L${x2 + 3},${top}Z`;
  return d;
}

const TOWERS: [number, number, number, number][] = [
  // cx, base, width, height — the central sanctuary is the summit of Mount Meru
  [180, 72, 30, 66],
  [130, 76, 22, 46],
  [230, 76, 22, 46],
  [92, 90, 19, 38],
  [268, 90, 19, 38],
];

const TOWER_PATH = TOWERS.map(([cx, b, w, h]) => tower(cx, b, w, h)).join(" ");

const BUILDING =
  // three stepped galleries (the outer one with the western gopura in the middle)
  gallery(36, 324, 112, 126, 8, 7) +
  " " +
  gallery(78, 282, 94, 106, 7, 6) +
  " " +
  gallery(112, 248, 78, 90, 6, 6) +
  // gopura roof rising above the outer gallery
  " M160,104 L172,92 L188,92 L200,104Z" +
  // terraces
  " M20,126 L340,126 L344,132 L16,132Z" +
  // central staircase of the Bakan
  " M170,90 L174,78 L186,78 L190,90Z";

function SugarPalm({ x, h, lean = 0 }: { x: number; h: number; lean?: number }) {
  const topX = x + lean;
  const topY = 132 - h;
  const fronds = [-150, -120, -90, -60, -30, 0, 30, -170, -10];
  return (
    <g>
      <path d={`M${x - 1.2},132 Q${x + lean * 0.3},${132 - h * 0.5} ${topX - 0.6},${topY} L${topX + 0.6},${topY} Q${x + lean * 0.3 + 2},${132 - h * 0.5} ${x + 1.2},132Z`} />
      {fronds.map((a) => {
        const rad = (a * Math.PI) / 180;
        const ex = r(topX + Math.cos(rad) * 11);
        const ey = r(topY + Math.sin(rad) * 9);
        return <path key={a} d={`M${topX},${topY} Q${r((topX + ex) / 2 + Math.sin(rad) * 2)},${r((topY + ey) / 2 - 3)} ${ex},${ey} Q${r((topX + ex) / 2)},${r((topY + ey) / 2)} ${topX},${topY}Z`} />;
      })}
    </g>
  );
}

function Temple({ clip }: { clip: string }) {
  return (
    <g fill="currentColor">
      <SugarPalm x={14} h={66} lean={-3} />
      <SugarPalm x={30} h={50} lean={2} />
      <SugarPalm x={344} h={60} lean={3} />
      <path d={BUILDING} fillRule="evenodd" />
      <path d={TOWER_PATH} />
      {/* finials */}
      {TOWERS.map(([cx, b, , h]) => (
        <rect key={cx} x={cx - 0.6} y={b - h - 5} width="1.2" height="6" />
      ))}
      {/* redented tiers of the towers, cut in the background colour */}
      <g clipPath={`url(#${clip})`} stroke="#fff" strokeOpacity=".35" strokeWidth=".9">
        {Array.from({ length: 22 }, (_, i) => (
          <line key={i} x1="60" x2="300" y1={10 + i * 4} y2={10 + i * 4} />
        ))}
      </g>
    </g>
  );
}

export function AngkorSkyline({ className, style, reflection = true }: SvgProps & { reflection?: boolean }) {
  // Unique ids: the skyline can appear more than once on the page.
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const clip = `ak-towers-${id}`;
  return (
    <svg viewBox={`0 0 360 ${reflection ? 190 : 134}`} className={className} style={style} aria-hidden>
      <defs>
        <clipPath id={clip}>
          <path d={TOWER_PATH} />
        </clipPath>
        <linearGradient id={`ak-fade-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`ak-reflect-${id}`} maskUnits="userSpaceOnUse" x="0" y="132" width="360" height="60">
          <rect x="0" y="132" width="360" height="60" fill={`url(#ak-fade-${id})`} />
        </mask>
      </defs>
      <Temple clip={clip} />
      {reflection && (
        <>
          <g mask={`url(#ak-reflect-${id})`}>
            <g transform="translate(0 264) scale(1 -1)">
              <Temple clip={clip} />
            </g>
          </g>
          {/* ripples on the moat */}
          <g stroke="currentColor" strokeLinecap="round" opacity=".35">
            <line x1="60" x2="120" y1="146" y2="146" strokeWidth=".8" />
            <line x1="200" x2="290" y1="152" y2="152" strokeWidth=".8" />
            <line x1="120" x2="170" y1="160" y2="160" strokeWidth=".6" />
            <line x1="230" x2="260" y1="168" y2="168" strokeWidth=".6" />
          </g>
        </>
      )}
    </svg>
  );
}
