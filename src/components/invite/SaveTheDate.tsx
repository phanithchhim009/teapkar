import type { Lang } from "./i18n";

// The event time is stored as an instant and shown in Cambodia time (UTC+7, no DST), like the admin editor.
// Names are hard-coded rather than taken from Intl so the server render and hydration always match.
const OFFSET_MS = 7 * 60 * 60 * 1000;
const KH_DIGITS = "០១២៣៤៥៦៧៨៩";
const NAMES = {
  kh: {
    days: ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"],
    months: ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"],
  },
  en: {
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  },
};

const khNum = (n: number) => String(n).replace(/\d/g, (d) => KH_DIGITS[Number(d)]);

export function SaveTheDate({ date, lang, label }: { date: string; lang: Lang; label: string }) {
  const d = new Date(new Date(date).getTime() + OFFSET_MS);
  if (Number.isNaN(d.getTime())) return null;
  const n = NAMES[lang];
  const num = lang === "kh" ? khNum : String;
  const weekday = lang === "kh" ? `ថ្ងៃ${n.days[d.getUTCDay()]}` : n.days[d.getUTCDay()];
  const month = lang === "kh" ? `ខែ${n.months[d.getUTCMonth()]}` : n.months[d.getUTCMonth()];
  // Letter-spacing pulls Khmer stacked consonants and vowels apart, so only English gets small caps.
  const caps = lang === "en" ? "uppercase tracking-wider" : "";

  return (
    <div className="space-y-2">
      {/* The script font has no Khmer glyphs. */}
      <p className={lang === "kh" ? "font-heading text-base" : "font-script text-3xl"} style={{ color: "var(--primary)" }}>
        {label}
      </p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <p className={`border-y py-1.5 text-sm ${caps}`} style={{ borderColor: "var(--primary)" }}>
          {weekday}
        </p>
        <p className="font-heading px-1 text-5xl leading-none tabular-nums" style={{ color: "var(--primary)" }}>
          {num(d.getUTCDate())}
        </p>
        <p className={`border-y py-1.5 text-sm ${caps}`} style={{ borderColor: "var(--primary)" }}>
          {month} {num(d.getUTCFullYear())}
        </p>
      </div>
    </div>
  );
}
