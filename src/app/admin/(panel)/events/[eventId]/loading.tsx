import { Card } from "@/components/admin/ui";

// Sits under the event layout, so the event header and tabs stay put while a tab's content loads.
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4" aria-busy aria-label="Loading">
      <div className="h-7 w-48 rounded-lg bg-neutral-200" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i} className="h-24">
            <span />
          </Card>
        ))}
      </div>
      <Card className="space-y-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-5 rounded bg-neutral-100" style={{ width: `${90 - (i % 3) * 15}%` }} />
        ))}
      </Card>
    </div>
  );
}
