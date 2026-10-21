import { EventForm } from "@/components/admin/EventForm";
import { listEventNames } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function NewEventPage({ searchParams }: { searchParams: Promise<{ copy?: string }> }) {
  const [{ copy }, events] = await Promise.all([searchParams, listEventNames()]);
  const copyFrom = events.find((e) => String(e.id) === copy)?.id ?? null;
  return <EventForm events={events} copyFrom={copyFrom} />;
}
