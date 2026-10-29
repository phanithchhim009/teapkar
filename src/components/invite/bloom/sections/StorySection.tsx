"use client";

import type { StoryItem } from "@/lib/types";
import type { Zoom } from "../../Lightbox";
import { Story } from "../../Story";
import { useBloom } from "../BloomContext";
import { Heading, Section } from "./Heading";

/** The shared love-story timeline under a Bloom heading; --primary is the leaf green here. */
export function StorySection({ items, onZoom }: { items: StoryItem[]; onZoom: (z: Zoom) => void }) {
  const { t, lang } = useBloom();
  return (
    <Section id="story">
      <Heading title={t.story} />
      <Story items={items} lang={lang} onZoom={onZoom} />
    </Section>
  );
}
