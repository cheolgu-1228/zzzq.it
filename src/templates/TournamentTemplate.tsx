"use client";

// 토너먼트 템플릿 — 16강 → 8강 → 4강 → 결승 형식
// Content(DB row)를 받아서 candidates.items 로 매치 생성
// 내부 상태는 item.key 로 추적, 표시는 itemLabel(locale) 로 i18n
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  asTournament,
  itemLabel,
  type CandidateItem,
  type Content,
} from "@/src/lib/contentTypes";
import { loadProfile } from "@/src/lib/profile";
import { getSupabase } from "@/src/lib/supabase";
import { useLocale } from "@/src/components/LocaleProvider";
import { Confetti } from "@/src/components/Confetti";

type Match = { a: CandidateItem; b: CandidateItem; winnerKey?: string };
type Round = { name: string; matches: Match[] };

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildInitialRound(items: CandidateItem[]): Round {
  const shuffled = shuffle(items);
  const matches: Match[] = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    matches.push({ a: shuffled[i], b: shuffled[i + 1] });
  }
  return { name: "round16", matches };
}

const ROUND_LABEL_KEY: Record<string, string> = {
  round16: "tournament.round16",
  quarter: "tournament.quarter",
  semi: "tournament.semi",
  final: "tournament.final",
};

