import { redirect } from "next/navigation";
import { EventList } from "@/components/admin/EventList";
import { listEvents } from "@/lib/admin-data";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const user = await requireUser();
  const events = await listEvents(user);
  // A couple with a single invitation goes straight to it.
  if (user.role === "customer" && events.length === 1) redirect(`/admin/events/${events[0].id}`);
  // Taken on the server so "in N days" labels match between render and hydration.
  return <EventList events={events} now={Date.now()} canManage={user.role === "admin"} />;
}
