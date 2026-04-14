// 컨텐츠 데이터 모델 (Supabase contents 테이블 구조를 TS로 표현)
// translations / candidates 는 jsonb 컬럼 — 구조는 타입별로 다름
import type { Locale } from "./i18n";

export type ContentType = "tournament" | "versus" | "poll" | "ranking";
export type ContentStatus = "draft" | "published" | "archived";
export type ContentCategory = "fun" | "food" | "travel" | "life";

// i18n 가능한 문자열: 로케일별 key-value. 미정 로케일은 런타임에 en 폴백
export type Translations = Partial<Record<Locale, { title: string; description: string }>> & {
  en: { title: string; description: string };
};

// 후보 항목의 로케일별 라벨 (en 필수)
export type ItemLabel = Partial<Record<Locale, string>> & { en: string };

// 후보 단일 항목 (모든 타입이 공유하는 기본 구조)
export type CandidateItem = {
  key: string;
  label: ItemLabel;
  image?: string;
  gif?: string;
};

// 타입별 candidates jsonb 스키마
export type TournamentCandidates = { items: CandidateItem[] };
export type VersusCandidates = { a: CandidateItem; b: CandidateItem };
export type PollCandidates = { options: CandidateItem[]; multi?: boolean };
export type RankingCandidates = { items: CandidateItem[]; topN?: number };

export type AnyCandidates =
  | TournamentCandidates
  | VersusCandidates
  | PollCandidates
  | RankingCandidates;

// contents 테이블 row
export type Content = {
  id: string;
  type: ContentType;
  category: ContentCategory | null;
  emoji: string | null;
  thumbnail: string | null;
  translations: Translations;
  candidates: AnyCandidates;
  status: ContentStatus;
  published_at: string | null;
  featured: boolean;
  reveal_threshold: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// contents_list 뷰 row (contents + 참여자 수)
export type ContentListRow = Content & {
  participant_count: number;
};

// ======== i18n 헬퍼 ========

// 컨텐츠의 title/description을 현재 로케일로 가져오기 (en 폴백)
export function contentTitle(c: Content | ContentListRow, locale: Locale): string {
  return c.translations[locale]?.title ?? c.translations.en.title;
}
export function contentDescription(c: Content | ContentListRow, locale: Locale): string {
  return c.translations[locale]?.description ?? c.translations.en.description;
}

// candidate 항목 라벨을 현재 로케일로 가져오기 (en 폴백)
export function itemLabel(item: CandidateItem, locale: Locale): string {
  return item.label[locale] ?? item.label.en;
}

// 타입별 candidates 추출 헬퍼 (타입 가드)
export function asTournament(c: Content | ContentListRow): TournamentCandidates {
  if (c.type !== "tournament")
    throw new Error(`Expected tournament, got ${c.type}`);
  return c.candidates as TournamentCandidates;
}
