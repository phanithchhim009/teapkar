import QRCode from "qrcode";
import type { PublicWish } from "@/components/invite/Wishes";
import { eventConfigSchema, invitationTextSchema, LOTUS_PALETTES, sectionsSchema, THEME_PRESETS, type EventData, type ScheduleDay, type Theme } from "./types";

// A complete sample wedding for the public /demo pages. Photos and the clip live in public/demo
// (Unsplash-licensed photos via picsum.photos; the video is Mozilla's CC0 "flower" sample).
const D = "/demo";

/** A QR that only says it's a demo, so nobody mistakes the sample for a real payment code. */
async function demoQr(label: string) {
  const svg = await QRCode.toString(`Teabkar demo (${label}) — not a real payment QR`, { type: "svg", margin: 1, color: { dark: "#1f2937", light: "#ffffff" } });
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** `palette` picks a Lotus colour set (e.g. "cherry"); other styles ignore it. */
export async function demoEvent(theme: Theme, palette?: string): Promise<EventData> {
  const lotusPalette = theme === "lotus" ? LOTUS_PALETTES.find((p) => p.id === palette) : undefined;
  return {
    id: 0,
    type: "wedding",
    name: "សុខ វិសាល & ចាន់ ស្រីនីត",
    host_a: "សុខ វិសាល",
    host_b: "ចាន់ ស្រីនីត",
    event_date: "2026-12-20T10:00:00.000Z",
    config: eventConfigSchema.parse({
      theme,
      ...THEME_PRESETS[theme],
      ...(lotusPalette && { textColor: lotusPalette.textColor, lotus: lotusPalette.colors }),
      coverBackground: `${D}/cover.webp`,
      mapUrl: "https://maps.app.goo.gl/9Wh42r1JEXaL6PXJ9",
      qrUsd: await demoQr("USD"),
      qrKhr: await demoQr("KHR"),
      bankName: "ABA",
      accountName: "SOK VISAL",
      accountNumber: "000 000 000",
      gallery: [`${D}/g1.webp`, `${D}/g2.webp`, `${D}/g3.webp`, `${D}/g4.webp`, `${D}/g5.webp`],
      story: [
        {
          id: "s1",
          date: "ឆ្នាំ២០១៥ · វិទ្យាល័យ",
          photo: `${D}/story-1.webp`,
          title_kh: "ជួបគ្នាដំបូងនៅវិទ្យាល័យ",
          title_en: "We met in high school",
          text_kh: "យើងរៀនថ្នាក់ទី១០ជាមួយគ្នា ហើយអង្គុយក្បែរគ្នាក្នុងម៉ោងគណិតវិទ្យា។ ពីមិត្តរួមថ្នាក់ ក្លាយជាមិត្តល្អបំផុត។",
          text_en: "We were in grade 10 together and sat side by side in maths class. Classmates first, then best friends.",
        },
        {
          id: "s2",
          date: "ឆ្នាំ២០២១ · ការណាត់ជួបលើកដំបូង",
          photo: `${D}/story-2.webp`,
          title_kh: "ការណាត់ជួបលើកដំបូង",
          title_en: "Our first date",
          text_kh: "កាហ្វេមួយកែវនៅមាត់ទន្លេ ភ្នំពេញ ដែលក្លាយជាការនិយាយគ្នារហូតដល់យប់ជ្រៅ។",
          text_en: "One coffee by the Phnom Penh riverside that turned into talking until midnight.",
        },
        {
          id: "s3",
          date: "ឆ្នាំ២០២៥ · ការស្នើសុំ",
          photo: `${D}/story-3.webp`,
          title_kh: "ថ្ងៃដែលនាងឆ្លើយថា «ព្រម»",
          title_en: "The day she said yes",
          text_kh: "នៅក្រោមពន្លឺថ្ងៃលិចនៅឆ្នេរកែប គាត់បានលុតជង្គង់ស្នើសុំរៀបការ។",
          text_en: "Under the sunset on Kep beach, he knelt and asked her to marry him.",
        },
      ],
      videos: [{ id: "v1", src: `${D}/prewedding.mp4`, poster: `${D}/poster.webp` }],
    }),
    text_kh: invitationTextSchema.parse({
      main_title: "សិរីមង្គលអាពាហ៍ពិពាហ៍",
      subtitle: "សូមគោរពអញ្ជើញ",
      invitation_title: "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
      invitation_message:
        "សម្តេច ទ្រង់ ឯកឧត្តម លោកជំទាវ លោកអ្នកឧកញ៉ា\nអ្នកឧកញ៉ា ឧកញ៉ា លោក លោកស្រី អ្នកនាង កញ្ញា\nព្រមទាំងប្រិយមិត្តអញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ដើម្បីប្រសិទ្ធិពរជ័យសិរីសួស្តី ជ័យមង្គល ក្នុងពិធីអាពាហ៍ពិពាហ៍ កូនប្រុសស្រី របស់យើងខ្ញុំទាំងពីរ។",
      date_time: "ថ្ងៃអាទិត្យ ទី២០ ខែធ្នូ ឆ្នាំ២០២៦ វេលាម៉ោង ៥:០០ ល្ងាច",
      lunar_date: "ត្រូវនឹងថ្ងៃ ១២កើត ខែមិគសិរ ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០",
      location: "មជ្ឈមណ្ឌលសន្និបាត និងពិព័រណ៍ ឌឹព្រីមៀរសែនសុខ (អាគារ A) រាជធានីភ្នំពេញ។",
      details_title: "របៀបវារៈកម្មវិធី",
      gratitude_title: "សូមអរគុណ និងសូមអភ័យទោស",
      gratitude_message:
        "យើងខ្ញុំទាំងពីរ សូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅ ចំពោះវត្តមានដ៏ឧត្តុង្គឧត្តមរបស់លោកអ្នក។ យើងខ្ញុំសូមការខន្តីអភ័យទោស ដែលពុំបានជូនលិខិតអញ្ជើញដោយផ្ទាល់។",
      father_a: "លោក សុខ សុផល",
      mother_a: "លោកស្រី ម៉ៅ សុភា",
      father_b: "លោក ចាន់ វណ្ណា",
      mother_b: "លោកស្រី លី ធីតា",
    }),
    text_en: invitationTextSchema.parse({
      main_title: "Wedding Invitation",
      subtitle: "We cordially invite",
      invitation_title: "WE ARE HONORED TO INVITE YOU",
      invitation_message: "Please join us as guests of honor to bestow blessings on our wedding.",
      date_time: "Sunday, December 20, 2026 at 5:00 PM",
      location: "The Premier Center Sen Sok (Building A), Phnom Penh.",
      details_title: "WEDDING AGENDA",
      gratitude_title: "THANK YOU",
      gratitude_message: "We are deeply grateful for your presence at our wedding.",
      father_a: "Mr. Sok Sophal",
      mother_a: "Mrs. Mao Sophea",
      father_b: "Mr. Chan Vanna",
      mother_b: "Mrs. Ly Thida",
    }),
    sections: sectionsSchema.parse({}),
  };
}

const steps: [string, string][] = [
  ["07:00 AM", "ហែជំនូន"],
  ["08:00 AM", "សូត្រមន្ត"],
  ["09:00 AM", "កាត់សក់"],
  ["10:30 AM", "សំពះផ្ទឹម"],
  ["12:00 PM", "ចងដៃ"],
  ["05:00 PM", "ពិសាភោជនាហារ"],
];

export const demoAgenda: ScheduleDay[] = [
  {
    id: "demo-day",
    title: "ថ្ងៃអាទិត្យ ទី២០ ខែធ្នូ ឆ្នាំ២០២៦",
    date: "2026-12-20",
    sort: 0,
    items: steps.map(([time, name], i) => ({ id: `demo-${i}`, day_id: "demo-day", time, name, sort: i })),
  },
];

export const demoWishes: PublicWish[] = [
  { id: "w1", message: "សូមជូនពរឲ្យគូស្វាមីភរិយាថ្មី មានសុភមង្គល និងស្រឡាញ់គ្នារហូតដល់ចាស់ជរា!", name: "បងស្រី ស្រីពៅ", created_at: "2026-11-01T10:00:00Z" },
  { id: "w2", message: "Congratulations to you both! Wishing you a lifetime of love and happiness.", name: "Dara & Lina", created_at: "2026-11-02T10:00:00Z" },
];
