import { CheckCircle2, Eye, HelpCircle, UserCheck, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { Badge, Card } from "@/components/admin/ui";
import { listGuests, listRecentWishes, requireEvent } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function EventDashboard({ params }: { params: Promise<{ eventId: string }> }) {
  const { id } = await requireEvent((await params).eventId);
  const [guests, wishes] = await Promise.all([listGuests(id), listRecentWishes(id, 6)]);
  const opened = guests.filter((g) => g.opened_at).length;
  const yes = guests.filter((g) => g.rsvp_status === "yes");
  const no = guests.filter((g) => g.rsvp_status === "no").length;
  const pending = guests.length - yes.length - no;
  const attendees = yes.reduce((sum, g) => sum + g.rsvp_count, 0);
  const pct = (n: number) => (guests.length ? Math.round((n / guests.length) * 100) : 0);

  const stats = [
    { label: "Guests", value: guests.length, icon: Users, color: "text-neutral-700" },
    { label: "Opened", value: opened, sub: `${pct(opened)}%`, icon: Eye, color: "text-sky-600" },
    { label: "Attending", value: yes.length, sub: `${pct(yes.length)}%`, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Declined", value: no, icon: XCircle, color: "text-red-600" },
    { label: "No reply", value: pending, icon: HelpCircle, color: "text-amber-600" },
    { label: "Total attendees", value: attendees, icon: UserCheck, color: "text-rose-600" },
  ];

  const recentOpens = guests
    .filter((g) => g.opened_at)
    .sort((a, b) => (b.opened_at ?? "").localeCompare(a.opened_at ?? ""))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="p-4">
            <Icon size={18} className={color} />
            <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
            <p className="text-xs text-neutral-500">
              {label} {sub && <span className="ml-1 text-neutral-400">· {sub}</span>}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Recently opened</h2>
            <Link href={`/admin/events/${id}/guests`} className="text-sm text-rose-600 hover:underline">
              All guests →
            </Link>
          </div>
          {recentOpens.length === 0 ? (
            <p className="text-sm text-neutral-500">No one has opened their invitation yet.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {recentOpens.map((g) => (
                <li key={g.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{g.name}</span>
                  <span className="flex items-center gap-2">
                    {g.rsvp_status === "yes" && <Badge tone="green">Yes · {g.rsvp_count}</Badge>}
                    {g.rsvp_status === "no" && <Badge tone="red">No</Badge>}
                    <span className="text-xs text-neutral-400">{new Date(g.opened_at!).toLocaleString("en-GB", { timeZone: "Asia/Phnom_Penh" })}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Latest wishes</h2>
            <Link href={`/admin/events/${id}/wishes`} className="text-sm text-rose-600 hover:underline">
              All wishes →
            </Link>
          </div>
          {wishes.length === 0 ? (
            <p className="text-sm text-neutral-500">No wishes yet.</p>
          ) : (
            <ul className="space-y-3">
              {wishes.map((w) => (
                <li key={w.id} className="text-sm">
                  <p className="line-clamp-2">{w.message}</p>
                  <p className="text-xs text-neutral-500">— {w.guest?.name}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
