import {
  BarChart3,
  CalendarCheck,
  Heart,
  Languages,
  MapPin,
  MessageSquareHeart,
  Moon,
  Music,
  Phone,
  QrCode,
  Send,
  UserRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Balloons } from "@/components/invite/party";
import type { Theme } from "@/lib/types";

export const metadata: Metadata = {
  title: "Teabkar — សំបុត្រអាពាហ៍ពិពាហ៍ឌីជីថល",
  description: "សំបុត្រអាពាហ៍ពិពាហ៍ឌីជីថល មានឈ្មោះភ្ញៀវផ្ទាល់ខ្លួន ផ្ញើតាម Telegram។ Personal digital wedding invitations for Cambodian couples.",
  openGraph: { images: ["/demo/cover.webp"] },
};

// Contact details come from the environment so each deployment can show its own.
const telegram = process.env.NEXT_PUBLIC_CONTACT_TELEGRAM?.replace(/^@/, "");
const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE;

const MAROON = "#8b1a1e";
const GOLD = "#a0722a";

const features = [
  { icon: UserRound, kh: "ឈ្មោះភ្ញៀវផ្ទាល់ខ្លួន", text: "ភ្ញៀវម្នាក់ៗមានតំណផ្ទាល់ខ្លួន ដែលបង្ហាញឈ្មោះរបស់គាត់នៅលើសំបុត្រ។" },
  { icon: Send, kh: "ផ្ញើតាម Telegram", text: "ចុចតែម្តង ផ្ញើតំណទៅភ្ញៀវតាម Telegram ឬផ្ញើជា QR កូដ។" },
  { icon: CalendarCheck, kh: "បញ្ជាក់ការចូលរួម", text: "ភ្ញៀវឆ្លើយតបថាចូលរួម ឬអត់ និងចំនួនអ្នកមកជាមួយ។" },
  { icon: MessageSquareHeart, kh: "សារជូនពរ", text: "ភ្ញៀវសរសេរពាក្យជូនពរ ហើយអ្នកអាចពិនិត្យមុនបង្ហាញ។" },
  { icon: QrCode, kh: "ចំណងដៃតាម KHQR", text: "បង្ហាញ KHQR ជាដុល្លារ និងរៀល ព្រមទាំងលេខគណនីធនាគារ។" },
  { icon: MapPin, kh: "ផែនទី", text: "ភ្ញៀវចុចបើកទីតាំងកម្មវិធីក្នុង Google Maps ដោយផ្ទាល់។" },
  { icon: Heart, kh: "រឿងស្នេហ៍ និងវីដេអូ", text: "ចែករំលែកដំណើរស្នេហា និងវីដេអូ Pre-Wedding របស់អ្នក។" },
  { icon: Moon, kh: "ថ្ងៃខែចន្ទគតិ", text: "បង្ហាញថ្ងៃខែតាមចន្ទគតិ នៅក្បែរកាលបរិច្ឆេទកម្មវិធី។" },
  { icon: Languages, kh: "ខ្មែរ និង English", text: "ភ្ញៀវប្តូររវាងភាសាខ្មែរ និងអង់គ្លេសបានគ្រប់ពេល។" },
  { icon: Music, kh: "តន្ត្រី", text: "ចាក់បទភ្លេងការដែលអ្នកចូលចិត្ត ពេលភ្ញៀវបើកសំបុត្រ។" },
  { icon: BarChart3, kh: "តាមដានភ្ញៀវ", text: "ដឹងថាភ្ញៀវណាបានបើកមើល និងអ្នកណានឹងមកចូលរួម។" },
];

