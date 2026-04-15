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
      en: "Fun", ko: "재미", ja: "遊び", zh: "趣味", es: "Diversión",
      pt: "Diversão", fr: "Fun", de: "Spaß", ru: "Веселье", hi: "मज़ा",
      ar: "متعة", id: "Seru", vi: "Vui", tr: "Eğlence", th: "สนุก",
      it: "Divertimento", pl: "Zabawa", nl: "Plezier", bn: "মজা",
    },
  },
  {
    id: "food",
    emoji: "🍽️",
    labels: {
      en: "Food", ko: "음식", ja: "フード", zh: "美食", es: "Comida",
      pt: "Comida", fr: "Nourriture", de: "Essen", ru: "Еда", hi: "खाना",
      ar: "طعام", id: "Makanan", vi: "Đồ ăn", tr: "Yemek", th: "อาหาร",
      it: "Cibo", pl: "Jedzenie", nl: "Eten", bn: "খাবার",
    },
  },
  {
    id: "travel",
    emoji: "✈️",
    labels: {
      en: "Travel", ko: "여행", ja: "旅行", zh: "旅行", es: "Viajes",
      pt: "Viagem", fr: "Voyage", de: "Reisen", ru: "Путешествия", hi: "यात्रा",
      ar: "سفر", id: "Perjalanan", vi: "Du lịch", tr: "Seyahat", th: "ท่องเที่ยว",
      it: "Viaggi", pl: "Podróże", nl: "Reizen", bn: "ভ্রমণ",
    },
  },
  {
    id: "life",
    emoji: "🌱",
    labels: {
      en: "Life", ko: "일상", ja: "ライフ", zh: "生活", es: "Vida",
      pt: "Vida", fr: "Vie", de: "Leben", ru: "Жизнь", hi: "जीवन",
      ar: "الحياة", id: "Kehidupan", vi: "Cuộc sống", tr: "Hayat", th: "ชีวิต",
      it: "Vita", pl: "Życie", nl: "Leven", bn: "জীবন",
    },
  },
  {
    id: "movie",
    emoji: "🎬",
    labels: {
      en: "Movie", ko: "영화", ja: "映画", zh: "电影", es: "Cine",
      pt: "Filme", fr: "Cinéma", de: "Film", ru: "Кино", hi: "फिल्म",
      ar: "سينما", id: "Film", vi: "Phim", tr: "Film", th: "หนัง",
      it: "Film", pl: "Film", nl: "Film", bn: "সিনেমা",
    },
  },
  {
    id: "music",
    emoji: "🎵",
    labels: {
      en: "Music", ko: "음악", ja: "音楽", zh: "音乐", es: "Música",
      pt: "Música", fr: "Musique", de: "Musik", ru: "Музыка", hi: "संगीत",
      ar: "موسيقى", id: "Musik", vi: "Nhạc", tr: "Müzik", th: "เพลง",
      it: "Musica", pl: "Muzyka", nl: "Muziek", bn: "সংগীত",
    },
  },
  {
    id: "game",
    emoji: "🎮",
    labels: {
      en: "Game", ko: "게임", ja: "ゲーム", zh: "游戏", es: "Juegos",
      pt: "Jogos", fr: "Jeux", de: "Spiele", ru: "Игры", hi: "गेम",
      ar: "ألعاب", id: "Game", vi: "Trò chơi", tr: "Oyun", th: "เกม",
      it: "Giochi", pl: "Gry", nl: "Spellen", bn: "গেম",
    },
  },
  {
    id: "sport",
    emoji: "⚽",
    labels: {
      en: "Sports", ko: "스포츠", ja: "スポーツ", zh: "运动", es: "Deportes",
      pt: "Esportes", fr: "Sport", de: "Sport", ru: "Спорт", hi: "खेल",
      ar: "رياضة", id: "Olahraga", vi: "Thể thao", tr: "Spor", th: "กีฬา",
      it: "Sport", pl: "Sport", nl: "Sport", bn: "খেলা",
    },
  },
  {
    id: "tech",
    emoji: "💻",
    labels: {
      en: "Tech", ko: "테크", ja: "テック", zh: "科技", es: "Tecnología",
      pt: "Tecnologia", fr: "Tech", de: "Technik", ru: "Технологии", hi: "तकनीक",
      ar: "تقنية", id: "Teknologi", vi: "Công nghệ", tr: "Teknoloji", th: "เทคโนโลยี",
      it: "Tecnologia", pl: "Technologia", nl: "Tech", bn: "প্রযুক্তি",
    },
  },
  {
    id: "fashion",
    emoji: "👗",
    labels: {
      en: "Fashion", ko: "패션", ja: "ファッション", zh: "时尚", es: "Moda",
      pt: "Moda", fr: "Mode", de: "Mode", ru: "Мода", hi: "फैशन",
      ar: "أزياء", id: "Mode", vi: "Thời trang", tr: "Moda", th: "แฟชั่น",
      it: "Moda", pl: "Moda", nl: "Mode", bn: "ফ্যাশন",
    },
  },
  {
    id: "animal",
    emoji: "🐾",
    labels: {
      en: "Animals", ko: "동물", ja: "動物", zh: "动物", es: "Animales",
      pt: "Animais", fr: "Animaux", de: "Tiere", ru: "Животные", hi: "जानवर",
      ar: "حيوانات", id: "Hewan", vi: "Động vật", tr: "Hayvanlar", th: "สัตว์",
      it: "Animali", pl: "Zwierzęta", nl: "Dieren", bn: "প্রাণী",
    },
  },
  {
    id: "love",
    emoji: "💕",
    labels: {
      en: "Love", ko: "사랑", ja: "恋愛", zh: "爱情", es: "Amor",
      pt: "Amor", fr: "Amour", de: "Liebe", ru: "Любовь", hi: "प्यार",
      ar: "حب", id: "Cinta", vi: "Tình yêu", tr: "Aşk", th: "ความรัก",
      it: "Amore", pl: "Miłość", nl: "Liefde", bn: "ভালোবাসা",
    },
  },
  {
    id: "work",
    emoji: "💼",
    labels: {
      en: "Work", ko: "직장", ja: "仕事", zh: "工作", es: "Trabajo",
      pt: "Trabalho", fr: "Travail", de: "Arbeit", ru: "Работа", hi: "काम",
      ar: "عمل", id: "Kerja", vi: "Công việc", tr: "İş", th: "งาน",
      it: "Lavoro", pl: "Praca", nl: "Werk", bn: "কাজ",
    },
  },
  {
    id: "culture",
    emoji: "🎭",
    labels: {
      en: "Culture", ko: "문화", ja: "文化", zh: "文化", es: "Cultura",
      pt: "Cultura", fr: "Culture", de: "Kultur", ru: "Культура", hi: "संस्कृति",
      ar: "ثقافة", id: "Budaya", vi: "Văn hóa", tr: "Kültür", th: "วัฒนธรรม",
      it: "Cultura", pl: "Kultura", nl: "Cultuur", bn: "সংস্কৃতি",
    },
  },
  {
    id: "hobby",
    emoji: "🎨",
    labels: {
      en: "Hobby", ko: "취미", ja: "趣味", zh: "爱好", es: "Hobby",
      pt: "Hobby", fr: "Loisir", de: "Hobby", ru: "Хобби", hi: "शौक",
      ar: "هواية", id: "Hobi", vi: "Sở thích", tr: "Hobi", th: "งานอดิเรก",
      it: "Hobby", pl: "Hobby", nl: "Hobby", bn: "শখ",
    },
  },
];

export function categoryLabel(
  id: ContentCategory | null,
  locale: Locale,
): string {
  if (!id) return "";
  const cat = CATEGORIES.find((c) => c.id === id);
  if (!cat) return id;
  return cat.labels[locale] ?? cat.labels.en;
}

export function categoryEmoji(id: ContentCategory | null): string {
  if (!id) return "";
  return CATEGORIES.find((c) => c.id === id)?.emoji ?? "";
}
