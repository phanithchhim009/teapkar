"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createEvent } from "@/app/actions/admin";
import { EVENT_TYPE_INFO } from "@/lib/event-types";
import { EVENT_TYPES, type EventType } from "@/lib/types";
import { startNavProgress } from "./NavProgress";
import { Button, Card, Field, Input, Select } from "./ui";

// Entered in Cambodia time (UTC+7, no DST), as in the Customize editor.
const fromLocalInput = (value: string) => (value ? new Date(`${value}:00+07:00`).toISOString() : null);

export function EventForm({ events, copyFrom }: { events: { id: number; name: string }[]; copyFrom: number | null }) {
  const router = useRouter();
  const [type, setType] = useState<EventType>("wedding");
  const [name, setName] = useState("");
  const [hostA, setHostA] = useState("");
  const [hostB, setHostB] = useState("");
  const [date, setDate] = useState("");
  const [copy, setCopy] = useState(copyFrom ? String(copyFrom) : "");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const info = EVENT_TYPE_INFO[type];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      setError("");
      const res = await createEvent({
        type,
        name,
        host_a: hostA,
        host_b: hostB,
        event_date: fromLocalInput(date),
        copyFromEventId: copy ? Number(copy) : null,
      });
      if (!res.ok) return setError(res.error);
      // A fresh transition (this code runs after an await), so the button keeps spinning until Customize has loaded.
      startNavProgress();
      start(() => router.push(`/admin/events/${res.data.id}/customize`));
    });
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">New event</h1>
      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event type">
            <Select value={type} onChange={(e) => setType(e.target.value as EventType)}>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {EVENT_TYPE_INFO[t].label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Event name" hint="Only shown in the admin, e.g. “Dara & Sophea wedding”.">
            <Input required maxLength={120} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`${info.hostLabels[0]} name`}>
            <Input maxLength={120} value={hostA} onChange={(e) => setHostA(e.target.value)} />
          </Field>
          {info.pair && (
            <Field label={`${info.hostLabels[1]} name`}>
              <Input maxLength={120} value={hostB} onChange={(e) => setHostB(e.target.value)} />
            </Field>
          )}
        </div>
        <Field label="Date & time (Cambodia time)" hint="Optional; used for the countdown.">
          <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        {events.length > 0 && (
          <Field
            label="Start from"
            hint="Copying keeps the theme, media, text, sections and agenda of that event, but not its guests."
          >
            <Select value={copy} onChange={(e) => setCopy(e.target.value)}>
              <option value="">Default {info.label.toLowerCase()} text</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  Copy design from “{ev.name || `Event ${ev.id}`}”
                </option>
              ))}
            </Select>
          </Field>
        )}
      </Card>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <Link href="/admin" className="inline-flex h-10 items-center rounded-lg px-4 text-sm text-neutral-700 hover:bg-neutral-100">
          Cancel
        </Link>
        <Button type="submit" loading={pending}>
          {pending ? "Creating…" : "Create event"}
        </Button>
      </div>
    </form>
  );
}
