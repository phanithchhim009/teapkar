"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/admin";
import { Button, Card, Input } from "@/components/admin/ui";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main className="flex min-h-dvh items-center justify-center bg-rose-50 p-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold">Teabkar</h1>
        <p className="mb-5 text-sm text-neutral-500">ចូលគ្រប់គ្រងសំបុត្ររបស់អ្នក · Sign in to manage your invitation</p>
        <form action={action} className="space-y-3">
          <Input name="username" placeholder="ឈ្មោះអ្នកប្រើ · Username" autoComplete="username" autoCapitalize="none" autoCorrect="off" autoFocus />
          <Input name="password" type="password" placeholder="ពាក្យសម្ងាត់ · Password" autoComplete="current-password" required />
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button className="w-full" loading={pending}>
            {pending ? "Signing in…" : "ចូល · Sign in"}
          </Button>
          <p className="text-center text-xs text-neutral-400">Site owner: leave the username empty.</p>
        </form>
      </Card>
    </main>
  );
}
