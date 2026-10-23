/* Artwork for the Garden theme: damask paper, a pearl wax seal, silk curtains, a bed of white
   blossoms and a hanging garland with a crystal chandelier. All inline SVG, drawn once from a
   fixed seed so the server and the browser render the same thing. */

type SvgProps = React.SVGProps<SVGSVGElement>;

/** Small deterministic PRNG (mulberry32), so the "random" flowers are identical on every render. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n: number) => Number(n.toFixed(2));

/* ---------------------------------------------------------------- Damask */

/** Right half of one damask medallion (an ogee with a small fleur inside), centred on x = 0. */
function Ogee() {
  return (
    <g>
      <path d="M0 0C10 14 22 24 22 45 22 66 10 76 0 90" />
      <path d="M0 26C5 32 6 41 0 50" />
      <path d="M0 44C6 40 12 43 11 49 10 54 4 54 4 50" />
      <path d="M0 56C4 60 5 66 0 72" opacity={0.7} />
      <path d="M0 18C2 15 2 12 0 9" opacity={0.7} />
    </g>
  );
}
const Medallion = () => (
  <>
    <Ogee />
    <g transform="scale(-1 1)">
      <Ogee />
    </g>
  </>
);

/** Fine white-on-white damask lattice that fills its parent. */
export function Damask({ className = "", opacity = 1 }: { className?: string; opacity?: number }) {
  return (
    <svg aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} style={{ opacity }}>
      <defs>
        <pattern id="gd-damask" width="56" height="90" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#dfdacf" strokeWidth={0.9} strokeLinecap="round">
            <g transform="translate(28 0)">
              <Medallion />
            </g>
            <g transform="translate(0 -45)">
              <Medallion />
            </g>
            <g transform="translate(0 45)">
              <Medallion />
            </g>
            <g transform="translate(56 -45)">
              <Medallion />
            </g>
            <g transform="translate(56 45)">
              <Medallion />
            </g>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gd-damask)" />
    </svg>
  );
}

/* ---------------------------------------------------------------- Monogram + seal */

/**
 * One letter per name for the monogram: the first letter after the first space, so the given
 * name is used rather than the family name ("Hor Lengkong" → "L", "ហោ ឡេងគង់" → "ឡ").
 * A single-word name uses its own first letter.
 */
export function initials(names: string[]) {
  return names
    .map((n) => n.trim().split(/\s+/).filter(Boolean))
    .filter((words) => words.length > 0)
    .map((words) => Array.from(words[1] ?? words[0])[0]?.toUpperCase() ?? "");
}

/** Two overlapping script initials, or the uploaded monogram image. */
export function Monogram({ letters, image, className = "" }: { letters: string[]; image?: string; className?: string }) {
  if (image) return <img src={image} alt="" className={`object-contain ${className}`} />;
  return (
    <span aria-hidden className={`gd-mono relative inline-flex items-start justify-center leading-none ${className}`}>
      <span>{letters[0]}</span>
      {letters[1] && <span className="-ml-[0.28em] mt-[0.32em]">{letters[1]}</span>}
    </span>
  );
}

