import Link from "next/link";
import { Card } from "@/components/admin/ui";

export default function AdminNotFound() {
  return (
    <Card className="mx-auto max-w-md space-y-3 text-center">
      <h1 className="text-lg font-semibold">Event not found</h1>
      <p className="text-sm text-neutral-500">It may have been deleted.</p>
      <Link href="/admin" className="text-sm text-rose-600 hover:underline">
        Back to events
      </Link>
    </Card>
  );
}
