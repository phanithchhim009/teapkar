import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FontLinks } from "@/components/invite/FontLinks";
import { Invitation } from "@/components/invite/Invitation";
import { demoAgenda, demoEvent, demoWishes } from "@/lib/demo";
import { THEMES, type Theme } from "@/lib/types";

type Props = { params: Promise<{ theme: string }>; searchParams: Promise<{ lang?: string; palette?: string }> };

const isTheme = (t: string): t is Theme => (THEMES as readonly string[]).includes(t);

export function generateStaticParams() {
  return THEMES.map((theme) => ({ theme }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { theme } = await params;
  return {
    title: `គំរូសំបុត្រ ${theme} · Teabkar`,
    description: "គំរូសំបុត្រអាពាហ៍ពិពាហ៍ឌីជីថល — Digital wedding invitation demo",
    openGraph: { images: ["/demo/cover.webp"] },
  };
}

/** Public sample invitation for each style. Runs in preview mode, so RSVPs and wishes are never saved. */
export default async function DemoPage({ params, searchParams }: Props) {
  const { theme } = await params;
  const { lang, palette } = await searchParams;
  if (!isTheme(theme)) notFound();
  const event = await demoEvent(theme, palette);
  return (
    <>
      <FontLinks config={event.config} />
      <Invitation
        preview
        event={event}
        agenda={demoAgenda}
        wishes={demoWishes}
        initialLang={lang === "en" ? "en" : "kh"}
        guest={{ code: "demo", name: "ភ្ញៀវកិត្តិយស", lang: "kh", rsvp_status: "pending", rsvp_count: 0 }}
      />
    </>
  );
}
