import { Card } from "@/components/admin/ui";

export default function Loading() {
  return (
    <div className="animate-pulse space-y-5" aria-busy aria-label="Loading">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded-lg bg-neutral-200" />
          <div className="h-4 w-32 rounded bg-neutral-200" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-neutral-200" />
      </div>
      <div className="h-10 w-full max-w-sm rounded-lg bg-neutral-200" />
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i} className="flex gap-4 p-4">
            <div className="h-52 w-28 shrink-0 rounded-lg bg-neutral-200" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-24 rounded-full bg-neutral-200" />
              <div className="h-5 w-3/4 rounded bg-neutral-200" />
              <div className="h-4 w-1/2 rounded bg-neutral-200" />
              <div className="h-2 w-full rounded-full bg-neutral-200" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-12 rounded-lg bg-neutral-100" />
                <div className="h-12 rounded-lg bg-neutral-100" />
                <div className="h-12 rounded-lg bg-neutral-100" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
