/**
 * Built-in Bloom artwork, drawn as inline SVG so the theme looks finished before anything is uploaded.
 * Every piece is drawn for the top-left corner; mirror with CSS (`-scale-x-100` / `-scale-y-100`) for the others.
 */

const PINK = "#f7b9c9";
const PINK_DEEP = "#e98aa5";
const PURPLE = "#b48ad6";
const LINE = "#7d8f5a";
const LEAF = "#9fb37a";

function Blossom({ x, y, r = 1, rot = 0, fill = PINK, edge = PINK_DEEP }: { x: number; y: number; r?: number; rot?: number; fill?: string; edge?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        // Cherry-blossom petal with the notched tip.
        <path key={a} transform={`rotate(${a})`} d="M0 0C-7-3-9-13-4-19L0-16.5 4-19C9-13 7-3 0 0Z" fill={fill} stroke={edge} strokeWidth=".8" strokeOpacity=".6" />
      ))}
      <circle r="3.2" fill="#f4d27a" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M0-3V-8" stroke={edge} strokeWidth=".7" />
          <circle cy="-8.6" r=".9" fill="#c9734a" />
        </g>
      ))}
    </g>
  );
}

function Daffodil({ x, y, r = 1, rot = 0 }: { x: number; y: number; r?: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r})`}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path key={a} transform={`rotate(${a})`} d="M0 0C-6-6-6-16 0-23 6-16 6-6 0 0Z" fill="#fffdf4" stroke="#e8d9a8" strokeWidth=".9" />
      ))}
      <circle r="7.5" fill="#f9d548" stroke="#e7a92c" strokeWidth="1.4" />
      <circle r="3.5" fill="#f2b73a" />
    </g>
  );
}

function Bud({ x, y, rot = 0, fill = PINK_DEEP }: { x: number; y: number; rot?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M0 0V9" stroke={LINE} strokeWidth="1" />
      <path d="M0 0C-4-3-4-9 0-12 4-9 4-3 0 0Z" fill={fill} />
    </g>
  );
}

function Leaf({ x, y, rot = 0, s = 1, fill = LEAF }: { x: number; y: number; rot?: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 0C6-10 20-12 30-6 20 2 8 4 0 0Z" fill={fill} fillOpacity=".75" />
      <path d="M0 0C10-4 20-6 30-6" stroke={LINE} strokeWidth=".7" fill="none" />
    </g>
  );
}

/** Fine line-art flower (outline only), the "pen" layer over the washes. */
function LineFlower({ x, y, r = 1, rot = 0 }: { x: number; y: number; r?: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r})`} fill="none" stroke={LINE} strokeWidth=".9" strokeLinecap="round">
      {[0, 51, 103, 154, 206, 257, 309].map((a) => (
        <path key={a} transform={`rotate(${a})`} d="M0 0C-5-5-5-14 0-18 5-14 5-5 0 0" />
      ))}
      <circle r="2.6" />
    </g>
  );
}