export function TournamentTemplate({ content }: { content: Content }) {
  const router = useRouter();
  const { locale, t } = useLocale();

  const items = useMemo(() => asTournament(content).items, [content]);
  const byKey = useMemo(
    () => new Map(items.map((it) => [it.key, it])),
    [items],
  );

  // 토너먼트 전체 진행 상태
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);
  const [pickedSide, setPickedSide] = useState<"a" | "b" | null>(null);
  const [championKey, setChampionKey] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // 초기 16강 생성
  useEffect(() => {
    if (items.length < 2) return;
    setRounds([buildInitialRound(items)]);
    setCurrentRoundIdx(0);
    setCurrentMatchIdx(0);
    setPickedSide(null);
    setChampionKey(null);
    setSaved(false);
  }, [items]);

  const currentRound = rounds[currentRoundIdx];
  const currentMatch = currentRound?.matches[currentMatchIdx];
  const totalPicksInRound = currentRound?.matches.length ?? 0;

  // 선택 → 애니메이션 후 다음 매치로
  const handlePick = (side: "a" | "b") => {
    if (pickedSide || !currentMatch) return;
    setPickedSide(side);
    const winner = side === "a" ? currentMatch.a : currentMatch.b;

    window.setTimeout(() => {
      setRounds((prev) => {
        const next = prev.map((r) => ({
          ...r,
          matches: r.matches.map((m) => ({ ...m })),
        }));
        next[currentRoundIdx].matches[currentMatchIdx].winnerKey = winner.key;
        return next;
      });

      if (currentMatchIdx + 1 < totalPicksInRound) {
        setCurrentMatchIdx((i) => i + 1);
        setPickedSide(null);
        return;
      }

      // 라운드 종료 — 다음 라운드 생성 or 우승
      setRounds((prev) => {
        const winnerItems = prev[currentRoundIdx].matches.map((m, idx) => {
          if (idx === currentMatchIdx) return winner;
          const key = m.winnerKey ?? m.a.key;
          return byKey.get(key) ?? m.a;
        });

        if (winnerItems.length === 1) {
          setChampionKey(winnerItems[0].key);
          return prev;
        }

        const nextName =
          winnerItems.length === 8
            ? "quarter"
            : winnerItems.length === 4
              ? "semi"
              : "final";

        const nextMatches: Match[] = [];
        for (let i = 0; i < winnerItems.length; i += 2) {
          nextMatches.push({ a: winnerItems[i], b: winnerItems[i + 1] });
        }
        return [...prev, { name: nextName, matches: nextMatches }];
      });

      setCurrentMatchIdx(0);
      setCurrentRoundIdx((i) => i + 1);
      setPickedSide(null);
    }, 650);
  };

  // 우승 확정 시 Supabase 저장
  useEffect(() => {
    if (!championKey || saved) return;
    const profile = loadProfile();

    // 매치 직렬화용: {a_key, b_key, winner_key}
    const serializeRound = (r: Round | undefined) =>
      r
        ? r.matches.map((m) => ({
            a: m.a.key,
            b: m.b.key,
            winner: m.winnerKey,
          }))
        : null;

    const quarter = serializeRound(rounds.find((r) => r.name === "quarter"));
    const semi = serializeRound(rounds.find((r) => r.name === "semi"));
    const finalR = rounds.find((r) => r.name === "final");
    const runnerUpKey =
      finalR && finalR.matches[0]
        ? finalR.matches[0].a.key === championKey
          ? finalR.matches[0].b.key
          : finalR.matches[0].a.key
        : null;

    const supabase = getSupabase();
    (async () => {
      await supabase.from("tournament_results").insert({
        content_id: content.id,
        winner: championKey,
        runner_up: runnerUpKey,
        semi_finals: semi,
        quarter_finals: quarter,
        country: profile?.country ?? null,
        gender: profile?.gender ?? null,
        age_group: profile?.ageGroup ?? null,
        nickname: profile?.nickname ?? null,
      });
      await supabase.from("votes").insert({
        content_id: content.id,
        choice: championKey,
        country: profile?.country ?? null,
        gender: profile?.gender ?? null,
        age_group: profile?.ageGroup ?? null,
        nickname: profile?.nickname ?? null,
      });
      setSaved(true);
    })();
  }, [championKey, saved, content.id, rounds]);

  // 미니맵 진행률
  const miniMap = useMemo(
    () =>
      rounds.map((r, idx) => ({
        total: r.matches.length * 2,
        done:
          idx < currentRoundIdx
            ? r.matches.length * 2
            : idx === currentRoundIdx
              ? currentMatchIdx * 2 + (pickedSide ? 1 : 0)
              : 0,
      })),
    [rounds, currentRoundIdx, currentMatchIdx, pickedSide],
  );

  // 우승 화면
  if (championKey) {
    const championItem = byKey.get(championKey);
    const label = championItem ? itemLabel(championItem, locale) : championKey;
    return (
      <div className="max-w-xl mx-auto px-4 py-10 flex flex-col gap-6 items-center text-center relative">
        <Confetti />
        <div className="text-5xl sm:text-6xl">🏆</div>
        <h1
          className="text-3xl sm:text-4xl font-extrabold tracking-tight zq-animate-slide"
          style={{ color: "var(--fg)" }}
        >
          {t("tournament.winner")}
        </h1>
        <div
          className="text-2xl sm:text-3xl font-bold px-6 py-4 zq-animate-picked"
          style={{
            background: "var(--card)",
            color: "var(--accent)",
            border: "2px solid var(--accent)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--glow)",
          }}
        >
          {label}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-4">
          <button
            type="button"
            onClick={() => router.push(`/contents/${content.id}/results`)}
            className="flex-1 h-12 font-bold"
            style={{
              background: "var(--accent)",
              color: "#fff",
              borderRadius: "var(--radius-sm)",
              boxShadow: "var(--shadow)",
            }}
          >
            {t("tournament.viewResults")}
          </button>
          <button
            type="button"
            onClick={() => {
              setRounds([buildInitialRound(items)]);
              setCurrentRoundIdx(0);
              setCurrentMatchIdx(0);
              setPickedSide(null);
              setChampionKey(null);
              setSaved(false);
            }}
            className="flex-1 h-12 font-semibold"
            style={{
              background: "var(--bg-soft)",
              color: "var(--fg)",
              border: "1px solid var(--card-border)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            {t("tournament.playAgain")}
          </button>
        </div>
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p style={{ color: "var(--fg-muted)" }}>Loading…</p>
      </div>
    );
  }

  const roundLabel = t(ROUND_LABEL_KEY[currentRound.name] ?? "");

  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:py-10 flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--accent)" }}
          >
            {roundLabel}
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--fg-muted)" }}
          >
            {t("tournament.progress")} {currentMatchIdx + 1}/{totalPicksInRound}
          </span>
        </div>
        <div className="flex gap-1.5">
          {miniMap.map((m, idx) => {
            const pct = m.total === 0 ? 0 : (m.done / m.total) * 100;
            return (
              <div
                key={idx}
                className="flex-1 h-1.5 overflow-hidden"
                style={{ background: "var(--bg-soft)", borderRadius: 99 }}
              >
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: "var(--accent)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </header>

      <section className="flex flex-col items-center gap-4">
        <PickCard
          label={itemLabel(currentMatch.a, locale)}
          side="a"
          picked={pickedSide}
          onPick={handlePick}
          accent="var(--accent)"
        />
        <div
          key={`${currentRoundIdx}-${currentMatchIdx}`}
          className="text-2xl font-black tracking-wider zq-animate-vs"
          style={{
            color: "var(--accent-2)",
            textShadow: "var(--shadow-soft)",
          }}
        >
          VS
        </div>
        <PickCard
          label={itemLabel(currentMatch.b, locale)}
          side="b"
          picked={pickedSide}
          onPick={handlePick}
          accent="var(--accent-3)"
        />
      </section>

      <p
        className="text-center text-xs"
        style={{ color: "var(--fg-muted)" }}
      >
        {t("tournament.pickOne")}
      </p>
    </div>
  );
}

function PickCard({
  label,
  side,
  picked,
  onPick,
  accent,
}: {
  label: string;
  side: "a" | "b";
  picked: "a" | "b" | null;
  onPick: (s: "a" | "b") => void;
  accent: string;
}) {
  const state = picked == null ? "idle" : picked === side ? "picked" : "lost";
  const cls =
    state === "picked"
      ? "zq-animate-picked"
      : state === "lost"
        ? "zq-animate-out"
        : "zq-animate-slide";

  return (
    <button
      type="button"
      onClick={() => onPick(side)}
      disabled={picked !== null}
      className={`w-full max-w-sm h-28 sm:h-32 px-4 text-lg sm:text-xl font-extrabold tracking-tight transition-transform ${cls}`}
      style={{
        background: "var(--card)",
        color: "var(--fg)",
        border: `2px solid ${state === "picked" ? accent : "var(--card-border)"}`,
        borderRadius: "var(--radius)",
        boxShadow: state === "picked" ? "var(--glow)" : "var(--shadow-soft)",
      }}
    >
      {label}
    </button>
  );
}
