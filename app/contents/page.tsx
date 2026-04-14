"use client";

// 컨텐츠 리스트 페이지
// - Supabase contents_list 뷰에서 공개 컨텐츠 + 참여자 수 fetch
// - 카테고리 필터 탭 (all / fun / food / travel / life)
// - 카드마다 참여 버튼 + 결과 보기 아이콘 버튼 + 참여자 수 뱃지
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchContentsList } from "@/src/lib/contents";
import type { ContentListRow, ContentCategory } from "@/src/lib/contentTypes";
import {
  contentTitle,
  contentDescription,
} from "@/src/lib/contentTypes";
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
    if (filter === "all") return contents;
    return contents.filter((c) => c.category === filter);
  }, [contents, filter]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ color: "var(--fg)" }}
        >
          {t("contents.title")}
        </h1>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          {t("app.tagline")}
        </p>
      </header>

      {/* 카테고리 필터 탭 */}
      <nav className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
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

      {/* 리스트 */}
      {contents === null ? (
        <p className="text-sm text-center py-8" style={{ color: "var(--fg-muted)" }}>
          Loading…
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: "var(--fg-muted)" }}>
          No contents in this category yet.
        </p>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <article
              key={c.id}
              className="flex flex-col gap-4 p-5"
              style={{
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                borderRadius: "var(--radius)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 flex items-center justify-center text-2xl shrink-0"
                  style={{
                    background: "var(--bg-soft)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  {c.emoji ?? "🎯"}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {c.featured && (
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5"
                        style={{
                          background: "var(--accent)",
                          color: "#fff",
                          borderRadius: 999,
                        }}
                      >
                        ★ Featured
                      </span>
                    )}
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      👥 {c.participant_count.toLocaleString()}
                    </span>
                  </div>
                  <h2
                    className="font-bold text-lg leading-tight mt-0.5"
                    style={{ color: "var(--fg)" }}
                  >
                    {contentTitle(c, locale)}
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {contentDescription(c, locale)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/contents/${c.id}`}
                  className="flex-1 h-11 inline-flex items-center justify-center font-semibold text-sm"
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                    borderRadius: "var(--radius-sm)",
                    boxShadow: "var(--shadow-soft)",
                  }}
                >
                  {t("contents.join")} →
                </Link>
                <Link
                  href={`/contents/${c.id}/results`}
                  aria-label={t("contents.results")}
                  className="w-11 h-11 inline-flex items-center justify-center text-lg"
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
            </article>
          ))}
        </section>
      )}

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
