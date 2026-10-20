import { googleFontsHref } from "@/lib/event";
import type { EventConfig } from "@/lib/types";

// Bloom's monogram and intro date line are set in Cormorant Garamond whatever fonts are picked.
const THEME_FONTS: Partial<Record<EventConfig["theme"], string[]>> = { bloom: ["Cormorant Garamond"] };

export function FontLinks({ config }: { config: EventConfig }) {
  const fonts = [config.fontKh, config.fontBodyKh, config.fontEn, "Ovo", ...(THEME_FONTS[config.theme] ?? [])];
  return <link rel="stylesheet" href={googleFontsHref(fonts)} precedence="default" />;
}
