import { GuestManager } from "@/components/admin/GuestManager";
import { listGuests } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function GuestsPage() {
  const guests = await listGuests();
  return <GuestManager guests={guests} siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? ""} />;
}
