// 컨텐츠 데이터 접근 계층
// - Supabase의 contents / contents_list에서 읽음
// - 정적 하드코딩은 전부 제거됨 (v260415.02부터 DB 기반)
import { getSupabase } from "./supabase";
import type { Content, ContentListRow } from "./contentTypes";

// 모든 공개 컨텐츠 (참여자 수 포함) — 리스트 페이지용
export async function fetchContentsList(): Promise<ContentListRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("contents_list")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[contents] fetchContentsList", error);
    return [];
  }
  return (data ?? []) as ContentListRow[];
}

// 단일 컨텐츠 (참여/결과 페이지용)
// contents 원본 테이블에서 가져옴. 참여자 수는 별도 쿼리로 가져올 수 있음
export async function fetchContent(id: string): Promise<Content | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("[contents] fetchContent", error);
    return null;
  }
  return (data as Content) ?? null;
}

// 단일 컨텐츠 + 참여자 수 (결과 페이지 게이팅에 사용)
export async function fetchContentWithStats(
  id: string,
): Promise<ContentListRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("contents_list")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[contents] fetchContentWithStats", error);
    return null;
  }
  return (data as ContentListRow) ?? null;
}
