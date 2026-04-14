"use client";

// 결과 페이지
// - Supabase에서 votes + contents + threshold 조회
// - 참여자 수 < reveal_threshold 면 게이팅 UI 표시
// - 상단: 필터 탭 (전체/국가별/성별/연령별) → 바 차트
// - 중단: 광고
// - 하단: 댓글
import { use, useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { getSupabase } from "@/src/lib/supabase";
import { fetchContentWithStats } from "@/src/lib/contents";
import {
  asTournament,
  contentTitle,
  itemLabel,
  type ContentListRow,
} from "@/src/lib/contentTypes";
import { getCountry } from "@/src/lib/countries";
import { useLocale } from "@/src/components/LocaleProvider";
import { CommentsSection } from "@/src/components/CommentsSection";
import { AdSlot } from "@/src/components/AdSlot";

type Vote = {
  id: string;
  choice: string;
  country: string | null;
  gender: string | null;
  age_group: string | null;
  nickname: string | null;
  created_at: string;
};

type FilterMode = "all" | "country" | "gender" | "age";

const PALETTE = [
  "#ff7eb6",
  "#b18cff",
  "#00f0ff",
  "#ffb300",
  "#39ff14",
  "#ff3b30",
  "#2e9cff",
  "#ffd166",
  "#c77dff",
  "#30d158",
];

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { locale, t } = useLocale();

  const [content, setContent] = useState<ContentListRow | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  // 필터 상태
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [filterValue, setFilterValue] = useState<string>("");

  // 데이터 로드
  useEffect(() => {
    (async () => {
      setLoading(true);
      const [c, votesRes] = await Promise.all([
        fetchContentWithStats(id),
        getSupabase()
          .from("votes")
          .select("id, choice, country, gender, age_group, nickname, created_at")
          .eq("content_id", id)
          .order("created_at", { ascending: false })
          .limit(1000),
      ]);
      setContent(c);
      setVotes((votesRes.data ?? []) as Vote[]);
      setLoading(false);
    })();
  }, [id]);

  // 필터 모드 바뀌면 값 리셋
  useEffect(() => {
    setFilterValue("");
  }, [filterMode]);

  // 필터 적용된 투표 집합
  const filteredVotes = useMemo(() => {
    if (filterMode === "all" || !filterValue) return votes;
    return votes.filter((v) => {
      if (filterMode === "country") return v.country === filterValue;
      if (filterMode === "gender") return v.gender === filterValue;
      if (filterMode === "age") return v.age_group === filterValue;
      return true;
    });
  }, [votes, filterMode, filterValue]);

  // 아이템 key → localized label 맵 (tournament 타입만 지원)
  const labelByKey = useMemo(() => {
    if (!content || content.type !== "tournament") return new Map<string, string>();
    const items = asTournament(content).items;
    return new Map(items.map((it) => [it.key, itemLabel(it, locale)]));
  }, [content, locale]);

  // 항목별 집계 (바 차트용)
  const byChoice = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of filteredVotes) {
      map.set(v.choice, (map.get(v.choice) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([key, value]) => ({
        name: labelByKey.get(key) ?? key,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredVotes, labelByKey]);

  // 필터 모드별로 가능한 값 목록 (탭 아래 서브 셀렉터)
  const filterOptions = useMemo(() => {
    const set = new Set<string>();
    for (const v of votes) {
      const val =
        filterMode === "country"
          ? v.country
          : filterMode === "gender"
            ? v.gender
            : filterMode === "age"
              ? v.age_group
              : null;
      if (val) set.add(val);
    }
    return Array.from(set).sort();
  }, [votes, filterMode]);

  const totalVotes = votes.length;
  const filteredTotal = filteredVotes.length;
  const topPick = byChoice[0]?.name ?? "—";

  // ============ 렌더 ============

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p style={{ color: "var(--fg-muted)" }}>Loading…</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p style={{ color: "var(--fg)" }}>Content not found.</p>
      </div>
    );
  }

  const threshold = content.reveal_threshold;
  const isGated = content.participant_count < threshold;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 flex flex-col gap-5">
      {/* 헤더 */}
      <header className="flex flex-col gap-1">
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--accent)" }}
        >
          {t("results.title")}
        </span>
        <h1
          className="text-2xl sm:text-3xl font-extrabold leading-tight"
          style={{ color: "var(--fg)" }}
        >
          {contentTitle(content, locale)}
        </h1>
      </header>

      {/* 요약 카드 */}
      <section className="grid grid-cols-2 gap-3">
        <StatCard
          label={t("results.totalVotes")}
          value={content.participant_count.toLocaleString()}
        />
        <StatCard label={t("results.topPick")} value={isGated ? "🔒" : topPick} />
      </section>

      {/* 게이팅 또는 차트 */}
      {isGated ? (
        <GateCard
          current={content.participant_count}
          threshold={threshold}
          tLoading="Results are hidden until enough people participate."
          tRemaining="participants needed"
        />
      ) : (
        <>
          {/* 필터 탭 */}
          <section className="flex flex-col gap-3">
            <div className="flex gap-1.5 overflow-x-auto">
              <FilterTab
                active={filterMode === "all"}
                onClick={() => setFilterMode("all")}
                icon="🌐"
                label="All"
              />
              <FilterTab
                active={filterMode === "country"}
                onClick={() => setFilterMode("country")}
                icon="🌍"
                label="Country"
              />
              <FilterTab
                active={filterMode === "gender"}
                onClick={() => setFilterMode("gender")}
                icon="⚥"
                label="Gender"
              />
              <FilterTab
                active={filterMode === "age"}
                onClick={() => setFilterMode("age")}
                icon="🎂"
                label="Age"
              />
            </div>

            {/* 서브 셀렉터 (필터 모드가 All이 아닐 때) */}
            {filterMode !== "all" && filterOptions.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                <SubChip
                  active={filterValue === ""}
                  onClick={() => setFilterValue("")}
                  label={`All (${votes.length})`}
                />
                {filterOptions.map((opt) => {
                  const count = votes.filter((v) => {
                    if (filterMode === "country") return v.country === opt;
                    if (filterMode === "gender") return v.gender === opt;
                    if (filterMode === "age") return v.age_group === opt;
                    return false;
                  }).length;
                  const label =
                    filterMode === "country"
                      ? `${getCountry(opt).flag} ${getCountry(opt).name}`
                      : filterMode === "gender"
                        ? opt
                        : opt;
                  return (
                    <SubChip
                      key={opt}
                      active={filterValue === opt}
                      onClick={() => setFilterValue(opt)}
                      label={`${label} (${count})`}
                    />
                  );
                })}
              </div>
            )}
          </section>

          {/* 바 차트 */}
          <ChartCard
            title={
              filterValue
                ? `${filterMode}: ${filterValue} (${filteredTotal})`
                : `All (${filteredTotal})`
            }
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={byChoice} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis type="number" stroke="var(--fg-muted)" fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="var(--fg-muted)"
                  fontSize={11}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--card-border)",
                    borderRadius: 8,
                    color: "var(--fg)",
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {byChoice.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 최근 투표 */}
          <ChartCard title={t("results.recent")}>
            <div className="flex flex-col gap-2">
              {votes.slice(0, 10).map((v) => {
                const flag = getCountry(v.country).flag;
                const displayChoice = labelByKey.get(v.choice) ?? v.choice;
                return (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-2 text-sm py-1.5"
                    style={{ borderBottom: "1px dashed var(--card-border)" }}
                  >
                    <span
                      className="truncate font-semibold"
                      style={{ color: "var(--fg)" }}
                    >
                      {flag} {v.nickname ?? "anon"}
                    </span>
                    <span className="truncate" style={{ color: "var(--accent)" }}>
                      → {displayChoice}
                    </span>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </>
      )}

      {/* 중단 광고 */}
      <AdSlot slot="9319858952" />

      {/* 댓글 */}
      <CommentsSection contentId={id} />
    </div>
  );
}

