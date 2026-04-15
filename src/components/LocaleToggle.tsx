"use client";

// 헤더용 언어 선택 드롭다운
import { useEffect, useRef, useState } from "react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/src/lib/i18n";
import { useLocale } from "./LocaleProvider";

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const current = LOCALE_LABELS[locale];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="h-7 px-2 flex items-center gap-1 text-xs font-semibold"
        style={{
          background: "var(--bg-soft)",
          color: "var(--fg)",
          border: "1px solid var(--card-border)",
          borderRadius: 9999,
        }}
      >
        <span aria-hidden>{current.flag}</span>
        <span className="hidden sm:inline">{current.name}</span>
        <span
          className="text-[10px]"
          style={{ color: "var(--fg-muted)" }}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 min-w-[140px] py-1 z-50 overflow-y-auto overscroll-contain"
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: "var(--radius-sm)",
            boxShadow: "var(--shadow)",
            // 19개 로케일 → 뷰포트 기준 최대 높이 제한 (70% 축소)
            maxHeight: "min(42dvh, 252px)",
          }}
        >
          {LOCALES.map((l) => {
            const meta = LOCALE_LABELS[l as Locale];
            const active = l === locale;
            return (
              <li key={l}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLocale(l as Locale);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-left transition-colors"
                  style={{
                    background: active ? "var(--bg-soft)" : "transparent",
                    color: active ? "var(--accent)" : "var(--fg)",
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  <span aria-hidden>{meta.flag}</span>
                  <span>{meta.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
