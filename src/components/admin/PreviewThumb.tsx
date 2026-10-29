import type { Theme } from "@/lib/types";
import { cx } from "./ui";

// The real preview page rendered at phone size and scaled down; clicks go to whatever wraps it.
const PHONE_W = 390;
const PHONE_H = 844;

export function PreviewThumb({
  eventId,
  theme,
  scale = 0.3,
  height = PHONE_H * scale,
  className,
}: {
  eventId: number;
  /** Render in this style instead of the saved one. */
  theme?: Theme;
  scale?: number;
  /** Visible height; less than the full phone height crops to the top of the page. */
  height?: number;
  className?: string;
}) {
  return (
    <span
      className={cx("relative block shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100", className)}
      style={{ width: PHONE_W * scale, height }}
    >
      <iframe
        src={`/admin/preview/${eventId}${theme ? `?theme=${theme}` : ""}`}
        title=""
        aria-hidden
        tabIndex={-1}
        loading="lazy"
        className="pointer-events-none absolute left-0 top-0 origin-top-left border-0 bg-white"
        style={{ width: PHONE_W, height: PHONE_H, transform: `scale(${scale})` }}
      />
    </span>
  );
}
