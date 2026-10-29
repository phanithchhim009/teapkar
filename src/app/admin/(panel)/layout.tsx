import { AdminNav } from "@/components/admin/AdminNav";
import { NavProgress } from "@/components/admin/NavProgress";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Teabkar Admin", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      <NavProgress />
      <AdminNav isOwner={user.role === "admin"} userName={user.name} />
      <main className="mx-auto max-w-7xl p-4 sm:p-6">{children}</main>
    </div>
  );
}
