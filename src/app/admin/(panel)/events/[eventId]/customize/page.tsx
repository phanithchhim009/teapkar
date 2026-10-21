import { CustomizeEditor } from "@/components/admin/CustomizeEditor";
import { requireEvent } from "@/lib/admin-data";
import { getAgenda } from "@/lib/event";

export const dynamic = "force-dynamic";

export default async function CustomizePage({ params }: { params: Promise<{ eventId: string }> }) {
  const event = await requireEvent((await params).eventId);
  const agenda = await getAgenda(event.id);
  return <CustomizeEditor initial={event} agenda={agenda} />;
}
