import { FontLinks } from "@/components/invite/FontLinks";
import { Invitation } from "@/components/invite/Invitation";
import { requireEvent } from "@/lib/admin-data";
import { requireUser } from "@/lib/auth";
import { getAgenda, getApprovedWishes } from "@/lib/event";
import { THEMES, THEME_PRESETS, type Theme } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Preview", robots: { index: false } };

type Props = { params: Promise<{ eventId: string }>; searchParams: Promise<{ lang?: string; theme?: string }> };

/** Signed-in preview of one event (customers only their own; requireEvent checks) with a sample guest. Nothing is tracked or saved. */
export default async function PreviewPage({ params, searchParams }: Props) {
  await requireUser();
  const { lang, theme } = await searchParams;
  const saved = await requireEvent((await params).eventId);
  // `?theme=` renders the event in another style (the theme picker's thumbnails), applying its preset like picking it would.
  const event = THEMES.includes(theme as Theme)
    ? { ...saved, config: { ...saved.config, theme: theme as Theme, ...THEME_PRESETS[theme as Theme] } }
    : saved;
  const [agenda, wishes] = await Promise.all([getAgenda(event.id), getApprovedWishes(event.id)]);
  return (
    <>
      <FontLinks config={event.config} />
      <Invitation
        preview
        event={event}
        agenda={agenda}
        wishes={event.sections.wishes ? wishes : []}
        initialLang={lang === "en" ? "en" : "kh"}
        guest={{ code: "preview", name: "ឈ្មោះភ្ញៀវកិត្តិយស", lang: "kh", rsvp_status: "pending", rsvp_count: 0 }}
      />
    </>
  );
}