/** Pearl-white wax seal with a soft, poured rim. */
export function WaxSeal({ className, children }: { className?: string; children?: React.ReactNode }) {
  const lobes = Array.from({ length: 40 }, (_, i) => {
    const a = (i / 40) * Math.PI * 2;
    const r = 47 + (i % 2 ? 2 : -0.8) + ((i * 7) % 5) * 0.3;
    return `${f(50 + r * Math.cos(a))},${f(50 + r * Math.sin(a))}`;
  });
  return (
    <span className={`relative block aspect-square ${className ?? ""}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full drop-shadow-[0_6px_10px_rgb(60_60_50/0.35)]" aria-hidden>
        <defs>
          <radialGradient id="gd-wax" cx="36%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f4f2ec" />
            <stop offset="85%" stopColor="#dcd8ce" />
            <stop offset="100%" stopColor="#c9c4b8" />
          </radialGradient>
          <radialGradient id="gd-wax-in" cx="62%" cy="68%" r="75%">
            <stop offset="0%" stopColor="#fbfaf7" />
            <stop offset="100%" stopColor="#e6e2d9" />
          </radialGradient>
        </defs>
        <polygon points={lobes.join(" ")} fill="url(#gd-wax)" />
        <circle cx="50" cy="50" r="35" fill="url(#gd-wax-in)" stroke="#bdb7aa" strokeOpacity={0.6} strokeWidth={1.1} />
        <circle cx="50" cy="50" r="31.5" fill="none" stroke="#fff" strokeOpacity={0.9} strokeWidth={0.8} />
      </svg>
      <span className="absolute inset-[22%] flex items-center justify-center text-[#6f6d66]">{children}</span>
    </span>
  );
}

/* ---------------------------------------------------------------- Curtains */

/** Fabric swags across the top of the stage. */
export function Valance({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 90" preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="gd-swag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f2f1ee" />
          <stop offset="100%" stopColor="#dedcd6" />
        </linearGradient>
      </defs>
      <path d="M0 0H400V22C340 70 270 64 200 30 130 64 60 70 0 22Z" fill="url(#gd-swag)" />
      <path d="M0 0H400V10C330 46 270 42 200 16 130 42 70 46 0 10Z" fill="#fff" opacity={0.9} />
      <g fill="none" stroke="#d8d6cf" strokeWidth={1}>
        <path d="M14 30C70 58 140 52 196 30" />
        <path d="M204 30C260 52 330 58 386 30" />
        <path d="M40 22C90 40 150 36 192 20" opacity={0.6} />
        <path d="M208 20C250 36 310 40 360 22" opacity={0.6} />
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------------- Flowers */

const LEAF = "M0 0C6-10 6-24 0-34C-6-24-6-10 0 0Z";
const LEAF_TONES = ["#4d6b4a", "#66845d", "#7f9c74", "#9db38f", "#3f5a40"];

/** A dense bed of white roses, baby's breath and greenery for the bottom of the hero. */
export function FlowerBed({ className }: { className?: string }) {
  const r = rng(7);
  const leaves = Array.from({ length: 90 }, () => ({
    x: f(r() * 400),
    y: f(66 + r() * 94),
    rot: f(-75 + r() * 150),
    s: f(0.45 + r() * 0.7),
    c: LEAF_TONES[Math.floor(r() * LEAF_TONES.length)],
  }));
  const stems = Array.from({ length: 34 }, () => {
    const x = f(r() * 400);
    const top = f(40 + r() * 50);
    return { x, top, lean: f(-14 + r() * 28) };
  });
  const sprays = stems.map((s) =>
    Array.from({ length: 14 }, () => ({ cx: f(s.x + s.lean + (r() - 0.5) * 30), cy: f(s.top + (r() - 0.5) * 22), rr: f(1 + r() * 1.4) })),
  );
  const roses = Array.from({ length: 17 }, (_, i) => ({ x: f(8 + i * 24 + (r() - 0.5) * 12), y: f(i % 2 ? 128 + r() * 20 : 104 + r() * 18), s: f(8 + r() * 7) }));
  return (
    <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <defs>
        <radialGradient id="gd-rose" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f3f1ea" />
          <stop offset="100%" stopColor="#d9d5c9" />
        </radialGradient>
      </defs>
      {stems.map((s, i) => (
        <path key={`s${i}`} d={`M${s.x} 160Q${f(s.x + s.lean / 2)} ${f((160 + s.top) / 2)} ${f(s.x + s.lean)} ${s.top}`} stroke="#7f9c74" strokeWidth={0.8} fill="none" />
      ))}
      {leaves.map((l, i) => (
        <path key={`l${i}`} d={LEAF} transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.s})`} fill={l.c} opacity={0.92} />
      ))}
      {sprays.flat().map((d, i) => (
        <circle key={`b${i}`} cx={d.cx} cy={d.cy} r={d.rr} fill="#fff" stroke="#e2dfd6" strokeWidth={0.4} />
      ))}
      {roses.map((o, i) => (
        <g key={`r${i}`} transform={`translate(${o.x} ${o.y})`}>
          <circle r={o.s} fill="url(#gd-rose)" stroke="#d3cec2" strokeWidth={0.5} />
          <g fill="none" stroke="#d6d1c4" strokeWidth={0.9} strokeLinecap="round">
            <path d={`M${f(-o.s * 0.15)} ${f(-o.s * 0.1)}a${f(o.s * 0.18)} ${f(o.s * 0.18)} 0 1 1 ${f(o.s * 0.3)} ${f(o.s * 0.12)}`} />
            <path d={`M${f(-o.s * 0.45)} ${f(o.s * 0.05)}a${f(o.s * 0.42)} ${f(o.s * 0.4)} 0 0 1 ${f(o.s * 0.85)} ${f(-o.s * 0.2)}`} />
            <path d={`M${f(-o.s * 0.7)} ${f(o.s * 0.3)}a${f(o.s * 0.7)} ${f(o.s * 0.6)} 0 0 0 ${f(o.s * 1.35)} ${f(-o.s * 0.05)}`} />
          </g>
        </g>
      ))}
    </svg>
  );
}

