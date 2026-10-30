"use client";

import { useEffect, useRef } from "react";

type Rocket = { x: number; y: number; vx: number; vy: number; top: number; color: string };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; width: number };

/**
 * A short fireworks show over the page: rockets rise and burst into long glowing streaks, like a photo of
 * fireworks at night. Each time `show` changes to a new non-zero number, `rockets` more are launched. The canvas
 * only animates while sparks are in the air, and nothing runs for guests who asked for reduced motion.
 */
export function Fireworks({ show, colors, rockets = 6, glow = true }: { show: number; colors: string[]; rockets?: number; glow?: boolean }) {
  // `glow` adds a soft halo around each streak, for dark night skies. Plain blending is used either way, because
  // additive "lighter" blending turns sparks white (invisible) over a bright photo or a light page.
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef({ rockets: [] as Rocket[], sparks: [] as Spark[], raf: 0, pending: 0 });

  useEffect(() => {
    if (!show || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const s = live.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    el.width = el.clientWidth * dpr;
    el.height = el.clientHeight * dpr;
    const pick = () => colors[Math.floor(Math.random() * colors.length)];

    const burst = (r: Rocket) => {
      const count = 70 + Math.floor(Math.random() * 30);
      const speed = (3.6 + Math.random() * 2.4) * dpr;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.15;
        const v = speed * (0.45 + Math.random() * 0.6);
        s.sparks.push({
          x: r.x,
          y: r.y,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          life: 0,
          max: 55 + Math.random() * 35,
          // Mostly the rocket's colour, with warm white glints like a real shell.
          color: Math.random() < 0.8 ? r.color : "#fff3c4",
          width: (1.6 + Math.random() * 1.2) * dpr,
        });
      }
    };

    const frame = () => {
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.globalCompositeOperation = "source-over";
      ctx.lineCap = "round";

      s.rockets = s.rockets.filter((r) => {
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.1 * dpr;
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.moveTo(r.x - r.vx * 3, r.y - r.vy * 3);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();
        if (r.y <= r.top || r.vy >= -1 * dpr) {
          burst(r);
          return false;
        }
        return true;
      });

      s.sparks = s.sparks.filter((p) => {
        p.vx *= 0.965;
        p.vy = p.vy * 0.965 + 0.045 * dpr;
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const fade = 1 - p.life / p.max;
        if (fade <= 0) return false;
        // Drawing each spark as a streak along its motion gives the long-exposure look.
        ctx.strokeStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 6, p.y - p.vy * 6);
        ctx.lineTo(p.x, p.y);
        if (glow) {
          ctx.globalAlpha = fade * 0.22;
          ctx.lineWidth = p.width * 3.2;
          ctx.stroke();
        }
        ctx.globalAlpha = fade;
        ctx.lineWidth = p.width;
        ctx.stroke();
        return true;
      });

      if (s.rockets.length || s.sparks.length || s.pending) s.raf = requestAnimationFrame(frame);
      else {
        ctx.clearRect(0, 0, el.width, el.height);
        s.raf = 0;
      }
    };

    const launch = () => {
      s.pending--;
      const x = el.width * (0.15 + Math.random() * 0.7);
      s.rockets.push({
        x,
        y: el.height,
        vx: (Math.random() - 0.5) * 1.4 * dpr,
        vy: -(10 + Math.random() * 3.5) * dpr * Math.sqrt(el.height / (844 * dpr)),
        top: el.height * (0.12 + Math.random() * 0.3),
        color: pick(),
      });
      if (!s.raf) s.raf = requestAnimationFrame(frame);
    };

    s.pending += rockets;
    const timers = Array.from({ length: rockets }, (_, i) => window.setTimeout(launch, i * 420 + Math.random() * 250));
    return () => {
      timers.forEach(clearTimeout);
      s.pending = 0;
    };
  }, [show, colors, rockets, glow]);

  // Stop drawing if the page goes away mid-show.
  useEffect(() => () => cancelAnimationFrame(live.current.raf), []);

  return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-[45] mx-auto h-full w-full max-w-[480px]" />;
}
