import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { FontLinks } from "@/components/invite/FontLinks";
import { Invitation } from "@/components/invite/Invitation";
import { getAgenda, getApprovedWishes, getEvent, getGuestByCode } from "@/lib/event";
import { shareTitle } from "@/lib/event-types";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ lang?: string }>;
};

const loadGuest = cache(getGuestByCode);
const loadEvent = cache(getEvent);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const guest = await loadGuest(code);
  const event = guest && (await loadEvent(guest.event_id));
  if (!guest || !event) return { title: "Not found" };
  const title = shareTitle(event, guest.lang);
  const description = guest.lang === "en" ? `Dear ${guest.name}` : `សូមគោរពអញ្ជើញ ${guest.name}`;
  const image = event.config.coverBackground || event.config.mainBackground || undefined;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website", images: image ? [image] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function InvitePage({ params, searchParams }: Props) {
  const { code } = await params;
  const { lang } = await searchParams;
  const guest = await loadGuest(code);
  if (!guest) notFound();
  // The guest decides the event, so these wait on it; they're cached, so the second hop is cheap.
  const [event, agenda, wishes] = await Promise.all([
    loadEvent(guest.event_id),
    getAgenda(guest.event_id),
    getApprovedWishes(guest.event_id),
  ]);
  if (!event) notFound();
  const initialLang = lang === "en" || lang === "kh" ? lang : guest.lang;

  return (
    <>
      <FontLinks config={event.config} />
      {/* The cover is a CSS background, so the browser wouldn't discover it until styles apply. */}
      {event.config.coverBackground && <link rel="preload" as="image" href={event.config.coverBackground} />}
      <Invitation
        event={event}
        agenda={agenda}
        wishes={event.sections.wishes ? wishes : []}
        initialLang={initialLang}
        guest={{
          code: guest.code,
          name: guest.name,
          lang: guest.lang,
          rsvp_status: guest.rsvp_status,
          rsvp_count: guest.rsvp_count,
        }}
      />
    </>
  );
}
