import type { Labels, Lang } from "@/components/invite/i18n";
import type { EventData, EventType, InvitationText } from "./types";

type EventTypeInfo = {
  label: string;
  /** Two hosts shown as "A & B" (the couple); otherwise a single host. */
  pair: boolean;
  /** Admin field labels for host_a / host_b. */
  hostLabels: [string, string];
  /** Prefix of the link-preview title, e.g. "Wedding of A & B". */
  shareTitle: Record<Lang, string>;
  /** Guest-page labels that differ from the wedding wording in i18n.ts. */
  labels: Record<Lang, Partial<Labels>>;
  /** Starting text for a new event of this type; editable in Customize. */
  text: Record<Lang, Partial<InvitationText>>;
};

const NEUTRAL_LABELS: Record<Lang, Partial<Labels>> = {
  kh: { schedule: "របៀបវារៈកម្មវិធី", gift: "អំណោយ", khqr: "អំណោយតាម KHQR", started: "ថ្ងៃកម្មវិធីបានមកដល់ហើយ!" },
  en: { schedule: "Event Schedule", gift: "Gift", wishPlaceholder: "Write your wishes...", started: "The day is here!" },
};

export const EVENT_TYPE_INFO: Record<EventType, EventTypeInfo> = {
  wedding: {
    label: "Wedding",
    pair: true,
    hostLabels: ["Groom", "Bride"],
    shareTitle: { kh: "អាពាហ៍ពិពាហ៍", en: "Wedding of" },
    labels: { kh: {}, en: {} },
    text: {
      kh: {
        main_title: "សិរីមង្គលអាពាហ៍ពិពាហ៍",
        subtitle: "សូមគោរពអញ្ជើញ",
        invitation_title: "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
        details_title: "របៀបវារៈកម្មវិធី",
        gratitude_title: "សូមអរគុណ",
      },
      en: {
        main_title: "Wedding Invitation",
        subtitle: "We cordially invite",
        invitation_title: "WE ARE HONORED TO INVITE YOU",
        details_title: "WEDDING AGENDA",
        gratitude_title: "THANK YOU",
      },
    },
  },
  engagement: {
    label: "Engagement",
    pair: true,
    hostLabels: ["Groom", "Bride"],
    shareTitle: { kh: "ពិធីភ្ជាប់ពាក្យ", en: "Engagement of" },
    labels: {
      kh: { schedule: "កម្មវិធីភ្ជាប់ពាក្យ" },
      en: { schedule: "Engagement Schedule", gift: "Gift" },
    },
    text: {
      kh: {
        main_title: "ពិធីភ្ជាប់ពាក្យ",
        subtitle: "សូមគោរពអញ្ជើញ",
        invitation_title: "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
        details_title: "របៀបវារៈកម្មវិធី",
        gratitude_title: "សូមអរគុណ",
      },
      en: {
        main_title: "Engagement Ceremony",
        subtitle: "We cordially invite",
        invitation_title: "WE ARE HONORED TO INVITE YOU",
        details_title: "PROGRAM",
        gratitude_title: "THANK YOU",
      },
    },
  },
  birthday: {
    label: "Birthday",
    pair: false,
    hostLabels: ["Celebrant", ""],
    shareTitle: { kh: "ខួបកំណើត", en: "Birthday of" },
    labels: NEUTRAL_LABELS,
    text: {
      kh: {
        main_title: "ពិធីខួបកំណើត",
        subtitle: "សូមគោរពអញ្ជើញ",
        invitation_title: "សូមអញ្ជើញចូលរួមអបអរសាទរខួបកំណើត",
        details_title: "របៀបវារៈកម្មវិធី",
        gratitude_title: "សូមអរគុណ",
      },
      en: {
        main_title: "Birthday Party",
        subtitle: "You are invited",
        invitation_title: "JOIN US TO CELEBRATE",
        details_title: "PROGRAM",
        gratitude_title: "THANK YOU",
      },
    },
  },
  housewarming: {
    label: "Housewarming",
    pair: false,
    hostLabels: ["Host", ""],
    shareTitle: { kh: "ពិធីឡើងគេហដ្ឋានថ្មី", en: "Housewarming of" },
    labels: NEUTRAL_LABELS,
    text: {
      kh: {
        main_title: "ពិធីឡើងគេហដ្ឋានថ្មី",
        subtitle: "សូមគោរពអញ្ជើញ",
        invitation_title: "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
        details_title: "របៀបវារៈកម្មវិធី",
        gratitude_title: "សូមអរគុណ",
      },
      en: {
        main_title: "Housewarming",
        subtitle: "You are invited",
        invitation_title: "JOIN US AT OUR NEW HOME",
        details_title: "PROGRAM",
        gratitude_title: "THANK YOU",
      },
    },
  },
  other: {
    label: "Other",
    pair: false,
    hostLabels: ["Host", ""],
    shareTitle: { kh: "លិខិតអញ្ជើញ", en: "Invitation from" },
    labels: NEUTRAL_LABELS,
    text: {
      kh: { main_title: "លិខិតអញ្ជើញ", subtitle: "សូមគោរពអញ្ជើញ", details_title: "របៀបវារៈកម្មវិធី", gratitude_title: "សូមអរគុណ" },
      en: { main_title: "Invitation", subtitle: "You are invited", details_title: "PROGRAM", gratitude_title: "THANK YOU" },
    },
  },
};

/** The hosts to show for an event: both for paired types (when the second is filled in), else just the first. */
export function eventHosts(event: Pick<EventData, "type" | "host_a" | "host_b">): [string] | [string, string] {
  return EVENT_TYPE_INFO[event.type].pair && event.host_b.trim() ? [event.host_a, event.host_b] : [event.host_a];
}

export function hostsLabel(event: Pick<EventData, "type" | "host_a" | "host_b">, joiner = " & ") {
  return eventHosts(event).join(joiner);
}

export function shareTitle(event: Pick<EventData, "type" | "host_a" | "host_b">, lang: Lang) {
  return `${EVENT_TYPE_INFO[event.type].shareTitle[lang]} ${hostsLabel(event, lang === "kh" ? " និង " : " & ")}`.trim();
}
