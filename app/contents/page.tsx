"use client";

// 컨텐츠 리스트 페이지
// - Supabase contents_list 뷰에서 공개 컨텐츠 + 참여자 수 fetch
// - 카테고리 필터 탭 (all / fun / food / travel / life)
// - 카드마다 참여 버튼 + 결과 보기 아이콘 버튼 + 참여자 수 뱃지
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchContentsList } from "@/src/lib/contents";
import { loadProfile } from "@/src/lib/profile";
import type {
  ContentListRow,
  ContentCategory,
  ContentType,
} from "@/src/lib/contentTypes";
import {
  contentTitle,
  contentDescription,
  contentHref,
  contentResultsHref,
  isContentVisible,
} from "@/src/lib/contentTypes";

// 템플릿 타입별 짧은 라벨 — 아이콘 하단에 표시
// 카드에서 이 컨텐츠가 어떤 형식의 게임인지 한눈에 알리는 용도
const TEMPLATE_LABEL: Record<ContentType, string> = {
  tournament: "16강",
  versus: "1vs1",
  poll: "Poll",
  ranking: "Rank",
  tier_list: "Tier",
  rate: "Rate",
  would_you_rather: "WYR",
  matching: "Match",
};
import { CATEGORIES, categoryLabel } from "@/src/lib/categories";
import { useLocale } from "@/src/components/LocaleProvider";
import { AdSlot } from "@/src/components/AdSlot";

type Filter = "all" | ContentCategory;

