"use client";

// 컨텐츠 참여 페이지 — 타입별 템플릿 디스패처
// 현재는 tournament 타입만 구현. 추후 versus/poll/ranking 추가 예정.
import { use, useEffect, useState } from "react";
import { fetchContent } from "@/src/lib/contents";
import type { Content } from "@/src/lib/contentTypes";
import { TournamentTemplate } from "@/src/templates/TournamentTemplate";

export default function ContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [content, setContent] = useState<Content | null | "loading">("loading");

  useEffect(() => {
    fetchContent(id).then((c) => setContent(c));
  }, [id]);

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
  switch (content.type) {
    case "tournament":
      return <TournamentTemplate content={content} />;
    // versus/poll/ranking 타입은 추후 구현
    default:
      return (
        <div className="max-w-xl mx-auto px-4 py-12 text-center">
          <p style={{ color: "var(--fg)" }}>
            Content type &quot;{content.type}&quot; is not yet supported.
          </p>
        </div>
      );
  }
}
