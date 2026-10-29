import type { Lang } from "../i18n";

// Event times are stored as UTC and shown in Cambodia time (UTC+7, no DST), matching the admin.
const TZ_OFFSET_MS = 7 * 60 * 60 * 1000;

const KH_DIGITS = "០១២៣៤៥៦៧៨៩";
const KH_WEEKDAYS = ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
const KH_MONTHS = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
const EN_WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const khDigits = (n: number | string) => String(n).replace(/\d/g, (d) => KH_DIGITS[Number(d)]);

function ordinal(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

/** Short guestbook stamp in Cambodia time, e.g. "១ តុលា ១២:០០" / "1 Oct 12:00". */
export function shortStamp(iso: string, lang: Lang) {
  const d = new Date(new Date(iso).getTime() + TZ_OFFSET_MS);
  const time = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  if (lang === "kh") return khDigits(`${d.getUTCDate()} `) + KH_MONTHS[d.getUTCMonth()] + " " + khDigits(time);
  return `${d.getUTCDate()} ${EN_MONTHS[d.getUTCMonth()].slice(0, 3)} ${time}`;
}

export type DateParts = { weekday: string; day: string; month: string; year: string; long: string };

/** The pieces of the intro date block, e.g. ថ្ងៃសៅរ៍ · ២៣ · ខែវិច្ឆិកា · ឆ្នាំ២០២៥ plus the full English line. */
export function dateParts(iso: string, lang: Lang): DateParts {
  const d = new Date(new Date(iso).getTime() + TZ_OFFSET_MS);
  const wd = d.getUTCDay();
  const mo = d.getUTCMonth();
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  const h = d.getUTCHours();
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const long = `${EN_WEEKDAYS[wd]}, ${ordinal(day)} ${EN_MONTHS[mo]} ${year} at ${h % 12 || 12}:${min} ${h < 12 ? "AM" : "PM"}`;
  if (lang === "kh") {
    return { weekday: `ថ្ងៃ${KH_WEEKDAYS[wd]}`, day: khDigits(day), month: `ខែ${KH_MONTHS[mo]}`, year: `ឆ្នាំ${khDigits(year)}`, long };
  }
  return { weekday: EN_WEEKDAYS[wd], day: String(day), month: EN_MONTHS[mo], year: String(year), long };
}
