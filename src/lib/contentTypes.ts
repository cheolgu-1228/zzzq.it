// 컨텐츠 데이터 모델 (Supabase contents 테이블 구조를 TS로 표현)
// translations / candidates 는 jsonb 컬럼 — 구조는 타입별로 다름
import type { Locale } from "./i18n";

// 8가지 컨텐츠 타입
// 1. tournament       — 16강 브라켓 토너먼트
// 2. versus           — 1:1 단판 대결
// 3. poll             — 다중 옵션 중 단일/복수 선택
// 4. ranking          — 항목 순위 정렬
// 5. tier_list        — S/A/B/C/D/F 등급 분류
// 6. rate             — 항목별 점수 평가
// 7. would_you_rather — 연속 이분 선택(여러 질문)
// 8. matching         — 좌우 짝 맞추기
export type ContentType =
  | "tournament"
  | "versus"
  | "poll"
  | "ranking"
  | "tier_list"
  | "rate"
  | "would_you_rather"
  | "matching";

export type ContentStatus = "draft" | "published" | "archived";
export type ContentCategory =
  | "fun"
  | "food"
  | "travel"
  | "life"
  | "movie"
  | "music"
  | "game"
  | "sport"
  | "tech"
  | "fashion"
  | "animal"
  | "love"
  | "work"
  | "culture"
  | "hobby";

// i18n 가능한 문자열
export type Translations = Partial<
  Record<Locale, { title: string; description: string }>
> & {
  en: { title: string; description: string };
};

// 후보 항목의 로케일별 라벨 (en 필수)
export type ItemLabel = Partial<Record<Locale, string>> & { en: string };

// 후보 단일 항목 (모든 타입 공통)
export type CandidateItem = {
  key: string;
  label: ItemLabel;
  image?: string;
  gif?: string;
};

// ======== 타입별 candidates jsonb 스키마 ========

// 1) Tournament — 16 items → 8→4→2→1 브라켓
//    features: 현재 지원 — "show_images"
export type TournamentCandidates = {
  items: CandidateItem[];
  features?: Array<"show_images" | "blind_labels" | "timer">;
};

// 2) Versus — 1:1 단판
export type VersusCandidates = {
  a: CandidateItem;
  b: CandidateItem;
};

// 3) Poll — 다중 선택지
export type PollCandidates = {
  options: CandidateItem[];
  multi?: boolean;       // true 면 복수 선택
  maxPicks?: number;     // multi=true 일 때 최대 선택 개수
};

// 4) Ranking — 항목 순위 정렬
export type RankingCandidates = {
  items: CandidateItem[];
  topN?: number;         // 상위 N개만 제출 (기본값 = items.length)
};

// 5) Tier List — S/A/B/C/D/F 등급 버킷
export type TierListCandidates = {
  items: CandidateItem[];
  tiers: string[];       // 예: ["S","A","B","C","D","F"]
};

// 6) Rate — 항목별 점수
export type RateCandidates = {
  items: CandidateItem[];
  scale: { min: number; max: number; step?: number };
};

// 7) Would You Rather — 연속 이분 선택
export type WouldYouRatherCandidates = {
  questions: { a: CandidateItem; b: CandidateItem }[];
};

// 8) Matching — 좌우 짝 맞추기
export type MatchingCandidates = {
  left: CandidateItem[];
  right: CandidateItem[];
  // key → key, 정답이 있는 경우만 (없으면 자유 매칭)
  correctPairs?: Record<string, string>;
};

export type AnyCandidates =
  | TournamentCandidates
  | VersusCandidates
  | PollCandidates
  | RankingCandidates
  | TierListCandidates
  | RateCandidates
  | WouldYouRatherCandidates
  | MatchingCandidates;

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
  // 자유형 해시태그 (최대 5개, DB check 제약으로 강제)
  tags: string[];
  // 지역/언어 제한 — 빈 배열 = 전 세계 공개
  // 값이 있으면 해당 국가 코드(예: "KR") / 로케일 코드(예: "ko")일 때만 노출
  allowed_countries: string[];
  allowed_locales: string[];
  created_at: string;
  updated_at: string;
};

// contents_list 뷰 row
export type ContentListRow = Content & {
  participant_count: number;
};

// ======== URL 헬퍼 ========
// URL 구조: /contents/{type}/{slug}
// DB의 `type` 컬럼은 snake_case (tier_list, would_you_rather)지만
// URL 세그먼트는 하이픈 형태로 정규화한다 (tier-list, would-you-rather)

