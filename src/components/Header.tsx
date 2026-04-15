"use client";

// 앱 공통 헤더 — 로고 + 테마 토글
// 로고 클릭 이동 규칙:
// - /contents (리스트) → / (홈)
// - 그 외 페이지(/contents/[id], /contents/[id]/results 등) → /contents (리스트)
// - / 또는 기본 → /
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleToggle } from "./LocaleToggle";

function resolveHomeHref(pathname: string | null): string {
  if (!pathname) return "/";
  // 컨텐츠 리스트 페이지에서는 진짜 홈으로
  if (pathname === "/contents") return "/";
  // 컨텐츠 내부 (참여/결과) 또는 그 외 하위 페이지는 리스트로
  if (pathname.startsWith("/contents/")) return "/contents";
  return "/";
}

export function Header() {
  const pathname = usePathname();
  const homeHref = resolveHomeHref(pathname);
  return (
    <header
      className="shrink-0 z-40 w-full backdrop-blur-md"
      style={{
        background: "color-mix(in srgb, var(--bg) 92%, transparent)",
        borderBottom: "1px solid var(--card-border)",
      }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2">
        <Link href={homeHref} className="flex items-center gap-1.5">
          <Image
            src="/zq_logo.png"
            alt="zzzQ.it"
            width={26}
            height={26}
            className="rounded-md"
            style={{ background: "var(--fg)", padding: 2 }}
          />
          <span
            className="font-bold tracking-tight text-base"
            style={{ color: "var(--fg)" }}
          >
            zzzQ.it
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
