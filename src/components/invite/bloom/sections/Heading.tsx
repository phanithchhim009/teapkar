import { GoldText, Tx } from "../BloomContext";
import { Flourish } from "../FlowerArt";
import { Reveal } from "../Reveal";

/** Section title (gold Moul), optional subtitle and a flourish that grows in. */
export function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-7 text-center">
      <Reveal variant="fadeUpLg">
        <GoldText as="h2" className="bloom-title text-xl">
          {title}
        </GoldText>
      </Reveal>
      {subtitle && (
        <Reveal variant="fadeUp" delay={0.1}>
          <p className="mt-1 whitespace-pre-line text-sm leading-[1.8] text-[var(--green)]">
            <Tx>{subtitle}</Tx>
          </p>
        </Reveal>
      )}
      <Reveal variant="grow" delay={0.2} className="mx-auto mt-2 w-40">
        <Flourish className="block w-full" />
      </Reveal>
    </div>
  );
}

/** Shared padding for every scroll section; the id is the dock / scroll-spy target. */
export function Section({ id, className = "", children }: { id: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={`relative px-6 py-14 ${className}`}>
      {children}
    </section>
  );
}