// Each card hints at its style with that style's own colours.
const styles: { id: Theme; name: string; kh: string; bg: string; ink: string; accent: string }[] = [
  { id: "royal", name: "Royal", kh: "ក្រហមចាស់ និងមាស តាមបែបប្រពៃណីខ្មែរ", bg: "linear-gradient(160deg,#fffaf0,#f4e2c3)", ink: "#8b1a1e", accent: "#a0722a" },
  { id: "classic", name: "Classic", kh: "ពណ៌ក្រែម និងលឿងទុំ ជាមួយផ្កាធ្លាក់", bg: "linear-gradient(160deg,#fffaf2,#f3dcc0)", ink: "#b5651d", accent: "#7a5a2e" },
  { id: "angkor", name: "Angkor", kh: "ថ្មភក់ និងមាស ជាមួយប្រាសាទអង្គរវត្ត និងក្បាច់ខ្មែរ", bg: "linear-gradient(180deg,#f3d6a6,#f4e5c8)", ink: "#b7862f", accent: "#6b4a2b" },
  { id: "bloom", name: "Bloom", kh: "ផ្កាពណ៌ទឹក និងអក្សរមាស ជាមួយចលនាស្រស់ស្អាត", bg: "linear-gradient(160deg,#fdf6f8,#eef3e6)", ink: "#43652F", accent: "#b8860b" },
  { id: "lotus", name: "Lotus", kh: "ស្រោមសំបុត្របៃតងអូលីវ ជាមួយត្រាផ្កាឈូកមាស", bg: "linear-gradient(160deg,#5b6339,#23251b)", ink: "#e3c47c", accent: "#f4ecd8" },
  { id: "garden", name: "Garden", kh: "ស្រោមសំបុត្រពណ៌ស វាំងនន និងសួនផ្កាស", bg: "linear-gradient(160deg,#ffffff,#eef2ec)", ink: "#2f5a46", accent: "#7f9c74" },
];

const steps = [
  { kh: "ផ្ញើព័ត៌មាន", text: "ឈ្មោះកូនកំលោះ កូនក្រមុំ មាតាបិតា កាលបរិច្ឆេទ ទីតាំង និងរូបថតរបស់អ្នក។" },
  { kh: "ជ្រើសរើសគំរូ", text: "ជ្រើសរើសរចនាប័ទ្មដែលអ្នកចូលចិត្ត ហើយយើងរៀបចំសំបុត្រជូនអ្នក។" },
  { kh: "ផ្ញើទៅភ្ញៀវ", text: "បញ្ចូលបញ្ជីភ្ញៀវ ផ្ញើតំណតាម Telegram ហើយតាមដានការឆ្លើយតប។" },
];

