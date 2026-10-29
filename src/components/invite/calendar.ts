/** Downloads an .ics file so the guest can drop the event into their calendar. */
export function downloadIcs({ title, start, location }: { title: string; start: string; location: string }) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\r?\n/g, "\\n");
  const begin = new Date(start);
  const end = new Date(begin.getTime() + 4 * 3600_000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Teabkar//Invitation//EN",
    "BEGIN:VEVENT",
    `UID:${begin.getTime()}@teabkar`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(begin)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(title)}`,
    location && `LOCATION:${esc(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "invitation.ics" });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
