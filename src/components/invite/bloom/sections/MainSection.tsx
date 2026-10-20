"use client";

import Image from "next/image";
import type { EventData, InvitationText } from "@/lib/types";
import { GoldText, Tx, useBloom } from "../BloomContext";
import { BloomCountdown } from "../Countdown";
import { Flourish } from "../FlowerArt";
import { Reveal } from "../Reveal";
import { unoptimized } from "../../media";

type Props = { event: EventData; text: InvitationText; hero: string; guestName: string };

export function MainSection({ event, text, hero, guestName }: Props) {
  const { t } = useBloom();
  return (
    <section id="main" className="relative pb-12">
      {hero && (
        <Reveal variant="scaleIn" className="bloom-feather relative aspect-[4/5] w-full">
          <Image src={hero} alt="" fill priority unoptimized={unoptimized(hero)} sizes="(max-width: 512px) 100vw, 512px" className="object-cover" />
        </Reveal>
      )}

      <div className={`px-6 text-center ${hero ? "-mt-10" : "pt-24"} relative`}>
        <Reveal variant="fadeUpLg">
          <GoldText as="h1" className="bloom-title text-2xl">
            {text.main_title}
          </GoldText>
        </Reveal>
        <Reveal variant="fadeUp" delay={0.12}>
          <p className="font-title mt-2 text-lg leading-[1.9] text-[var(--green)]">
            {event.groom} <span className="bloom-gold px-1">&amp;</span> {event.bride}
          </p>
        </Reveal>
        <Reveal variant="grow" delay={0.2} className="mx-auto my-3 w-40">
          <Flourish className="block w-full" />
        </Reveal>
        <Reveal variant="fadeUpSm" delay={0.25}>
          <p className="text-sm leading-[1.8] text-[var(--green)]">
            <Tx>{text.subtitle || t.dear}</Tx>
          </p>
          <p className="font-title mt-1 text-base leading-[1.9]" style={{ color: "var(--guest)" }}>
            {guestName}
          </p>
        </Reveal>

        {(text.invitation_title || text.invitation_message) && (
          <Reveal variant="scaleIn" className="bloom-card mt-8 space-y-3 p-5">
            <p className="font-title text-sm leading-[1.9] text-[var(--green)]">
              <Tx>{text.invitation_title}</Tx>
            </p>
            <p className="whitespace-pre-line text-sm leading-7 text-[var(--green)]/90">
              <Tx>{text.invitation_message}</Tx>
            </p>
          </Reveal>
        )}

        {event.sections.countdown && event.event_date && (
          <div className="mt-10">
            <Reveal variant="fadeUp">
              <GoldText as="h2" className="bloom-title mb-4 text-lg">
                {t.eventCountdown}
              </GoldText>
            </Reveal>
            <BloomCountdown date={event.event_date} />
          </div>
        )}
      </div>
    </section>
  );
}
