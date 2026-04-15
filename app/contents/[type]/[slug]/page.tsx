"use client";

// 컨텐츠 참여 페이지 — 타입별 템플릿 디스패처
// URL: /contents/{type}/{slug}
// 현재 풀 구현: tournament
// 나머지 7종 → ComingSoonTemplate
// 지역/언어 제한(allowed_countries/allowed_locales)도 직접 URL 접근 시 차단
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchContent } from "@/src/lib/contents";
import {
  isContentVisible,
  urlToContentId,
  type Content,
} from "@/src/lib/contentTypes";
import { loadProfile } from "@/src/lib/profile";
import { useLocale } from "@/src/components/LocaleProvider";
import { TournamentTemplate } from "@/src/templates/TournamentTemplate";
import { ComingSoonTemplate } from "@/src/templates/ComingSoonTemplate";

export default function ContentPage({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}) {
  const { type, slug } = use(params);
  const id = urlToContentId(type, slug);
  const router = useRouter();
  const { locale } = useLocale();

  const [content, setContent] = useState<Content | null | "loading">("loading");

  useEffect(() => {
    fetchContent(id).then((c) => {
      if (!c) {
        setContent(null);
        return;
      }
      // 지역/언어 제한 체크 — 직접 URL로 접근해도 차단
      const profile = loadProfile();
      const userCountry = profile?.country ?? null;
      if (!isContentVisible(c, userCountry, locale)) {
        router.replace("/contents");
        return;
      }
      setContent(c);
    });
  }, [id, locale, router]);

  if (content === "loading") {
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

  // 타입별 템플릿 디스패치
  // 풀 구현된 타입만 case 로 명시, 나머지는 default → ComingSoon
  switch (content.type) {
    case "tournament":
      return <TournamentTemplate content={content} />;
    default:
      return <ComingSoonTemplate content={content} />;
  }
}
