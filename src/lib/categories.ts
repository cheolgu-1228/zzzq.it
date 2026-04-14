// 카테고리 정의 + 19개 로케일 라벨
// 카테고리는 컨텐츠 필터 UI에서 사용. DB에는 slug만 저장됨
import type { ContentCategory } from "./contentTypes";
import type { Locale } from "./i18n";

type CategoryMeta = {
  id: ContentCategory;
  emoji: string;
  labels: Partial<Record<Locale, string>> & { en: string };
};

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "fun",
    emoji: "🎉",
    labels: {
      en: "Fun",
      ko: "재미",
      ja: "遊び",
      zh: "趣味",
      es: "Diversión",
      pt: "Diversão",
      fr: "Fun",
      de: "Spaß",
      ru: "Веселье",
      hi: "मज़ा",
      ar: "متعة",
      id: "Seru",
      vi: "Vui",
      tr: "Eğlence",
      th: "สนุก",
      it: "Divertimento",
      pl: "Zabawa",
      nl: "Plezier",
      bn: "মজা",
    },
  },
  {
    id: "food",
    emoji: "🍽️",
    labels: {
      en: "Food",
      ko: "음식",
      ja: "フード",
      zh: "美食",
      es: "Comida",
      pt: "Comida",
      fr: "Nourriture",
      de: "Essen",
      ru: "Еда",
      hi: "खाना",
      ar: "طعام",
      id: "Makanan",
      vi: "Đồ ăn",
      tr: "Yemek",
      th: "อาหาร",
      it: "Cibo",
      pl: "Jedzenie",
      nl: "Eten",
      bn: "খাবার",
    },
  },
  {
    id: "travel",
    emoji: "✈️",
    labels: {
      en: "Travel",
      ko: "여행",
      ja: "旅行",
      zh: "旅行",
      es: "Viajes",
      pt: "Viagem",
      fr: "Voyage",
      de: "Reisen",
      ru: "Путешествия",
      hi: "यात्रा",
      ar: "سفر",
      id: "Perjalanan",
      vi: "Du lịch",
      tr: "Seyahat",
      th: "ท่องเที่ยว",
      it: "Viaggi",
      pl: "Podróże",
      nl: "Reizen",
      bn: "ভ্রমণ",
    },
  },
  {
    id: "life",
    emoji: "🌱",
    labels: {
      en: "Life",
      ko: "일상",
      ja: "ライフ",
      zh: "生活",
      es: "Vida",
      pt: "Vida",
      fr: "Vie",
      de: "Leben",
      ru: "Жизнь",
      hi: "जीवन",
      ar: "الحياة",
      id: "Kehidupan",
      vi: "Cuộc sống",
      tr: "Hayat",
      th: "ชีวิต",
      it: "Vita",
      pl: "Życie",
      nl: "Leven",
      bn: "জীবন",
    },
  },
];

export function categoryLabel(id: ContentCategory | null, locale: Locale): string {
  if (!id) return "";
  const cat = CATEGORIES.find((c) => c.id === id);
  if (!cat) return id;
  return cat.labels[locale] ?? cat.labels.en;
}

export function categoryEmoji(id: ContentCategory | null): string {
  if (!id) return "";
  return CATEGORIES.find((c) => c.id === id)?.emoji ?? "";
}
