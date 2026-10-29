"use client";

import { Play } from "lucide-react";
import { useRef, useState } from "react";
import type { Video } from "@/lib/types";
import { parseYouTube, youTubeEmbed, youTubeThumb } from "@/lib/video";
import type { Labels } from "./i18n";
import { Reveal } from "./Reveal";

type Props = {
  videos: Video[];
  t: Labels;
  /** Called when a video starts, so the page can pause the background music. */
  onPlay: () => void;
  /** Called when no uploaded video is playing any more. */
  onStop: () => void;
};

/** Pre-wedding videos: uploaded files play inline; YouTube links load the player only when tapped. */
export function Videos({ videos, t, onPlay, onStop }: Props) {
  const files = useRef<(HTMLVideoElement | null)[]>([]);

  // Only one video at a time.
  const pauseOthers = (current?: HTMLVideoElement) => files.current.forEach((v) => v && v !== current && !v.paused && v.pause());

  return (
    <div className="space-y-5">
      {videos.map((v, i) => {
        const yt = parseYouTube(v.src);
        return (
          <Reveal key={v.id || i} delay={0.05}>
            {yt ? (
              <YouTube
                id={yt.id}
                vertical={yt.vertical}
                poster={v.poster || youTubeThumb(yt.id)}
                label={t.play}
                onStart={() => {
                  pauseOthers();
                  onPlay();
                }}
              />
            ) : (
              <FileVideo
                src={v.src}
                poster={v.poster}
                label={t.play}
                videoRef={(el) => {
                  files.current[i] = el;
                }}
                onPlay={(el) => {
                  pauseOthers(el);
                  onPlay();
                }}
                onPause={() => {
                  // Pausing one video because another started shouldn't bring the music back.
                  if (!files.current.some((el) => el && !el.paused)) onStop();
                }}
              />
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

function PlayOverlay({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} className="group absolute inset-0 flex items-center justify-center bg-black/25 transition hover:bg-black/15">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-xl ring-4 ring-white/40 transition group-hover:scale-110"
        style={{ background: "var(--primary)" }}
      >
        <Play size={28} fill="currentColor" className="ml-1" />
      </span>
    </button>
  );
}

function FileVideo({
  src,
  poster,
  label,
  videoRef,
  onPlay,
  onPause,
}: {
  src: string;
  poster: string;
  label: string;
  videoRef: (el: HTMLVideoElement | null) => void;
  onPlay: (el: HTMLVideoElement) => void;
  onPause: () => void;
}) {
  const el = useRef<HTMLVideoElement | null>(null);
  const [started, setStarted] = useState(false);

  return (
    <div className="card relative overflow-hidden bg-black">
      <video
        ref={(node) => {
          el.current = node;
          videoRef(node);
        }}
        // Without a poster, iOS shows a blank box unless asked to seek to the first frame.
        src={poster ? src : `${src}#t=0.1`}
        poster={poster || undefined}
        controls={started}
        playsInline
        preload="metadata"
        className="block max-h-[80dvh] w-full bg-black object-contain"
        onPlay={(e) => {
          setStarted(true);
          onPlay(e.currentTarget);
        }}
        onPause={onPause}
        onEnded={onPause}
      />
      {!started && <PlayOverlay label={label} onClick={() => el.current?.play().catch(() => setStarted(true))} />}
    </div>
  );
}

function YouTube({ id, vertical, poster, label, onStart }: { id: string; vertical: boolean; poster: string; label: string; onStart: () => void }) {
  const [started, setStarted] = useState(false);

  return (
    <div className={`card relative mx-auto overflow-hidden bg-black ${vertical ? "aspect-[9/16] max-w-[320px]" : "aspect-video"}`}>
      {started ? (
        <iframe
          src={youTubeEmbed(id)}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <>
          <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <PlayOverlay
            label={label}
            onClick={() => {
              setStarted(true);
              onStart();
            }}
          />
        </>
      )}
    </div>
  );
}
