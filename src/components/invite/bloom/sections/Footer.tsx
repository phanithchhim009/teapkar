import { Heart } from "lucide-react";
import type { InvitationText } from "@/lib/types";
import { GoldText, Tx, useBloom } from "../BloomContext";
import { Flourish } from "../FlowerArt";
import { Reveal } from "../Reveal";

export function Footer({ text, groom, bride }: { text: InvitationText; groom: string; bride: string }) {
  const { t } = useBloom();
  return (
    // Extra bottom padding keeps the last line clear of the dock.
    <footer id="footer" className="relative px-6 pb-32 pt-10 text-center">
      {text.gratitude_title && (
        <Reveal variant="fadeUpLg">
          <GoldText as="h2" className="bloom-title text-lg">
            {text.gratitude_title}
          </GoldText>
        </Reveal>
      )}
      {text.gratitude_message && (
        <Reveal variant="fadeUpSm" delay={0.1}>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--green)]">
            <Tx>{text.gratitude_message}</Tx>
          </p>
        </Reveal>
      )}
      <Reveal variant="grow" delay={0.15} className="mx-auto my-5 w-40">
        <Flourish className="block w-full" />
      </Reveal>
      <Reveal variant="fadeUp" delay={0.2}>
        <p className="font-title text-base leading-[1.9] text-[var(--green)]">
          {groom} <span className="bloom-gold px-1">&amp;</span> {bride}
        </p>
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-[var(--green)]/70">
          <Heart size={12} className="fill-current" /> <Tx>{t.madeWith}</Tx>
        </p>
      </Reveal>
    </footer>
  );
}
