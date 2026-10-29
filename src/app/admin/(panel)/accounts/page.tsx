import { AccountManager } from "@/components/admin/AccountManager";
import { listAccounts, listEvents } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Accounts · Teabkar Admin", robots: { index: false } };

export default async function AccountsPage() {
  const user = await requireAdmin();
  const [accounts, events] = await Promise.all([listAccounts(), listEvents(user)]);
  return (
    <AccountManager
      accounts={accounts}
      events={events.map((e) => ({ id: e.id, name: e.name || `Event ${e.id}`, accountId: e.account_id }))}
      siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? ""}
    />
  );
}
