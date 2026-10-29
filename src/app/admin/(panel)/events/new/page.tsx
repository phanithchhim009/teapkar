import { EventForm } from "@/components/admin/EventForm";
import { listEventNames } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewEventPage({ searchParams }: { searchParams: Promise<{ copy?: string }> }) {
  const user = await requireAdmin();
  const [{ copy }, events] = await Promise.all([searchParams, listEventNames(user)]);
  const copyFrom = events.find((e) => String(e.id) === copy)?.id ?? null;
  return <EventForm events={events} copyFrom={copyFrom} />;
}