function ContactButtons({ light = false }: { light?: boolean }) {
  if (!telegram && !phone) return null;
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {telegram && (
        <a
          href={`https://t.me/${telegram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-white shadow-md transition hover:opacity-90"
          style={{ background: light ? GOLD : MAROON }}
        >
          <Send size={18} /> ទាក់ទងតាម Telegram
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone.replace(/\s+/g, "")}`}
          className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 font-medium transition ${light ? "border-white/60 text-white hover:bg-white/10" : "hover:bg-white"}`}
          style={light ? undefined : { borderColor: MAROON, color: MAROON }}
        >
          <Phone size={18} /> {phone}
        </a>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-dvh text-[#3b2416]" style={{ background: "#fffaf2" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Moul&family=Great+Vibes&display=swap" />

      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-20 border-b border-[#ead9bd] bg-[#fffaf2]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold" style={{ color: MAROON }}>
            <Heart size={20} fill={MAROON} /> Teabkar
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <a href="#styles" className="hover:underline">
              គំរូសំបុត្រ
            </a>
            <a href="#birthday" className="hover:underline">
              ខួបកំណើត
            </a>
            <a href="#how" className="hidden hover:underline sm:inline">
              របៀបធ្វើ
            </a>
            {telegram && (
              <a href={`https://t.me/${telegram}`} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-1.5 font-medium text-white" style={{ background: MAROON }}>
                ទាក់ទង
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1.1fr_1fr] md:py-20">
        <div className="space-y-6 text-center md:text-left">
          <p className="text-3xl" style={{ fontFamily: '"Great Vibes", cursive', color: GOLD }}>
            Digital Wedding Invitation
          </p>
          <h1 className="text-3xl leading-[1.7] sm:text-4xl sm:leading-[1.7]" style={{ fontFamily: '"Moul", serif', color: MAROON }}>
            សំបុត្រអាពាហ៍ពិពាហ៍ឌីជីថល
          </h1>
          <p className="text-lg leading-8">
            ភ្ញៀវម្នាក់ៗទទួលបានសំបុត្រដែលមានឈ្មោះផ្ទាល់ខ្លួន ផ្ញើតាម Telegram បានភ្លាមៗ។ ឆ្លើយតបការចូលរួម ផ្ញើពរ និងចំណងដៃតាម KHQR — ទាំងអស់ក្នុងតំណតែមួយ។
          </p>
          <p className="text-sm text-[#7a5a2e]">Personal digital wedding invitations for Cambodian couples — in Khmer and English.</p>
          <p className="text-sm">
            🎂 ក៏មាន
            <a href="#birthday" className="mx-1 font-semibold underline underline-offset-4" style={{ color: MAROON }}>
              សំបុត្រខួបកំណើត
            </a>
            ផងដែរ · Birthday invitations too
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:justify-start">
            <a href="#styles" className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-white shadow-md hover:opacity-90" style={{ background: MAROON }}>
              មើលគំរូសំបុត្រ
            </a>
            <Link href="/demo/royal" target="_blank" className="inline-flex items-center gap-2 rounded-full border px-6 py-3 font-medium hover:bg-white" style={{ borderColor: MAROON, color: MAROON }}>
              សាកល្បងបើកសំបុត្រ
            </Link>
          </div>
        </div>

        {/* A live invitation inside a phone frame */}
        <div className="mx-auto w-full max-w-[300px]">
          <div className="overflow-hidden rounded-[2.2rem] border-[10px] border-[#2a1a12] bg-[#2a1a12] shadow-2xl">
            <iframe src="/demo/royal" title="គំរូសំបុត្រ" className="h-[580px] w-full rounded-[1.6rem] bg-white" loading="lazy" />
          </div>
          <p className="mt-3 text-center text-xs text-[#7a5a2e]">↑ ចុចលើសំបុត្រដើម្បីសាកល្បង</p>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="border-y border-[#ead9bd] bg-white/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-2 text-center text-2xl leading-loose" style={{ fontFamily: '"Moul", serif', color: MAROON }}>
            អ្វីដែលមានក្នុងសំបុត្រ
          </h2>
          <p className="mb-10 text-center text-sm text-[#7a5a2e]">Everything your guests need, in one link</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, kh, text }) => (
              <div key={kh} className="flex gap-4 rounded-2xl border border-[#ead9bd] bg-white p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: "#f8ecd6", color: MAROON }}>
                  <Icon size={20} />
                </span>
                <div>
                  <p className="font-semibold" style={{ color: MAROON }}>
                    {kh}
                  </p>
                  <p className="mt-1 text-sm leading-6">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Styles ---------- */}
      <section id="styles" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16">
        <h2 className="mb-2 text-center text-2xl leading-loose" style={{ fontFamily: '"Moul", serif', color: MAROON }}>
          គំរូសំបុត្រ
        </h2>
        <p className="mb-10 text-center text-sm text-[#7a5a2e]">ចុចលើគំរូណាមួយ ដើម្បីបើកមើលដូចភ្ញៀវរបស់អ្នក · Tap a style to try it</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {styles.map((s) => (
            <Link
              key={s.id}
              href={`/demo/${s.id}`}
              target="_blank"
              className="group overflow-hidden rounded-2xl border border-[#ead9bd] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative flex h-44 flex-col items-center justify-center gap-1 text-center" style={{ background: s.bg }}>
                <span className="absolute inset-3 rounded-lg border" style={{ borderColor: s.accent, opacity: 0.6 }} />
                <span className="text-sm" style={{ fontFamily: '"Moul", serif', color: s.ink }}>
                  សិរីមង្គលអាពាហ៍ពិពាហ៍
                </span>
                <span className="text-3xl" style={{ fontFamily: '"Great Vibes", cursive', color: s.accent }}>
                  {s.name}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold" style={{ color: MAROON }}>
                    {s.name}
                  </p>
                  <p className="text-sm leading-6">{s.kh}</p>
                </div>
                <span className="shrink-0 text-sm font-medium group-hover:underline" style={{ color: GOLD }}>
                  មើល →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Birthdays ---------- */}
      <section id="birthday" className="scroll-mt-16 border-t border-[#ead9bd] py-16" style={{ background: "linear-gradient(160deg, #fff5fb, #f1e6fb)" }}>
        <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 md:grid-cols-[1fr_1.2fr]">
          <Balloons className="mx-auto h-48 text-[#4a2545] md:h-64" />
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-2xl leading-loose text-[#c2185b]" style={{ fontFamily: '"Moul", serif' }}>
              សំបុត្រខួបកំណើត
            </h2>
            <p className="text-sm text-[#6a1b9a]">Birthday invitations</p>
            <p className="leading-7 text-[#4a2545]">
              រចនាប័ទ្ម Party ពណ៌ផ្កាឈូក និងស្វាយ ជាមួយប៉េងប៉ោង ក្រដាសពណ៌ និងស្លាកអាយុ «គម្រប់អាយុ ៣០ ឆ្នាំ»។ ភ្ញៀវឆ្លើយតបការចូលរួម ផ្ញើពាក្យជូនពរ និងអំណោយតាម KHQR បានដូចសំបុត្រការដែរ។
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              <Link
                href="/demo/party?type=birthday"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium text-white shadow-md hover:opacity-90"
                style={{ background: "#c2185b" }}
              >
                🎈 មើលគំរូ Party
              </Link>
              <Link
                href="/demo/royal?type=birthday"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full border border-[#c2185b] px-6 py-3 font-medium text-[#c2185b] hover:bg-white"
              >
                គំរូ Royal សម្រាប់ខួបកំណើត
              </Link>
            </div>
            <p className="text-xs text-[#4a2545]/70">គ្រប់រចនាប័ទ្មទាំងអស់ អាចប្រើសម្រាប់ខួបកំណើតបាន · Every style works for birthdays.</p>
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className="scroll-mt-16 border-t border-[#ead9bd] bg-white/60 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-10 text-center text-2xl leading-loose" style={{ fontFamily: '"Moul", serif', color: MAROON }}>
            របៀបធ្វើ
          </h2>
          <ol className="grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.kh} className="rounded-2xl border border-[#ead9bd] bg-white p-6 text-center">
                <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold text-white" style={{ background: GOLD }}>
                  {"១២៣"[i]}
                </span>
                <p className="font-semibold" style={{ color: MAROON }}>
                  {s.kh}
                </p>
                <p className="mt-2 text-sm leading-6">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section className="px-4 py-16 text-center text-white" style={{ background: `linear-gradient(160deg, ${MAROON}, #5c1013)` }}>
        <h2 className="text-2xl leading-loose" style={{ fontFamily: '"Moul", serif' }}>
          ចាប់ផ្តើមរៀបចំសំបុត្ររបស់អ្នក
        </h2>
        <p className="mx-auto mb-8 mt-2 max-w-xl leading-7 text-white/85">ទាក់ទងមកយើង ដើម្បីសួរតម្លៃ និងរៀបចំសំបុត្រអាពាហ៍ពិពាហ៍ឌីជីថលរបស់អ្នក។</p>
        <ContactButtons light />
        {!telegram && !phone && (
          <Link href="/demo/royal" target="_blank" className="inline-flex rounded-full px-6 py-3 font-medium shadow-md" style={{ background: GOLD }}>
            សាកល្បងបើកសំបុត្រ
          </Link>
        )}
      </section>

      <footer className="py-6 text-center text-xs text-[#7a5a2e]">© {new Date().getFullYear()} Teabkar Digital</footer>
    </div>
  );
}
