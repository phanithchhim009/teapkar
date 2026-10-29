"use client";

import { CalendarHeart, Heart, Loader2, LogOut, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import { logout } from "@/app/actions/admin";
import { cx } from "./ui";

export function AdminNav({ isOwner, userName }: { isOwner: boolean; userName: string }) {
  const path = usePathname();
  const active = path === "/admin" || path.startsWith("/admin/events");
  const accountsActive = path.startsWith("/admin/accounts");
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
        <Link href="/admin" className="mr-2 flex items-center gap-1.5 font-semibold text-rose-600">
          <Heart size={18} fill="currentColor" /> <span className="hidden sm:inline">Teabkar</span>
        </Link>
        <nav className="flex flex-1 gap-1 overflow-x-auto">
          <Link
            href="/admin"
            className={cx(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm",
              active ? "bg-rose-50 font-medium text-rose-700" : "text-neutral-600 hover:bg-neutral-100",
            )}
          >
            <CalendarHeart size={16} /> <span>Events</span>
          </Link>
          {isOwner && (
            <Link
              href="/admin/accounts"
              className={cx(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm",
                accountsActive ? "bg-rose-50 font-medium text-rose-700" : "text-neutral-600 hover:bg-neutral-100",
              )}
            >
              <Users size={16} /> <span>Accounts</span>
            </Link>
          )}
        </nav>
        <span className="hidden items-center gap-1.5 text-sm text-neutral-500 sm:flex">
          <UserRound size={15} /> {userName}
        </span>
        <form action={logout}>
          <LogoutButton />
        </form>
      </div>
    </header>
  );
}

function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100"
      aria-label="Log out"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
    </button>
  );
}
