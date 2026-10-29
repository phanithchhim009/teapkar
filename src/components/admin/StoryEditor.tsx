"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { StoryItem } from "@/lib/types";
import { MediaUpload } from "./MediaUpload";
import { Button, Card, Field, Input, Textarea } from "./ui";

const key = () => Math.random().toString(36).slice(2);

const EMPTY: Omit<StoryItem, "id"> = { date: "", photo: "", title_kh: "", title_en: "", text_kh: "", text_en: "" };

function swap<T>(arr: T[], i: number, j: number) {
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Edits the "Our story" timeline. Changes are saved with the page's main Save button. */
export function StoryEditor({ value, onChange }: { value: StoryItem[]; onChange: (v: StoryItem[]) => void }) {
  const patch = (i: number, p: Partial<StoryItem>) => onChange(value.map((s, j) => (j === i ? { ...s, ...p } : s)));

  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-500">
        Tell how you met, chapter by chapter: high school, first date, the proposal… Each chapter shows as a step on a timeline. Fill in Khmer, English or both;
        if one language is empty the other is shown.
      </p>

      {value.map((s, i) => (
        <Card key={s.id || i} className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-neutral-700">Chapter {i + 1}</span>
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
                onClick={() => confirm("Remove this chapter?") && onChange(value.filter((_, j) => j !== i))}
              >
                <Trash2 size={14} /> Remove
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr]">
            <MediaUpload label="Photo" value={s.photo} onChange={(v) => patch(i, { photo: v })} />
            <Field label="Date / period" hint="Shown as a label, e.g. “2015 · High school” or “ឆ្នាំ២០១៥”">
              <Input value={s.date} onChange={(e) => patch(i, { date: e.target.value })} placeholder="2015 · High school" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title (ខ្មែរ)">
              <Input value={s.title_kh} onChange={(e) => patch(i, { title_kh: e.target.value })} placeholder="ជួបគ្នាដំបូងនៅវិទ្យាល័យ" />
            </Field>
            <Field label="Title (English)">
              <Input value={s.title_en} onChange={(e) => patch(i, { title_en: e.target.value })} placeholder="We met in high school" />
            </Field>
            <Field label="Story (ខ្មែរ)">
              <Textarea rows={4} value={s.text_kh} onChange={(e) => patch(i, { text_kh: e.target.value })} />
            </Field>
            <Field label="Story (English)">
              <Textarea rows={4} value={s.text_en} onChange={(e) => patch(i, { text_en: e.target.value })} />
            </Field>
          </div>
        </Card>
      ))}

      <Button variant="outline" type="button" disabled={value.length >= 30} onClick={() => onChange([...value, { id: key(), ...EMPTY }])}>
        <Plus size={16} /> Add chapter
      </Button>
    </div>
  );
}
