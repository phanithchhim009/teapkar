import { WishList } from "@/components/admin/WishList";
import { listWishes, requireEvent } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function WishesPage({ params }: { params: Promise<{ eventId: string }> }) {
  const event = await requireEvent((await params).eventId);
  const wishes = await listWishes(event.id);
  return <WishList eventId={event.id} wishes={wishes} />;
}
