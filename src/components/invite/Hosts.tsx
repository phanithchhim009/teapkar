import { eventHosts } from "@/lib/event-types";
import type { EventData } from "@/lib/types";

/** The host name(s): "A & B" for couples, with `amp` as the styled ampersand, or just "A". */
export function Hosts({ event, amp }: { event: Pick<EventData, "type" | "host_a" | "host_b">; amp: React.ReactNode }) {
  const [a, b] = eventHosts(event);
  return (
    <>
      {a}
      {b && (
        <>
          {amp}
          {b}
        </>
      )}
    </>
  );
}
