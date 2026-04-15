// 다국어 메시지 + 로케일 정의
// 메시지는 src/lib/messages/{locale}.json 에서 import (AI 번역 스크립트 결과물)
// UI 문자열 추가/수정 → en.json 수정 → scripts/translate-i18n.mjs 실행 → 자동 재생성
import en from "./messages/en.json";
import ko from "./messages/ko.json";
import ja from "./messages/ja.json";
import zh from "./messages/zh.json";
import es from "./messages/es.json";
import pt from "./messages/pt.json";
import fr from "./messages/fr.json";
import de from "./messages/de.json";
import ru from "./messages/ru.json";
import hi from "./messages/hi.json";
import ar from "./messages/ar.json";
import id from "./messages/id.json";
import vi from "./messages/vi.json";
import tr from "./messages/tr.json";
import th from "./messages/th.json";
import it from "./messages/it.json";
import pl from "./messages/pl.json";
import nl from "./messages/nl.json";
import bn from "./messages/bn.json";

export const LOCALES = [
  "en",
  "ko",
  "ja",
  "zh",
  "es",
  "pt",
  "fr",
  "de",
  "ru",
  "hi",
  "ar",
  "id",
  "vi",
  "tr",
  "th",
  "it",
  "pl",
  "nl",
  "bn",
] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

// RTL 로케일 — LocaleProvider가 html[dir]을 이 집합 기준으로 세팅
export const RTL_LOCALES: ReadonlySet<Locale> = new Set<Locale>(["ar"]);

export const LOCALE_LABELS: Record<Locale, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇺🇸" },
  ko: { name: "한국어", flag: "🇰🇷" },
  ja: { name: "日本語", flag: "🇯🇵" },
  zh: { name: "中文", flag: "🇨🇳" },
  es: { name: "Español", flag: "🇪🇸" },
  pt: { name: "Português", flag: "🇵🇹" },
  fr: { name: "Français", flag: "🇫🇷" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  ru: { name: "Русский", flag: "🇷🇺" },
  hi: { name: "हिन्दी", flag: "🇮🇳" },
  ar: { name: "العربية", flag: "🇸🇦" },
  id: { name: "Indonesia", flag: "🇮🇩" },
  vi: { name: "Tiếng Việt", flag: "🇻🇳" },
  tr: { name: "Türkçe", flag: "🇹🇷" },
  th: { name: "ไทย", flag: "🇹🇭" },
  it: { name: "Italiano", flag: "🇮🇹" },
  pl: { name: "Polski", flag: "🇵🇱" },
  nl: { name: "Nederlands", flag: "🇳🇱" },
  bn: { name: "বাংলা", flag: "🇧🇩" },
};

// 메시지 트리 타입 (en을 기준으로 다른 로케일도 동일 구조 유지)
export type Messages = {
  app: { name: string; tagline: string };
  nav: { home: string; contents: string };
  theme: { cute: string; digital: string; gaming: string };
  home: {
    title: string;
    subtitle: string;
    country: string;
    gender: string;
    age: string;
    nickname: string;
    nicknamePlaceholder: string;
    start: string;
    selectCountry: string;
  };
  gender: { male: string; female: string; other: string };
  age: {
    "10s": string;
    "20s": string;
    "30s": string;
    "40s": string;
    "50s+": string;
  };
  contents: { title: string; join: string; results: string };
  tournament: {
    round16: string;
    quarter: string;
    semi: string;
    final: string;
    pickOne: string;
    winner: string;
    playAgain: string;
    viewResults: string;
    progress: string;
  };
  results: {
    title: string;
    totalVotes: string;
    topPick: string;
    byCountry: string;
    byRound: string;
    recent: string;
    comments: string;
    writeComment: string;
    send: string;
    empty: string;
  };
};

export const messages: Record<Locale, Messages> = {
  en: en as Messages,
  ko: ko as Messages,
  ja: ja as Messages,
  zh: zh as Messages,
  es: es as Messages,
  pt: pt as Messages,
  fr: fr as Messages,
  de: de as Messages,
  ru: ru as Messages,
  hi: hi as Messages,
  ar: ar as Messages,
  id: id as Messages,
  vi: vi as Messages,
  tr: tr as Messages,
  th: th as Messages,
  it: it as Messages,
  pl: pl as Messages,
  nl: nl as Messages,
  bn: bn as Messages,
};

// 점 경로("home.title")로 메시지 탐색, en 폴백 포함
export function translate(locale: Locale, path: string): string {
  const tryLocale = (loc: Locale): string | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cur: any = messages[loc];
    for (const p of path.split(".")) {
      if (cur && typeof cur === "object" && p in cur) cur = cur[p];
      else return undefined;
    }
    return typeof cur === "string" ? cur : undefined;
  };
  return tryLocale(locale) ?? tryLocale(DEFAULT_LOCALE) ?? path;
}
