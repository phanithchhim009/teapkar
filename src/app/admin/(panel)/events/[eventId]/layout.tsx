import { EventTabs } from "@/components/admin/EventTabs";
import { listEventNames, requireEvent } from "@/lib/admin-data";
import { requireUser } from "@/lib/auth";
import { EVENT_TYPE_INFO, hostsLabel } from "@/lib/event-types";

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const event = await requireEvent((await params).eventId);
  const events = await listEventNames(await requireUser());
  return (
    <div className="space-y-6">
      <EventTabs
        eventId={event.id}
        name={event.name || hostsLabel(event) || "Untitled event"}
        typeLabel={EVENT_TYPE_INFO[event.type].label}
        date={
          event.event_date &&
          new Date(event.event_date).toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Phnom_Penh" })
        }
        events={events}
      />
      {children}
    </div>
  );
}