// ================== UI 서브 컴포넌트 ==================

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col gap-1 p-4"
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <span
        className="text-[11px] font-bold uppercase tracking-wider"
        style={{ color: "var(--fg-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-xl font-extrabold truncate"
        style={{ color: "var(--fg)" }}
      >
        {value}
      </span>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="flex flex-col gap-3 p-4 sm:p-5"
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <h2
        className="text-sm font-bold uppercase tracking-wider"
        style={{ color: "var(--fg-muted)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function FilterTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 px-4 text-sm font-bold whitespace-nowrap transition-all shrink-0"
      style={{
        background: active ? "var(--accent)" : "var(--bg-soft)",
        color: active ? "#fff" : "var(--fg)",
        border: `1px solid ${active ? "var(--accent)" : "var(--card-border)"}`,
        borderRadius: 999,
      }}
    >
      <span aria-hidden>{icon}</span> {label}
    </button>
  );
}

function SubChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-8 px-3 text-xs font-semibold whitespace-nowrap transition-all shrink-0"
      style={{
        background: active ? "var(--accent-2)" : "transparent",
        color: active ? "#fff" : "var(--fg-muted)",
        border: `1px solid ${active ? "var(--accent-2)" : "var(--card-border)"}`,
        borderRadius: 999,
      }}
    >
      {label}
    </button>
  );
}

// 참여자 부족 안내 카드
function GateCard({
  current,
  threshold,
  tLoading,
  tRemaining,
}: {
  current: number;
  threshold: number;
  tLoading: string;
  tRemaining: string;
}) {
  const remaining = Math.max(0, threshold - current);
  const pct = Math.min(100, (current / threshold) * 100);

  return (
    <section
      className="flex flex-col gap-4 p-6 text-center"
      style={{
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <div className="text-5xl">🔒</div>
      <p className="text-base font-semibold" style={{ color: "var(--fg)" }}>
        {tLoading}
      </p>
      <div className="flex flex-col gap-1.5">
        <div
          className="h-3 w-full overflow-hidden"
          style={{ background: "var(--bg-soft)", borderRadius: 999 }}
        >
          <div
            className="h-full transition-all"
            style={{
              width: `${pct}%`,
              background: "var(--accent)",
            }}
          />
        </div>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          {current} / {threshold} — {remaining} {tRemaining}
        </p>
      </div>
    </section>
  );
}
