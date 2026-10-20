import type { ScheduleDay } from "@/lib/types";
import { Tx } from "../BloomContext";
import { Flourish } from "../FlowerArt";
import { Reveal } from "../Reveal";
import { Heading, Section } from "./Heading";

export function ScheduleSection({ title, subtitle, agenda }: { title: string; subtitle?: string; agenda: ScheduleDay[] }) {
  return (
    <Section id="schedule">
      <Heading title={title} subtitle={subtitle} />
      <div className="space-y-8">
        {agenda.map((day) => (
          <div key={day.id}>
            {agenda.length > 1 && (
              <Reveal variant="fadeUp">
                <p className="font-title mb-4 text-center text-sm leading-[1.9] text-[var(--green)]">{day.title}</p>
              </Reveal>
            )}
            <ol className="text-center">
              {day.items.map((it, i) => (
                <li key={it.id}>
                  {i > 0 && (
                    <Reveal variant="grow" className="mx-auto my-3 w-16">
                      <Flourish className="block w-full opacity-70" />
                    </Reveal>
                  )}
                  <Reveal variant="fadeUpMd">
                    <p className="bloom-gold font-title text-base tabular-nums leading-[1.8]">{it.time}</p>
                    <p className="text-sm leading-[1.8] text-[var(--green)]">
                      <Tx>{it.name}</Tx>
                    </p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </Section>
  );
}
