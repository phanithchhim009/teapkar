import { EventList } from "@/components/admin/EventList";
import { listEvents } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await listEvents();
  // Taken on the server so "in N days" labels match between render and hydration.
  return <EventList events={events} now={Date.now()} />;
}
