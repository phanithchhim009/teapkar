"use client";

import { Eye, EyeOff, Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteWish, setWishApproved } from "@/app/actions/admin";
import type { ActionResult } from "@/lib/action-result";
import type { Wish } from "@/lib/types";
import { Badge, Button, Card } from "./ui";

export function WishList({ eventId, wishes }: { eventId: number; wishes: Wish[] }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  // The button that started the running action, e.g. "12:delete", so only it spins.
  const [busy, setBusy] = useState("");
  const run = (key: string, action: () => Promise<ActionResult>) =>
    start(async () => {
      setBusy(key);
      setError("");
      const res = await action();
      if (!res.ok) setError(res.error);
    });
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Wishes <span className="text-base font-normal text-neutral-400">({wishes.length})</span>
      </h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {wishes.length === 0 && <Card className="text-center text-sm text-neutral-500">No wishes yet.</Card>}
      <div className="grid gap-3 md:grid-cols-2">
        {wishes.map((w) => (
          <Card key={w.id} className={w.approved ? "" : "opacity-60"}>
            <p className="whitespace-pre-line text-sm">{w.message}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="text-xs text-neutral-500">
                <span className="font-medium text-neutral-700">{w.guest?.name}</span> · {new Date(w.created_at).toLocaleString("en-GB", { timeZone: "Asia/Phnom_Penh" })}
                {!w.approved && (
                  <span className="ml-2">
                    <Badge tone="amber">Hidden</Badge>
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => run(`${w.id}:approve`, () => setWishApproved(eventId, w.id, !w.approved))}
                  title={w.approved ? "Hide from invitation" : "Show on invitation"}
                >
                  {pending && busy === `${w.id}:approve` ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : w.approved ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  disabled={pending}
                  onClick={() => confirm("Delete this wish?") && run(`${w.id}:delete`, () => deleteWish(eventId, w.id))}
                  title="Delete"
                >
                  {pending && busy === `${w.id}:delete` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
