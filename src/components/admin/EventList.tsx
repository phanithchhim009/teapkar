"use client";

import { CalendarDays, Copy, Loader2, Plus, Search, Trash2 } from "lucide-react";
import Link, { useLinkStatus } from "next/link";
import { useMemo, useState, useTransition } from "react";
import { deleteEvent } from "@/app/actions/admin";
import { EVENT_TYPE_INFO, hostsLabel } from "@/lib/event-types";
import type { EventSummary } from "@/lib/types";
import { PreviewThumb } from "./PreviewThumb";
import { Badge, Button, Card, Field, Input, Modal, cx } from "./ui";

const FILTERS = ["All", "Upcoming", "Past"] as const;
type Filter = (typeof FILTERS)[number];

// Calendar days are counted in Cambodia time (UTC+7), like the dates shown.
const DAY_MS = 24 * 60 * 60 * 1000;
const dayIndex = (ms: number) => Math.floor((ms + 7 * 60 * 60 * 1000) / DAY_MS);

/** Whole days from today until the event; null without a date. */
function daysUntil(ev: EventSummary, now: number) {
  return ev.event_date ? dayIndex(new Date(ev.event_date).getTime()) - dayIndex(now) : null;
}

function DateStatus({ days }: { days: number | null }) {
  if (days === null) return <Badge>No date</Badge>;
  if (days === 0) return <Badge tone="green">Today</Badge>;
  if (days < 0) return <Badge>Past</Badge>;
  return <Badge tone={days <= 7 ? "amber" : "blue"}>{days === 1 ? "Tomorrow" : `In ${days} days`}</Badge>;
}

/** Rendered inside the card's link: covers the card with a spinner while that event is loading. */
function CardPending() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-[1px]">
      <Loader2 size={28} className="animate-spin text-rose-600" />
    </span>
  );
}

const newEventLink = "inline-flex h-10 items-center gap-1.5 rounded-lg bg-rose-600 px-4 text-sm font-medium text-white hover:bg-rose-700";

export function EventList({ events, now }: { events: EventSummary[]; now: number }) {
  const [deleting, setDeleting] = useState<EventSummary | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  // Undated events count as upcoming: they are still being set up.
  const upcoming = events.filter((ev) => (daysUntil(ev, now) ?? 0) >= 0).length;
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((ev) => {
      const past = (daysUntil(ev, now) ?? 0) < 0;
      if ((filter === "Upcoming" && past) || (filter === "Past" && !past)) return false;
      return !q || [ev.name, ev.host_a, ev.host_b].some((s) => s?.toLowerCase().includes(q));
    });
  }, [events, now, query, filter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Events</h1>
          <p className="text-sm text-neutral-500">
            {events.length} event{events.length === 1 ? "" : "s"} · {upcoming} upcoming
          </p>
        </div>
        <Link href="/admin/events/new" className={newEventLink}>
          <Plus size={16} /> New event
        </Link>
      </div>

      {events.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <CalendarDays size={32} className="text-neutral-300" />
          <div>
            <p className="font-medium">No events yet</p>
            <p className="text-sm text-neutral-500">Create one to design the invitation and start inviting guests.</p>
          </div>
          <Link href="/admin/events/new" className={newEventLink}>
            <Plus size={16} /> New event
          </Link>
        </Card>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events or hosts" className="pl-9" aria-label="Search events" />
          </div>
          <div className="inline-flex rounded-lg bg-neutral-100 p-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={cx("rounded-md px-3 py-1.5 text-sm", filter === f ? "bg-white font-medium shadow-sm" : "text-neutral-500 hover:text-neutral-800")}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {events.length > 0 && shown.length === 0 && <p className="py-8 text-center text-sm text-neutral-500">No events match.</p>}

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {shown.map((ev) => {
          const hosts = hostsLabel(ev);
          const name = ev.name || hosts || `Event ${ev.id}`;
          const href = `/admin/events/${ev.id}`;
          const openRate = ev.guests ? Math.round((ev.opened / ev.guests) * 100) : 0;
          return (
            <Card key={ev.id} className="relative flex gap-4 p-4 transition hover:border-neutral-300 hover:shadow-md">
              <PreviewThumb eventId={ev.id} scale={0.28} height={208} />
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge>{EVENT_TYPE_INFO[ev.type]?.label ?? ev.type}</Badge>
                    <DateStatus days={daysUntil(ev, now)} />
                  </div>
                  {/* Its ::after covers the whole card, so a click anywhere opens the event. */}
                  <Link href={href} className="block truncate font-semibold after:absolute after:inset-0 after:rounded-xl hover:text-rose-700">
                    {name}
                    <CardPending />
                  </Link>
                  {hosts && hosts !== name && <p className="truncate text-sm text-neutral-600">{hosts}</p>}
                  <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <CalendarDays size={14} />
                    {ev.event_date
                      ? new Date(ev.event_date).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "Asia/Phnom_Penh",
                        })
                      : "No date set"}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>
                      <span className="font-semibold tabular-nums text-neutral-800">{ev.opened}</span> of <span className="tabular-nums">{ev.guests}</span> opened
                    </span>
                    <span className="tabular-nums">{openRate}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: `${openRate}%` }} />
                  </div>
                </div>

                <dl className="grid grid-cols-3 gap-2 text-center">
                  {(
                    [
                      ["Yes", ev.rsvp_yes, "text-emerald-700"],
                      ["No", ev.rsvp_no, "text-neutral-500"],
                      ["Attending", ev.attending, "text-neutral-900"],
                    ] as const
                  ).map(([label, value, tone]) => (
                    <div key={label} className="flex flex-col-reverse rounded-lg bg-neutral-50 py-1.5">
                      <dt className="text-[11px] text-neutral-500">{label}</dt>
                      <dd className={cx("text-base font-semibold tabular-nums", tone)}>{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-auto flex items-center justify-between gap-1 border-t border-neutral-100 pt-2">
                  <span className="text-sm font-medium text-rose-700">Manage →</span>
                  <div className="relative z-10 flex gap-0.5">
                    <Link
                      href={`/admin/events/new?copy=${ev.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
                      title="Duplicate: new event with this design and agenda"
                      aria-label={`Duplicate ${name}`}
                    >
                      <Copy size={15} />
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-8 px-0 text-red-600 hover:bg-red-50"
                      onClick={() => setDeleting(ev)}
                      title="Delete"
                      aria-label={`Delete ${name}`}
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {deleting && <DeleteEvent event={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}

function DeleteEvent({ event, onClose }: { event: EventSummary; onClose: () => void }) {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const name = event.name || `Event ${event.id}`;

  return (
    <Modal open onClose={onClose} title="Delete event">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await deleteEvent(event.id);
            if (!res.ok) return setError(res.error);
            onClose();
          });
        }}
      >
        <p className="text-sm text-neutral-600">
          This permanently deletes <strong>{name}</strong> with its agenda, {event.guests} guest
          {event.guests === 1 ? "" : "s"} and their wishes. Their invitation links will stop working.
        </p>
        <Field label={`Type “${name}” to confirm`}>
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" disabled={typed.trim() !== name.trim()} loading={pending}>
            {pending ? "Deleting…" : "Delete event"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
