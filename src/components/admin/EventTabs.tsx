"use client";

import { ExternalLink, LayoutDashboard, Loader2, type LucideIcon, MessageSquareHeart, Palette, Users } from "lucide-react";
import Link, { useLinkStatus } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { startNavProgress } from "./NavProgress";
import { Badge, cx, Select } from "./ui";

const tabs = [
  { path: "", label: "Dashboard", icon: LayoutDashboard },
  { path: "/guests", label: "Guests", icon: Users },
  { path: "/customize", label: "Customize", icon: Palette },
  { path: "/wishes", label: "Wishes", icon: MessageSquareHeart },
];

type Props = {
  eventId: number;
  name: string;
  typeLabel: string;
  date: string | null;
  events: { id: number; name: string }[];
};

export function EventTabs({ eventId, name, typeLabel, date, events }: Props) {
  const path = usePathname();
  const router = useRouter();
  const [switching, startSwitch] = useTransition();
  const base = `/admin/events/${eventId}`;
  const current = tabs.find((t) => t.path && path.startsWith(base + t.path)) ?? tabs[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-2xl font-semibold">{name}</h1>
            <Badge>{typeLabel}</Badge>
          </div>
          {date && <p className="text-sm text-neutral-500">{date}</p>}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/admin/preview/${eventId}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm text-neutral-600 hover:bg-neutral-100"
          >
            <ExternalLink size={16} /> Preview
          </a>
          {switching && <Loader2 size={16} className="animate-spin text-rose-600" aria-label="Loading event" />}
          {events.length > 1 && (
            <Select
              aria-label="Switch event"
              className="w-48"
              value={eventId}
              // Stay on the same tab when switching events.
              onChange={(e) => {
                const href = `/admin/events/${e.target.value}${current.path}`;
                startNavProgress();
                startSwitch(() => router.push(href));
              }}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name || `Event ${ev.id}`}
                </option>
              ))}
            </Select>
          )}
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-neutral-200">
        {tabs.map(({ path: tabPath, label, icon: Icon }) => {
          const active = current.path === tabPath;
          return (
            <Link
              key={label}
              href={base + tabPath}
              className={cx(
                "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm",
                active ? "border-rose-600 font-medium text-rose-700" : "border-transparent text-neutral-600 hover:text-neutral-900",
              )}
            >
              <TabIcon icon={Icon} /> {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/** The tab's icon, swapped for a spinner while that tab is loading. */
function TabIcon({ icon: Icon }: { icon: LucideIcon }) {
  const { pending } = useLinkStatus();
  return pending ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />;
}
