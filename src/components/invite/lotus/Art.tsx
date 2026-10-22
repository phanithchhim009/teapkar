/* Line-art and shapes for the Lotus theme. Everything is inline SVG and inherits `currentColor`. */

type SvgProps = React.SVGProps<SVGSVGElement>;

/** Gold line-art lotus: five petals fanned over a shallow bowl. */
export function LotusIcon(props: SvgProps) {
  return (
    <svg viewBox="0 0 64 36" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M32 4c4.6 5.4 5.6 12.4 0 22-5.6-9.6-4.6-16.6 0-22Z" />
      <path d="M32 26c1.8-7.6 6.4-13 14-15.4-1 7.4-6.2 13-14 15.4Z" />
      <path d="M32 26c-1.8-7.6-6.4-13-14-15.4 1 7.4 6.2 13 14 15.4Z" />
      <path d="M32 26.4c5.8-4.4 13-6.4 21-5.4-4 4.6-11.4 6.6-21 5.4Z" />
      <path d="M32 26.4c-5.8-4.4-13-6.4-21-5.4 4 4.6 11.4 6.6 21 5.4Z" />
      <path d="M8 29.5c8 3.6 40 3.6 48 0" />
      <path d="M16 33c6 1.6 26 1.6 32 0" opacity={0.7} />
    </svg>
  );
}

/** Gold wax seal with an embossed lotus. */
export function WaxSeal({ className }: { className?: string }) {
  // Wobbly rim: 18 lobes of slightly different radius, like poured wax.
  const lobes = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    const r = 47 + (i % 2 ? 2.4 : -0.6) + ((i * 7) % 5) * 0.35;
    return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
  });
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id="lotus-wax" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="35%" stopColor="#e4c272" />
          <stop offset="75%" stopColor="#b88a33" />
          <stop offset="100%" stopColor="#8a6420" />
        </radialGradient>
        <radialGradient id="lotus-wax-in" cx="60%" cy="65%" r="70%">
          <stop offset="0%" stopColor="#f1d690" />
          <stop offset="100%" stopColor="#c69a43" />
        </radialGradient>
      </defs>
      <polygon points={lobes.join(" ")} fill="url(#lotus-wax)" />
      <circle cx="50" cy="50" r="33" fill="url(#lotus-wax-in)" stroke="#9c7428" strokeOpacity={0.55} strokeWidth={1.2} />
      <circle cx="50" cy="50" r="29.5" fill="none" stroke="#fff6d6" strokeOpacity={0.55} strokeWidth={0.8} />
      <g transform="translate(26 33) scale(0.75)" stroke="#8a6420" strokeOpacity={0.85}>
        <LotusPaths />
      </g>
    </svg>
  );
}

function LotusPaths() {
  return (
    <g fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M32 4c4.6 5.4 5.6 12.4 0 22-5.6-9.6-4.6-16.6 0-22Z" />
      <path d="M32 26c1.8-7.6 6.4-13 14-15.4-1 7.4-6.2 13-14 15.4Z" />
      <path d="M32 26c-1.8-7.6-6.4-13-14-15.4 1 7.4 6.2 13 14 15.4Z" />
      <path d="M32 26.4c5.8-4.4 13-6.4 21-5.4-4 4.6-11.4 6.6-21 5.4Z" />
      <path d="M32 26.4c-5.8-4.4-13-6.4-21-5.4 4 4.6 11.4 6.6 21 5.4Z" />
      <path d="M10 30c8 3.4 36 3.4 44 0" />
    </g>
  );
}

/** Corner scroll (top-left orientation); flip with CSS for the other corners. */
export function CornerFlourish(props: SvgProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" aria-hidden {...props}>
      <path d="M4 76C4 36 36 4 76 4" />
      <path d="M10 60c0-24 18-44 42-48" />
      <path d="M14 46c4-14 14-24 28-28-8 6-10 14-4 17 5 2.4 9-2 6-5.4" />
      <path d="M22 34c-6 0-9-5-6-9 3-3.6 8-1.6 7.4 2.4" />
      <path d="M6 6c9 .6 14 5 14 13.4C11 19.4 6.6 15 6 6Z" fill="currentColor" stroke="none" />
      <circle cx="30" cy="30" r="1.6" fill="currentColor" stroke="none" />
      <path d="M4 76c3-6 7-8 12-8M76 4c-6 3-8 7-8 12" />
    </svg>
  );
}

