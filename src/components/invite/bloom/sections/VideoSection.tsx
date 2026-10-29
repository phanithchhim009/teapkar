"use client";

import type { Video } from "@/lib/types";
import { Videos } from "../../Videos";
import { useBloom } from "../BloomContext";
import { Heading, Section } from "./Heading";

export function VideoSection({ videos, onPlay, onStop }: { videos: Video[]; onPlay: () => void; onStop: () => void }) {
  const { t } = useBloom();
  return (
    <Section id="video" className="px-4">
      <Heading title={t.video} />
      <Videos videos={videos} t={t} onPlay={onPlay} onStop={onStop} />
    </Section>
  );
}
