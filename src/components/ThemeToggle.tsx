"use client";

// 헤더에 항상 노출되는 테마 전환 토글 (아이콘 3개)
// 현재 digital/gaming은 준비중 상태 — 클릭 시 툴팁만 띄우고 전환 안 함
import { useEffect, useRef, useState } from "react";
import { useTheme, type ThemeId } from "./ThemeProvider";
import { useLocale } from "./LocaleProvider";

type Option = { id: ThemeId; label: string; icon: string; disabled?: boolean };

const OPTIONS: Option[] = [
  { id: "cute", label: "Cute", icon: "🌸" },
  { id: "digital", label: "Digital", icon: "⚡", disabled: true },
  { id: "gaming", label: "Gaming", icon: "🎮", disabled: true },
];

// "준비중..." 짧은 툴팁 텍스트 — 별도 번역 파일 없이 인라인으로 처리
const COMING_SOON: Record<string, string> = {
  en: "Coming soon...",
  ko: "모드 준비중...",
  ja: "準備中...",
  zh: "准备中...",
  es: "Próximamente...",
  pt: "Em breve...",
  fr: "Bientôt disponible...",
  de: "Demnächst...",
  ru: "Скоро...",
  hi: "जल्द आ रहा है...",
  ar: "قريباً...",
  id: "Segera hadir...",
  vi: "Sắp ra mắt...",
  tr: "Yakında...",
  th: "เร็ว ๆ นี้...",
  it: "In arrivo...",
  pl: "Wkrótce...",
  nl: "Binnenkort...",
  bn: "শীঘ্রই আসছে...",
};

const TOOLTIP_DURATION = 800;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { locale } = useLocale();

  // 현재 툴팁이 떠 있는 비활성 옵션 id
  const [noticeFor, setNoticeFor] = useState<ThemeId | null>(null);
  const timerRef = useRef<number | null>(null);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = (opt: Option) => {
    if (opt.disabled) {
      // 준비중 툴팁 표시 후 1.5초 뒤 자동 숨김
      setNoticeFor(opt.id);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setNoticeFor(null);
        timerRef.current = null;
      }, TOOLTIP_DURATION);
      return;
    }
    setTheme(opt.id);
  };

  const tooltipText = COMING_SOON[locale] ?? COMING_SOON.en;

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex items-center gap-0.5 p-0.5 rounded-full border"
      style={{
        background: "var(--bg-soft)",
        borderColor: "var(--card-border)",
      }}
    >
      {OPTIONS.map((o) => {
        const active = theme === o.id && !o.disabled;
        const showTip = noticeFor === o.id;
        return (
          // 각 버튼을 자체 relative 컨테이너로 감싸서 툴팁이 그 버튼 바로 아래 위치하도록 한다
          <div key={o.id} className="relative">
            <button
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={o.label}
              aria-disabled={o.disabled ? true : undefined}
              onClick={() => handleClick(o)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-sm transition-all"
              style={{
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#fff" : "var(--fg-muted)",
                opacity: o.disabled ? 0.55 : 1,
                cursor: o.disabled ? "not-allowed" : "pointer",
                transform: active ? "scale(1.08)" : "scale(1)",
                boxShadow: active ? "var(--shadow-soft)" : "none",
              }}
            >
              <span aria-hidden>{o.icon}</span>
            </button>

            {/* 각 버튼 바로 아래 개별 툴팁 */}
            {showTip && (
              <div
                role="status"
                aria-live="polite"
                className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold pointer-events-none zq-animate-slide z-50"
                style={{
                  background: "var(--card)",
                  color: "var(--fg)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "var(--radius-sm)",
                  boxShadow: "var(--shadow)",
                }}
              >
                {tooltipText}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