/** A thin gold rule with a diamond in the middle. */
export function GoldRule({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 12" className={className} fill="none" stroke="currentColor" aria-hidden>
      <path d="M0 6h86M114 6h86" strokeWidth={0.8} />
      <path d="M100 1l5 5-5 5-5-5z" fill="currentColor" stroke="none" />
      <circle cx="90" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="110" cy="6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Path for a rectangle whose edges are rows of outward bumps (a scalloped frame). */
export function scallopRect(x: number, y: number, w: number, h: number, bump: number) {
  const nx = Math.max(2, Math.round(w / bump));
  const ny = Math.max(2, Math.round(h / bump));
  const sx = w / nx;
  const sy = h / ny;
  const r = (s: number) => (s * 0.62).toFixed(2);
  let d = `M${x},${y}`;
  for (let i = 1; i <= nx; i++) d += `A${r(sx)},${r(sx)} 0 0 1 ${(x + i * sx).toFixed(2)},${y}`;
  for (let i = 1; i <= ny; i++) d += `A${r(sy)},${r(sy)} 0 0 1 ${x + w},${(y + i * sy).toFixed(2)}`;
  for (let i = 1; i <= nx; i++) d += `A${r(sx)},${r(sx)} 0 0 1 ${(x + w - i * sx).toFixed(2)},${y + h}`;
  for (let i = 1; i <= ny; i++) d += `A${r(sy)},${r(sy)} 0 0 1 ${x},${(y + h - i * sy).toFixed(2)}`;
  return d + "Z";
}

/** The envelope flap: straight top edge, scalloped sides meeting in a point at the bottom. */
export function flapPath(w: number, h: number, bumps = 7) {
  const tip = [w / 2, h] as const;
  const edge = (from: readonly [number, number], to: readonly [number, number]) => {
    const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const r = ((len / bumps) * 0.62).toFixed(2);
    let d = "";
    for (let i = 1; i <= bumps; i++) {
      const px = from[0] + ((to[0] - from[0]) * i) / bumps;
      const py = from[1] + ((to[1] - from[1]) * i) / bumps;
      d += `A${r},${r} 0 0 1 ${px.toFixed(2)},${py.toFixed(2)}`;
    }
    return d;
  };
  return `M0,0L${w},0${edge([w, 0], tip)}${edge(tip, [0, 0])}Z`;
}

/** A photo inside a scalloped gold frame (fixed 4:5 so the path can live in one viewBox). */
export function ScallopPhoto({ src, alt = "", id }: { src: string; alt?: string; id: string }) {
  const W = 400;
  const H = 500;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full drop-shadow-[0_14px_24px_rgb(0_0_0/0.35)]" role="img" aria-label={alt}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--lt-gold-light)" />
          <stop offset="45%" stopColor="var(--lt-gold)" />
          <stop offset="70%" stopColor="var(--lt-gold-light)" />
          <stop offset="100%" stopColor="var(--lt-gold-deep)" />
        </linearGradient>
        <clipPath id={`${id}-c`}>
          <path d={scallopRect(34, 34, W - 68, H - 68, 26)} />
        </clipPath>
      </defs>
      <path d={scallopRect(16, 16, W - 32, H - 32, 30)} fill={`url(#${id}-g)`} />
      <image href={src} x={20} y={20} width={W - 40} height={H - 40} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id}-c)`} />
      <path d={scallopRect(34, 34, W - 68, H - 68, 26)} fill="none" stroke="var(--lt-gold-deep)" strokeOpacity={0.6} strokeWidth={1.5} />
    </svg>
  );
}

/** A lit candle; the flame flickers via the .lt-flame CSS animation. */
export function Candle({ height = 64, delay = 0 }: { height?: number; delay?: number }) {
  return (
    <div className="relative flex flex-col items-center" style={{ height: height + 34 }}>
      <span aria-hidden className="lt-glow absolute -top-3 h-14 w-14 rounded-full" style={{ animationDelay: `${delay}s` }} />
      <svg viewBox="0 0 20 34" className="lt-flame relative h-[26px] w-[16px]" style={{ animationDelay: `${delay}s` }} aria-hidden>
        <defs>
          <radialGradient id="lt-flame-g" cx="50%" cy="70%" r="65%">
            <stop offset="0%" stopColor="#fffbe6" />
            <stop offset="45%" stopColor="#ffd56b" />
            <stop offset="100%" stopColor="#ff9a2e" stopOpacity={0.85} />
          </radialGradient>
        </defs>
        <path d="M10 1C14 9 18 15 18 22a8 8 0 0 1-16 0c0-7 4-13 8-21Z" fill="url(#lt-flame-g)" />
      </svg>
      <span className="h-1.5 w-[1.5px] bg-neutral-800" />
      <span
        className="w-4 rounded-t-[3px]"
        style={{ height, background: "linear-gradient(90deg, #e9dcc0 0%, #fffaf0 45%, #e3d3b2 100%)", boxShadow: "inset 0 6px 6px -4px rgb(255 214 120 / 0.8)" }}
      />
    </div>
  );
}