/** Small purple accent bloom (round petals). */
function Accent({ x, y, r = 1 }: { x: number; y: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${r})`}>
      {[0, 90, 180, 270, 45, 135, 225, 315].map((a, i) => (
        <ellipse key={a} transform={`rotate(${a})`} cy="-6" rx="4" ry="6.5" fill={i < 4 ? PURPLE : "#d5b8ec"} fillOpacity=".9" />
      ))}
      <circle r="2.6" fill="#f3e3a0" />
    </g>
  );
}

/** Persistent frame corner: branch, blossoms, line art and a purple accent. */
export function FrameCorner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 220" className={className} aria-hidden>
      <path d="M-10 70C30 60 60 40 80 -10M-10 140C40 120 90 90 120 30M40 40C70 70 120 80 170 70" stroke={LINE} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <Leaf x={20} y={66} rot={-20} />
      <Leaf x={74} y={20} rot={-70} s={0.8} />
      <Leaf x={92} y={74} rot={10} s={0.9} fill="#b9c78f" />
      <Leaf x={128} y={76} rot={-15} s={0.7} />
      <LineFlower x={150} y={58} r={0.9} rot={10} />
      <LineFlower x={34} y={150} r={0.8} rot={-12} />
      <Blossom x={44} y={34} r={1.35} rot={8} />
      <Blossom x={92} y={46} r={1.05} rot={-20} fill="#fbd0db" />
      <Blossom x={22} y={100} r={1.15} rot={30} />
      <Blossom x={64} y={86} r={0.8} rot={-6} fill="#fbd0db" />
      <Accent x={118} y={22} r={1.1} />
      <Accent x={14} y={176} r={0.8} />
      <Bud x={170} y={74} rot={110} />
      <Bud x={58} y={128} rot={160} />
      <Bud x={128} y={34} rot={60} fill={PINK} />
    </svg>
  );
}

/** Intro cluster: cherry blossom with white/yellow daffodils. */
export function IntroCluster({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden>
      <path d="M-10 90C40 70 80 40 100 -10M-10 170C60 140 120 90 150 20" stroke={LINE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M60 150C64 120 72 100 86 86M110 120C108 100 112 84 122 70" stroke="#6f9a4a" strokeWidth="2" fill="none" />
      <Leaf x={14} y={80} rot={-25} s={1.2} />
      <Leaf x={90} y={30} rot={-75} />
      <Leaf x={62} y={150} rot={-80} s={1.1} fill="#8fb36a" />
      <Leaf x={110} y={124} rot={-70} s={0.9} fill="#8fb36a" />
      <Daffodil x={86} y={84} r={1.3} rot={12} />
      <Daffodil x={124} y={66} r={1} rot={-14} />
      <Blossom x={40} y={42} r={1.6} rot={10} />
      <Blossom x={24} y={124} r={1.25} rot={-30} fill="#fbd0db" />
      <Blossom x={140} y={24} r={1.05} rot={40} />
      <Blossom x={60} y={108} r={0.9} rot={0} fill="#fbd0db" />
      <Accent x={160} y={92} r={0.9} />
      <Bud x={172} y={44} rot={100} />
      <Bud x={30} y={176} rot={170} />
    </svg>
  );
}

/** Gold ornamental frame for the guest name (stretches horizontally). */
export function NameFrame({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 90" preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id="bloom-gold-stroke" x1="0" x2="1">
          <stop offset="0" stopColor="var(--gold-to)" />
          <stop offset=".5" stopColor="var(--gold-from)" />
          <stop offset="1" stopColor="var(--gold-to)" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#bloom-gold-stroke)" vectorEffect="non-scaling-stroke">
        <path d="M24 6H276Q294 6 294 24V66Q294 84 276 84H24Q6 84 6 66V24Q6 6 24 6Z" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        <path d="M30 12H270Q288 12 288 30V60Q288 78 270 78H30Q12 78 12 60V30Q12 12 30 12Z" strokeWidth=".8" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

/** Thin gold flourish used as a divider between headings and rows. */
export function Flourish({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 16" className={className} aria-hidden>
      <g fill="none" stroke="var(--gold-to)" strokeWidth="1" strokeLinecap="round">
        <path d="M2 8H58M102 8H158" />
        <path d="M58 8C66 0 74 0 80 8 86 16 94 16 102 8M58 8C66 16 74 16 80 8 86 0 94 0 102 8" />
      </g>
      <circle cx="80" cy="8" r="2" fill="var(--gold-from)" />
    </svg>
  );
}

/** Default monogram: the couple's initials (or a single host's) in a double gold ring. */
export function Monogram({ a, b, className }: { a: string; b?: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label={b ? `${a} & ${b}` : a}>
      <g fill="none" stroke="var(--gold-to)">
        <circle cx="60" cy="60" r="56" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="50" strokeWidth=".7" />
      </g>
      {!b && (
        <text x="60" y="72" textAnchor="middle" fontSize="34" fill="var(--gold-to)" style={{ fontFamily: "var(--font-title), serif" }}>
          {a}
        </text>
      )}
      {b && (
        <>
          <text x="34" y="70" textAnchor="middle" fontSize="26" fill="var(--gold-to)" style={{ fontFamily: "var(--font-title), serif" }}>
            {a}
          </text>
          <text x="60" y="67" textAnchor="middle" fontSize="16" fill="var(--gold-from)" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
            &amp;
          </text>
          <text x="86" y="70" textAnchor="middle" fontSize="26" fill="var(--gold-to)" style={{ fontFamily: "var(--font-title), serif" }}>
            {b}
          </text>
        </>
      )}
    </svg>
  );
}
