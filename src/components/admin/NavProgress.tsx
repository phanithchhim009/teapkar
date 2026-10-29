"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// Next has no router events, so navigation start is detected from link clicks (or startNavProgress()
// for router.push) and the end from the URL changing.
const listeners = new Set<(on: boolean) => void>();

/** Show the top bar for a programmatic navigation (router.push). */
export function startNavProgress() {
  listeners.forEach((l) => l(true));
}

function isNavClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  const a = (e.target as Element | null)?.closest?.("a");
  if (!a || !a.href || a.hasAttribute("download") || (a.target && a.target !== "_self")) return false;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return false;
  // Same page (or only a #hash change): nothing will load.
  return url.pathname !== location.pathname || url.search !== location.search;
}

function Bar() {
  const path = usePathname();
  const search = useSearchParams().toString();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    const set = (on: boolean) => setState(on ? "loading" : "done");
    const onClick = (e: MouseEvent) => isNavClick(e) && set(true);
    listeners.add(set);
    document.addEventListener("click", onClick, true);
    return () => {
      listeners.delete(set);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  // The URL changed: the new page is in.
  useEffect(() => setState((s) => (s === "loading" ? "done" : s)), [path, search]);

  useEffect(() => {
    if (state === "idle") return;
    // "done" fades out; a navigation that never lands (error, cancelled) gives up after 15s.
    const t = setTimeout(() => setState(state === "done" ? "idle" : "done"), state === "done" ? 400 : 15000);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5">
      <div
        className="h-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.6)]"
        style={{
          width: state === "idle" ? "0%" : state === "loading" ? "85%" : "100%",
          opacity: state === "done" ? 0 : 1,
          transition:
            state === "loading" ? "width 8s cubic-bezier(0.1, 0.8, 0.2, 1)" : state === "done" ? "width 0.2s ease, opacity 0.3s ease 0.2s" : "none",
        }}
      />
    </div>
  );
}

export function NavProgress() {
  return (
    <Suspense>
      <Bar />
    </Suspense>
  );
}
