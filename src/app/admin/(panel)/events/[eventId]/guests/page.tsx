import { GuestManager } from "@/components/admin/GuestManager";
import { listGuests, requireEvent } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function GuestsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const event = await requireEvent((await params).eventId);
  const guests = await listGuests(event.id);
  return <GuestManager eventId={event.id} guests={guests} siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? ""} />;
}