// DB type → URL 세그먼트
export const TYPE_URL_SEGMENT: Record<ContentType, string> = {
  tournament: "tournament",
  versus: "versus",
  poll: "poll",
  ranking: "ranking",
  tier_list: "tier-list",
  rate: "rate",
  would_you_rather: "would-you-rather",
  matching: "matching",
};

// URL 세그먼트 → DB type (역매핑)
export const URL_SEGMENT_TO_TYPE: Record<string, ContentType> = Object.fromEntries(
  Object.entries(TYPE_URL_SEGMENT).map(([type, seg]) => [seg, type as ContentType]),
);

// 컨텐츠 row → 참여 페이지 경로
export function contentHref(c: Content | ContentListRow): string {
  const urlType = TYPE_URL_SEGMENT[c.type];
  const prefix = urlType + "-";
  // DB id가 "{urlType}-{slug}" 형식이면 slug만 추출, 아니면 전체를 slug로 간주
  const slug = c.id.startsWith(prefix) ? c.id.slice(prefix.length) : c.id;
  return `/contents/${urlType}/${slug}`;
}

// 컨텐츠 row → 결과 페이지 경로
export function contentResultsHref(c: Content | ContentListRow): string {
  return `${contentHref(c)}/results`;
}

// URL params → DB id 조합
// 예: type="tier-list", slug="breakfast" → "tier-list-breakfast"
export function urlToContentId(type: string, slug: string): string {
  return `${type}-${slug}`;
}

// ======== 지역/언어 제한 체크 ========
// - allowed_countries 가 비어있으면 모든 국가 허용
// - allowed_locales 가 비어있으면 모든 로케일 허용
// - 값이 있으면 해당 조건을 모두 만족해야 노출
export function isContentVisible(
  c: Pick<Content, "allowed_countries" | "allowed_locales">,
  userCountry: string | null,
  userLocale: string,
): boolean {
  if (c.allowed_countries.length > 0) {
    if (!userCountry || !c.allowed_countries.includes(userCountry)) {
      return false;
    }
  }
  if (c.allowed_locales.length > 0) {
    if (!c.allowed_locales.includes(userLocale)) {
      return false;
    }
  }
  return true;
}

// ======== i18n 헬퍼 ========

export function contentTitle(
  c: Content | ContentListRow,
  locale: Locale,
): string {
  return c.translations[locale]?.title ?? c.translations.en.title;
}
export function contentDescription(
  c: Content | ContentListRow,
  locale: Locale,
): string {
  return c.translations[locale]?.description ?? c.translations.en.description;
}
export function itemLabel(item: CandidateItem, locale: Locale): string {
  return item.label[locale] ?? item.label.en;
}

// ======== 타입 가드 (런타임 candidates 보호) ========

export function asTournament(c: Content | ContentListRow): TournamentCandidates {
  if (c.type !== "tournament")
    throw new Error(`Expected tournament, got ${c.type}`);
  return c.candidates as TournamentCandidates;
}
export function asVersus(c: Content): VersusCandidates {
  if (c.type !== "versus") throw new Error(`Expected versus, got ${c.type}`);
  return c.candidates as VersusCandidates;
}
export function asPoll(c: Content): PollCandidates {
  if (c.type !== "poll") throw new Error(`Expected poll, got ${c.type}`);
  return c.candidates as PollCandidates;
}
export function asRanking(c: Content): RankingCandidates {
  if (c.type !== "ranking") throw new Error(`Expected ranking, got ${c.type}`);
  return c.candidates as RankingCandidates;
}
export function asTierList(c: Content): TierListCandidates {
  if (c.type !== "tier_list")
    throw new Error(`Expected tier_list, got ${c.type}`);
  return c.candidates as TierListCandidates;
}
export function asRate(c: Content): RateCandidates {
  if (c.type !== "rate") throw new Error(`Expected rate, got ${c.type}`);
  return c.candidates as RateCandidates;
}
export function asWouldYouRather(c: Content): WouldYouRatherCandidates {
  if (c.type !== "would_you_rather")
    throw new Error(`Expected would_you_rather, got ${c.type}`);
  return c.candidates as WouldYouRatherCandidates;
}
export function asMatching(c: Content): MatchingCandidates {
  if (c.type !== "matching") throw new Error(`Expected matching, got ${c.type}`);
  return c.candidates as MatchingCandidates;
}