/* ---------------------------------------------------------------- Garland + chandelier */

/** Ivy hanging from the top edge, white drapes in the corners and an optional crystal chandelier. */
export function Garland({ chandelier = true, className }: { chandelier?: boolean; className?: string }) {
  const r = rng(11);
  const vines = Array.from({ length: 16 }, (_, i) => {
    const x = f(i < 8 ? 6 + i * 19 + r() * 8 : 254 + (i - 8) * 19 + r() * 8);
    const len = f(30 + r() * (i % 3 === 0 ? 100 : 60));
    const sway = f((r() - 0.5) * 16);
    const leaves = Array.from({ length: Math.round(len / 9) }, (_, k) => ({
      t: (k + 1) / (Math.round(len / 9) + 1),
      side: k % 2 ? 1 : -1,
      s: f(0.25 + r() * 0.2),
      c: LEAF_TONES[Math.floor(r() * LEAF_TONES.length)],
    }));
    return { x, len, sway, leaves, delay: f(r() * 3) };
  });
  return (
    <svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMin slice" className={className} aria-hidden>
      <defs>
        <radialGradient id="gd-bead" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dcd9d2" />
        </radialGradient>
        <linearGradient id="gd-drape" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e9e8e4" />
          <stop offset="35%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f0efeb" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      {/* Corner drapes. */}
      <g style={{ filter: "drop-shadow(0 3px 4px rgb(70 70 60 / 0.25))" }}>
      <path d="M0 0H120C96 18 60 40 34 80 22 98 12 118 0 140Z" fill="url(#gd-drape)" />
      <path d="M0 0H70C52 24 26 56 0 96Z" fill="#fff" opacity={0.85} />
      <path d="M400 0H280C304 18 340 40 366 80 378 98 388 118 400 140Z" fill="url(#gd-drape)" />
      <path d="M400 0H330C348 24 374 56 400 96Z" fill="#fff" opacity={0.85} />
      </g>
      <g fill="none" stroke="#cfcdc5" strokeWidth={0.9}>
        <path d="M96 4C70 30 44 60 22 104" />
        <path d="M78 4C56 30 34 56 12 92" opacity={0.6} />
        <path d="M304 4C330 30 356 60 378 104" />
        <path d="M322 4C344 30 366 56 388 92" opacity={0.6} />
      </g>
      {/* Top rail of foliage. */}
      <path d="M0 2C80 12 140 8 200 4 260 8 320 12 400 2V0H0Z" fill="#5d7b56" />
      {Array.from({ length: 46 }, (_, i) => (
        <path key={`t${i}`} d={LEAF} transform={`translate(${f(i * 8.9)} ${f(4 + (i % 3) * 2)}) rotate(${f(150 + ((i * 37) % 70) - 35)}) scale(0.32)`} fill={LEAF_TONES[i % 5]} />
      ))}
      {vines.map((v, i) => {
        const end = { x: v.x + v.sway, y: v.len };
        const at = (t: number) => ({ x: v.x + v.sway * t * t, y: t * v.len });
        return (
          <g key={i} className="gd-vine" style={{ transformOrigin: `${v.x}px 0px`, animationDelay: `${-v.delay}s` }}>
            <path d={`M${v.x} 0Q${f(v.x + v.sway * 0.2)} ${f(v.len / 2)} ${f(end.x)} ${f(end.y)}`} stroke="#6b8762" strokeWidth={0.7} fill="none" />
            {v.leaves.map((l, k) => {
              const p = at(l.t);
              return <path key={k} d={LEAF} transform={`translate(${f(p.x)} ${f(p.y)}) rotate(${l.side * 120}) scale(${l.s})`} fill={l.c} />;
            })}
          </g>
        );
      })}
      {chandelier && <Chandelier />}
    </svg>
  );
}

