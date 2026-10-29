import { googleFontsHref } from "@/lib/event";
import type { EventConfig } from "@/lib/types";

// Bloom's monogram and intro date line are set in Cormorant Garamond whatever fonts are picked;
// Lotus also writes the romanised names in Great Vibes.
const THEME_FONTS: Partial<Record<EventConfig["theme"], string[]>> = {
  bloom: ["Cormorant Garamond"],
  lotus: ["Cormorant Garamond", "Great Vibes"],
  // Garden: Cormorant for the English lettering and dates, Great Vibes for the monogram and script names.
  garden: ["Cormorant Garamond", "Great Vibes"],
};

export function FontLinks({ config }: { config: EventConfig }) {
  const fonts = [config.fontKh, config.fontBodyKh, config.fontEn, "Ovo", ...(THEME_FONTS[config.theme] ?? [])];
  return <link rel="stylesheet" href={googleFontsHref(fonts)} precedence="default" />;
}