export default function ContentsPage() {
  const { locale, t } = useLocale();
  const [contents, setContents] = useState<ContentListRow[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    fetchContentsList().then(setContents);
  }, []);

  const filtered = useMemo(() => {
    if (!contents) return [];
    // 1) 지역/언어 제한 필터 (profile.country + 현재 locale 기준)
    //    locked 컨텐츠는 조건을 만족하지 않으면 아예 리스트에서 제거
    const profile = loadProfile();
    const userCountry = profile?.country ?? null;
    const visible = contents.filter((c) =>
      isContentVisible(c, userCountry, locale),
    );
    // 2) 카테고리 탭 필터
    if (filter === "all") return visible;
    return visible.filter((c) => c.category === filter);
  }, [contents, filter, locale]);

  // h-full로 main 영역(뷰포트 - 헤더 - 푸터)을 꽉 채움
  // 리스트만 내부 스크롤, 제목/필터/박스 헤더/광고는 항상 고정
  return (
    <div className="h-full max-w-3xl mx-auto px-4 pt-3 pb-2 flex flex-col gap-2.5">
      <header className="flex items-baseline gap-2 flex-wrap">
        <h1
          className="text-xl sm:text-2xl font-extrabold tracking-tight"
          style={{ color: "var(--fg)" }}
        >
          {t("contents.title")}
        </h1>
        <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
          {t("app.tagline")}
        </p>
      </header>

      {/* 카테고리 필터 탭 — 가로 스크롤, 스크롤바 숨김 */}
      <nav className="zq-no-scrollbar flex gap-1.5 overflow-x-auto -mx-1 px-1 shrink-0">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
          emoji="🌐"
        />
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c.id}
            active={filter === c.id}
            onClick={() => setFilter(c.id)}
            label={categoryLabel(c.id, locale)}
            emoji={c.emoji}
          />
        ))}
      </nav>

      {/* 리스트 박스 — flex-1로 남은 공간 전부 차지, 내부 스크롤 */}
      <section
        className="relative overflow-hidden flex-1 min-h-0 flex flex-col"
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        {/* 상단 헤더 바 — 압축 */}
        <div
          className="flex items-center justify-between px-4 py-1.5 shrink-0"
          style={{
            background: "var(--bg-soft)",
            borderBottom: "1px solid var(--card-border)",
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--fg-muted)" }}
          >
            {contents === null
              ? "Loading…"
              : `${filtered.length} ${filtered.length === 1 ? "Content" : "Contents"}`}
          </span>
          <span
            className="text-[10px] font-semibold"
            style={{ color: "var(--fg-muted)" }}
          >
            ↓ Latest
          </span>
        </div>

        {/* 리스트 — flex-1 + min-h-0 로 남은 공간 차지 후 내부 스크롤 */}
        <ul className="flex flex-col overflow-y-auto flex-1 min-h-0">
          {contents === null ? (
            <li
              className="py-12 text-center text-sm"
              style={{ color: "var(--fg-muted)" }}
            >
              Loading…
            </li>
          ) : filtered.length === 0 ? (
            <li
              className="py-12 text-center text-sm"
              style={{ color: "var(--fg-muted)" }}
            >
              No contents in this category yet.
            </li>
          ) : (
            filtered.map((c, idx) => (
              <li
                key={c.id}
                className="group relative flex items-center gap-2.5 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 transition-all"
                style={{
                  borderBottom:
                    idx === filtered.length - 1
                      ? "none"
                      : "1px solid var(--card-border)",
                }}
              >
                {/* 좌측 아이콘 열 — 아이콘 타일 + 템플릿 타입 라벨 */}
                <Link
                  href={contentHref(c)}
                  className="flex flex-col items-center gap-1 shrink-0 transition-transform group-hover:scale-105"
                  aria-label={contentTitle(c, locale)}
                >
                  {/* 아이콘 타일 */}
                  <div
                    className="relative w-11 h-11 sm:w-16 sm:h-16 flex items-center justify-center text-xl sm:text-3xl"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--bg-soft), color-mix(in srgb, var(--accent) 15%, var(--bg-soft)))",
                      border: "1px solid var(--card-border)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    {c.emoji ?? "🎯"}
                    {c.featured && (
                      <span
                        className="absolute -top-1 -right-1 w-4 h-4 sm:-top-1.5 sm:-right-1.5 sm:w-5 sm:h-5 flex items-center justify-center text-[9px] sm:text-[10px]"
                        style={{
                          background: "var(--accent)",
                          color: "#fff",
                          borderRadius: 999,
                          boxShadow: "var(--shadow-soft)",
                        }}
                        aria-label="Featured"
                      >
                        ★
                      </span>
                    )}
                  </div>
                  {/* 템플릿 타입 라벨 (아이콘 하단) */}
                  <span
                    className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--accent)" }}
                  >
                    {TEMPLATE_LABEL[c.type]}
                  </span>
                </Link>

                {/* 중앙 텍스트 (제목 길면 가로 스와이프로 전체 보기) */}
                <Link
                  href={contentHref(c)}
                  className="flex flex-col min-w-0 flex-1 gap-0.5"
                >
                  <h2
                    className="zq-no-scrollbar font-bold text-base sm:text-lg leading-tight whitespace-nowrap overflow-x-auto"
                    style={{
                      color: "var(--fg)",
                      // 모바일에서 터치 스와이프가 링크 네비게이션과 구분되도록
                      touchAction: "pan-x",
                    }}
                  >
                    {contentTitle(c, locale)}
                  </h2>
                  <p
                    className="zq-no-scrollbar text-xs sm:text-sm whitespace-nowrap overflow-x-auto"
                    style={{
                      color: "var(--fg-muted)",
                      touchAction: "pan-x",
                    }}
                  >
                    {contentDescription(c, locale)}
                  </p>
                  {/*
                    참여자 수 + 해시태그 (한 행, 가로 스크롤)
                    - 👥 pill은 shrink-0으로 고정
                    - 태그는 flex-nowrap 으로 줄바꿈 방지, overflow-x-auto 로 가로 스크롤
                    - zq-no-scrollbar 로 스크롤바 시각적으로 숨김
                  */}
                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold min-w-0">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 shrink-0"
                      style={{
                        background: "var(--accent)",
                        color: "#fff",
                        borderRadius: 999,
                      }}
                    >
                      👥 {c.participant_count.toLocaleString()}
                    </span>
                    <div className="zq-no-scrollbar flex gap-1.5 overflow-x-auto flex-nowrap min-w-0 pb-0.5">
                      {c.tags?.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 shrink-0 whitespace-nowrap"
                          style={{
                            background: "transparent",
                            color: "var(--fg-muted)",
                            border: "1px solid var(--card-border)",
                            borderRadius: 999,
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>

                {/*
                  우측 액션 버튼
                  - 모바일: 세로 2줄 (참여하기 위, 결과보기 아래)
                  - 데스크톱: 가로 1줄 (결과 아이콘, 참여하기 버튼)
                */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2 shrink-0">
                  <Link
                    href={contentHref(c)}
                    className="order-1 h-8 sm:h-11 px-2.5 sm:px-4 inline-flex items-center justify-center font-bold text-[11px] sm:text-sm whitespace-nowrap transition-all hover:scale-105"
                    style={{
                      background: "var(--accent)",
                      color: "#fff",
                      borderRadius: "var(--radius-sm)",
                      boxShadow: "var(--shadow-soft)",
                    }}
                  >
                    {t("contents.join")}
                  </Link>
                  <Link
                    href={contentResultsHref(c)}
                    aria-label={t("contents.results")}
                    className="order-2 sm:order-none h-7 sm:h-11 sm:w-11 w-full inline-flex items-center justify-center text-sm sm:text-lg transition-all hover:scale-110"
                    style={{
                      background: "var(--bg-soft)",
                      color: "var(--fg)",
                      border: "1px solid var(--card-border)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    📊
                  </Link>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <AdSlot slot="3154952035" />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  emoji,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  emoji: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 px-3 text-sm font-semibold whitespace-nowrap transition-all shrink-0"
      style={{
        background: active ? "var(--accent)" : "var(--bg-soft)",
        color: active ? "#fff" : "var(--fg)",
        border: `1px solid ${active ? "var(--accent)" : "var(--card-border)"}`,
        borderRadius: 999,
        boxShadow: active ? "var(--shadow-soft)" : "none",
      }}
    >
      <span aria-hidden>{emoji}</span> {label}
    </button>
  );
}
