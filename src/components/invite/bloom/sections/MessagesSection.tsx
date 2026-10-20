"use client";

import { Rsvp } from "../../Rsvp";
import { useWishes, type PublicWish } from "../../Wishes";
import { Tx, useBloom } from "../BloomContext";
import { shortStamp } from "../date";
import { Reveal } from "../Reveal";
import { Heading, Section } from "./Heading";

type Props = {
  code: string;
  preview: boolean;
  wishes: PublicWish[] | null; // null = guestbook switched off
  rsvp: { status: "pending" | "yes" | "no"; count: number } | null; // null = RSVP switched off
};

/** RSVP + guestbook in one section, so the dock keeps a single "messages" stop. */
export function MessagesSection({ code, preview, wishes, rsvp }: Props) {
  const { t } = useBloom();
  return (
    <Section id="messages">
      <Heading title={wishes ? t.messages : t.rsvp} />
      {rsvp && (
        <Reveal variant="scaleIn" className="mb-8">
          {wishes && (
            <p className="font-title mb-3 text-center text-sm leading-[1.9] text-[var(--green)]">
              <Tx>{t.rsvp}</Tx>
            </p>
          )}
          <Rsvp code={code} initialStatus={rsvp.status} initialCount={rsvp.count} preview={preview} t={t} />
        </Reveal>
      )}
      {wishes && <Guestbook code={code} preview={preview} initial={wishes} />}
    </Section>
  );
}

function Guestbook({ code, preview, initial }: { code: string; preview: boolean; initial: PublicWish[] }) {
  const { t, lang } = useBloom();
  const { wishes, message, setMessage, error, pending, submit } = useWishes({ code, initial, preview, t });

  return (
    <>
      {wishes.length > 0 && (
        <Reveal variant="fadeUpMd">
          <ul className="bloom-inner-scroll max-h-[22rem] space-y-3 overflow-y-auto overscroll-contain pr-1">
            {wishes.map((w) => (
              <li key={w.id} className="rounded-2xl p-4 text-white shadow-sm" style={{ background: "color-mix(in srgb, var(--sage) 88%, transparent)" }}>
                <p className="font-semibold leading-[1.8]">{w.name}</p>
                <div className="my-1.5 h-px bg-white/50" />
                <p className="whitespace-pre-line text-sm italic leading-[1.8]">{w.message}</p>
                <p className="mt-1 text-right text-[0.7rem] opacity-80">{shortStamp(w.created_at, lang)}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
      <Reveal variant="fadeUp" className="mt-5">
        <form onSubmit={submit} className="bloom-card space-y-3 p-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder={t.wishPlaceholder}
            aria-label={t.wishPlaceholder}
            className="w-full resize-none rounded-xl border border-[var(--sage)] bg-white/80 p-3 text-sm leading-[1.8] text-[var(--green)] outline-none focus:ring-2 focus:ring-[var(--sage)]"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={pending || !message.trim()} className="bloom-pill w-full py-2.5 text-sm font-semibold disabled:opacity-60">
            {pending ? "…" : <Tx>{t.send}</Tx>}
          </button>
        </form>
      </Reveal>
    </>
  );
}