function Chandelier() {
  // Bead strands hanging in a teardrop, widest about two-thirds down.
  const strands = Array.from({ length: 13 }, (_, i) => {
    const u = i / 12 - 0.5; // -0.5 … 0.5
    const x = 200 + u * 64;
    const len = f(56 + (0.25 - u * u) * 120);
    return { x: f(x), len };
  });
  return (
    <g>
      <line x1="200" y1="0" x2="200" y2="18" stroke="#c9c6bd" strokeWidth={1} />
      <ellipse cx="200" cy="20" rx="12" ry="3.5" fill="#f2f1ec" stroke="#cfccc3" strokeWidth={0.6} />
      <ellipse cx="200" cy="34" rx="34" ry="5" fill="none" stroke="#d6d3ca" strokeWidth={1} />
      {strands.map((s, i) => (
        <g key={i} className="gd-twinkle" style={{ animationDelay: `${(i % 5) * 0.6}s` }}>
          <path d={`M200 22Q${s.x} 30 ${s.x} 34V${f(34 + s.len)}`} stroke="#c9c5bb" strokeWidth={0.45} fill="none" />
          {Array.from({ length: Math.floor(s.len / 7) }, (_, k) => (
            <circle key={k} cx={s.x} cy={f(38 + k * 7)} r={1.6} fill="url(#gd-bead)" stroke="#b9b4a8" strokeWidth={0.4} />
          ))}
          <path d={`M${s.x} ${f(36 + s.len)}l2.4 4-2.4 5-2.4-5Z`} fill="#fff" stroke="#c8c3b8" strokeWidth={0.4} />
        </g>
      ))}
      <ellipse cx="200" cy="70" rx="24" ry="3.5" fill="none" stroke="#dedbd3" strokeWidth={0.8} />
      <path d="M200 112l3 6-3 8-3-8Z" fill="#fff" stroke="#c8c3b8" strokeWidth={0.5} />
    </g>
  );
}

/** A single leaf for the falling-leaves layer. */
export function FallingLeaf(props: SvgProps) {
  return (
    <svg viewBox="-8 -36 16 38" aria-hidden {...props}>
      <path d={LEAF} fill="currentColor" />
      <path d="M0 0V-32" stroke="#fff" strokeOpacity={0.35} strokeWidth={0.8} />
    </svg>
  );
}

/** Thin ornament line with a small leaf sprig in the middle. */
export function Sprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 16" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" className={className} aria-hidden>
      <path d="M4 8H62M98 8H156" opacity={0.6} />
      <path d="M68 8C72 2 78 2 80 8 82 2 88 2 92 8" />
      <path d="M80 8C76 12 72 13 68 12M80 8C84 12 88 13 92 12" opacity={0.7} />
      <circle cx="80" cy="8" r="1.4" fill="currentColor" />
    </svg>
  );
}
