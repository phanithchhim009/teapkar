"use client";

import { Check, Copy, KeyRound, Plus, Send, Trash2, UserRound, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { assignEvent, createAccount, deleteAccount, resetAccountPassword } from "@/app/actions/admin";
import { unwrap } from "@/lib/action-result";
import type { AccountRow } from "@/lib/admin-data";
import { Badge, Button, Card, Field, Input, Modal, Select } from "./ui";

type EventOption = { id: number; name: string; accountId: string | null };
type Credentials = { username: string; password: string };

/** Site owner: create customer logins, give each one its event(s), reset passwords. */
export function AccountManager({ accounts, events, siteUrl }: { accounts: AccountRow[]; events: EventOption[]; siteUrl: string }) {
  const [creating, setCreating] = useState(false);
  const [shown, setShown] = useState<Credentials | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const [base, setBase] = useState(siteUrl);
  useEffect(() => {
    if (!siteUrl) setBase(window.location.origin);
  }, [siteUrl]);

  const run = (fn: () => Promise<void>) =>
    start(async () => {
      setError("");
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });

  const owner = (accountId: string | null) => accounts.find((a) => a.id === accountId);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Customer accounts</h1>
          <p className="max-w-2xl text-sm text-neutral-500">
            Give each couple their own login. They can edit only the events you assign to them: guests, design, story, video and wishes. They can&apos;t create or
            delete events, or see anyone else&apos;s.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus size={16} /> New account
        </Button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {accounts.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <UserRound size={32} className="text-neutral-300" />
          <div>
            <p className="font-medium">No customer accounts yet</p>
            <p className="text-sm text-neutral-500">Create one, assign the couple&apos;s event, and send them the login details.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {accounts.map((a) => {
            const unassigned = events.filter((e) => e.accountId !== a.id);
            return (
              <Card key={a.id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{a.name || a.username}</p>
                    <p className="text-sm text-neutral-500">
                      Username: <span className="font-mono text-neutral-800">{a.username}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() =>
                        confirm(`Make a new password for ${a.username}? The old one stops working and they are signed out.`) &&
                        run(async () => setShown(unwrap(await resetAccountPassword(a.id))))
                      }
                    >
                      <KeyRound size={14} /> New password
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                      disabled={pending}
                      aria-label={`Delete ${a.username}`}
                      onClick={() =>
                        confirm(`Delete the login “${a.username}”? Their events are kept; only the login is removed.`) &&
                        run(async () => unwrap(await deleteAccount(a.id)))
                      }
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Events</p>
                  <div className="flex flex-wrap gap-1.5">
                    {a.events.length === 0 && <span className="text-sm text-neutral-400">None yet</span>}
                    {a.events.map((e) => (
                      <span key={e.id} className="inline-flex items-center gap-1 rounded-full bg-rose-50 py-0.5 pl-2.5 pr-1 text-sm text-rose-800">
                        {e.name || `Event ${e.id}`}
                        <button
                          className="rounded-full p-0.5 hover:bg-rose-100"
                          aria-label={`Remove ${e.name} from ${a.username}`}
                          disabled={pending}
                          onClick={() => run(async () => unwrap(await assignEvent(e.id, null)))}
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                  {unassigned.length > 0 && (
                    <Select
                      value=""
                      disabled={pending}
                      aria-label={`Give an event to ${a.username}`}
                      onChange={(ev) => {
                        const id = Number(ev.target.value);
                        const taken = owner(events.find((e) => e.id === id)?.accountId ?? null);
                        if (taken && !confirm(`This event belongs to ${taken.username}. Move it to ${a.username}?`)) return;
                        run(async () => unwrap(await assignEvent(id, a.id)));
                      }}
                    >
                      <option value="">+ Give an event…</option>
                      {unassigned.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                          {e.accountId ? ` (now: ${owner(e.accountId)?.username ?? "another account"})` : ""}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {creating && (
        <NewAccountForm
          events={events}
          owner={owner}
          onClose={() => setCreating(false)}
          onCreated={(c) => {
            setCreating(false);
            setShown(c);
          }}
        />
      )}
      {shown && <CredentialsModal credentials={shown} loginUrl={`${base}/admin/login`} onClose={() => setShown(null)} />}
    </div>
  );
}

function NewAccountForm({
  events,
  owner,
  onClose,
  onCreated,
}: {
  events: EventOption[];
  owner: (id: string | null) => AccountRow | undefined;
  onClose: () => void;
  onCreated: (c: Credentials) => void;
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [eventId, setEventId] = useState(() => String(events.find((e) => !e.accountId)?.id ?? ""));
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <Modal open onClose={onClose} title="New customer account">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            setError("");
            try {
              onCreated(unwrap(await createAccount({ name, username, eventId: eventId ? Number(eventId) : null })));
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed");
            }
          });
        }}
      >
        <Field label="Couple / customer name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ផានិត & លក្ខណា" autoFocus />
        </Field>
        <Field label="Username (what they type to sign in)" hint="Letters, numbers, dots or dashes, no spaces. e.g. phanith.lakhena">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
            required
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="phanith.lakhena"
          />
        </Field>
        <Field label="Their event">
          <Select value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">— None for now —</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
                {e.accountId ? ` (now: ${owner(e.accountId)?.username ?? "another account"})` : ""}
              </option>
            ))}
          </Select>
        </Field>
        <p className="text-xs text-neutral-500">A password is generated for you and shown once on the next screen.</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={pending}>Create account</Button>
        </div>
      </form>
    </Modal>
  );
}

/** Shown once after creating an account or resetting its password: the only time the password is visible. */
function CredentialsModal({ credentials: c, loginUrl, onClose }: { credentials: Credentials; loginUrl: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const message = [
    "សូមចូលគ្រប់គ្រងសំបុត្រអាពាហ៍ពិពាហ៍របស់អ្នក",
    "Sign in to manage your wedding invitation:",
    loginUrl,
    `ឈ្មោះអ្នកប្រើ / Username: ${c.username}`,
    `ពាក្យសម្ងាត់ / Password: ${c.password}`,
  ].join("\n");

  return (
    <Modal open onClose={onClose} title="Send these login details">
      <div className="space-y-4">
        <p className="text-sm text-amber-800">
          <Badge tone="amber">Shown once</Badge> Copy or send it now. The password can&apos;t be shown again; if it&apos;s lost, make a new one.
        </p>
        <pre className="whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 font-mono text-sm leading-6">{message}</pre>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigator.clipboard.writeText(message).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              })
            }
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />} {copied ? "Copied" : "Copy message"}
          </Button>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(loginUrl)}&text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium hover:bg-neutral-50"
          >
            <Send size={16} /> Telegram
          </a>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
