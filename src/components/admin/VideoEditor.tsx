"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { Video } from "@/lib/types";
import { parseYouTube } from "@/lib/video";
import { MediaUpload } from "./MediaUpload";
import { Button, Card } from "./ui";

const key = () => Math.random().toString(36).slice(2);

function swap<T>(arr: T[], i: number, j: number) {
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Edits the pre-wedding video list. Changes are saved with the page's main Save button. */
export function VideoEditor({ value, onChange }: { value: Video[]; onChange: (v: Video[]) => void }) {
  const patch = (i: number, p: Partial<Video>) => onChange(value.map((v, j) => (j === i ? { ...v, ...p } : v)));

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500">
        Upload a short clip (MP4 recommended, up to 50MB) or paste a YouTube link. Longer films are better on YouTube: they load faster for guests and
        don&apos;t use your storage. Background music pauses while a video plays.
      </p>

      {value.map((v, i) => (
        <Card key={v.id || i} className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-neutral-700">Video {i + 1}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" type="button" onClick={() => onChange(swap(value, i, i - 1))} aria-label="Move up">
                <ArrowUp size={14} />
              </Button>
              <Button size="sm" variant="ghost" type="button" onClick={() => onChange(swap(value, i, i + 1))} aria-label="Move down">
                <ArrowDown size={14} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600"
                type="button"
                onClick={() => confirm("Remove this video?") && onChange(value.filter((_, j) => j !== i))}
              >
                <Trash2 size={14} /> Remove
              </Button>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <MediaUpload label="Video file or YouTube link" kind="video" value={v.src} onChange={(src) => patch(i, { src })} />
            <MediaUpload
              label="Cover image (optional)"
              value={v.poster}
              onChange={(poster) => patch(i, { poster })}
              hint={parseYouTube(v.src) ? "Leave empty to use the YouTube thumbnail." : "Shown before the video plays."}
            />
          </div>
        </Card>
      ))}

      <Button variant="outline" type="button" disabled={value.length >= 10} onClick={() => onChange([...value, { id: key(), src: "", poster: "" }])}>
        <Plus size={16} /> Add video
      </Button>
    </div>
  );
}
