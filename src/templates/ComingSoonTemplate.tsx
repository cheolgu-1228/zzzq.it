"use client";

// 아직 디벨롭 전인 템플릿 — 공통 "준비중" 페이지
// 8가지 컨텐츠 타입 중 tournament 외 7개는 전부 이 화면으로 보낸다.
// 나중에 각 타입을 풀 구현으로 교체할 때 이 컴포넌트 참조만 해제하면 됨.
import Link from "next/link";
import { useLocale } from "@/src/components/LocaleProvider";
import {
  contentDescription,
  contentTitle,
  type Content,
} from "@/src/lib/contentTypes";

// "준비중" 문구 — 짧은 라벨이라 별도 번역 파일 없이 인라인 매핑
const COMING_SOON_TITLE: Record<string, string> = {
  en: "Coming Soon",
  ko: "준비중",
  ja: "準備中",
  zh: "即将推出",
  es: "Próximamente",
  pt: "Em breve",
  fr: "Bientôt disponible",
  de: "Demnächst",
  ru: "Скоро",
  hi: "जल्द आ रहा है",
  ar: "قريباً",
  id: "Segera hadir",
  vi: "Sắp ra mắt",
  tr: "Yakında",
  th: "เร็ว ๆ นี้",
  it: "In arrivo",
  pl: "Wkrótce",
  nl: "Binnenkort",
  bn: "শীঘ্রই আসছে",
};

const COMING_SOON_BODY: Record<string, string> = {
  en: "We are crafting this content type. Check back soon!",
  ko: "이 컨텐츠 타입은 아직 준비중이에요. 곧 만나요!",
  ja: "このコンテンツタイプは現在準備中です。近日公開!",
  zh: "这个内容类型正在开发中,敬请期待!",
  es: "Estamos preparando este tipo de contenido. ¡Vuelve pronto!",
  pt: "Estamos preparando este tipo de conteúdo. Volte em breve!",
  fr: "Nous préparons ce type de contenu. Revenez bientôt !",
  de: "Wir arbeiten an diesem Inhaltstyp. Bald verfügbar!",
  ru: "Этот тип контента в разработке. Скоро появится!",
  hi: "हम यह कंटेंट तैयार कर रहे हैं। जल्द मिलते हैं!",
  ar: "نعمل على إعداد هذا النوع من المحتوى. عد قريباً!",
  id: "Kami sedang menyiapkan konten ini. Nantikan ya!",
  vi: "Chúng tôi đang chuẩn bị nội dung này. Hẹn gặp lại!",
  tr: "Bu içerik türü hazırlanıyor. Yakında görüşürüz!",
  th: "เรากำลังเตรียมเนื้อหาประเภทนี้อยู่ เจอกันเร็ว ๆ นี้!",
  it: "Stiamo preparando questo tipo di contenuto. A presto!",
  pl: "Przygotowujemy ten rodzaj treści. Zaraz wracamy!",
  nl: "We werken aan dit contenttype. Tot snel!",
  bn: "আমরা এই কন্টেন্ট তৈরি করছি। শীঘ্রই দেখা হবে!",
};

const BACK_LABEL: Record<string, string> = {
  en: "Back to contents",
  ko: "컨텐츠로 돌아가기",
  ja: "コンテンツ一覧へ",
  zh: "返回内容列表",
  es: "Volver a contenidos",
  pt: "Voltar ao conteúdo",
  fr: "Retour aux contenus",
  de: "Zurück zu Inhalten",
  ru: "Назад к контенту",
  hi: "कंटेंट पर वापस",
  ar: "العودة إلى المحتوى",
  id: "Kembali ke konten",
  vi: "Quay lại nội dung",
  tr: "İçeriklere dön",
  th: "กลับไปที่คอนเทนต์",
  it: "Torna ai contenuti",
  pl: "Powrót do treści",
  nl: "Terug naar content",
  bn: "কন্টেন্টে ফিরে যান",
};

export function ComingSoonTemplate({ content }: { content: Content }) {
  const { locale } = useLocale();

  return (
    <div className="max-w-xl mx-auto px-4 py-10 sm:py-16 flex flex-col items-center text-center gap-5">
      {/* 공사 중 이모지 큰거 */}
      <div className="text-6xl sm:text-7xl zq-animate-slide" aria-hidden>
        🚧
      </div>

      {/* "준비중" 타이틀 */}
      <h1
        className="text-3xl sm:text-4xl font-black tracking-tight"
        style={{ color: "var(--fg)" }}
      >
        {COMING_SOON_TITLE[locale] ?? COMING_SOON_TITLE.en}
      </h1>

      {/* 어떤 컨텐츠였는지 */}
      <div
        className="flex flex-col gap-1.5 px-5 py-4 w-full max-w-sm"
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--accent)" }}
        >
          {content.emoji ?? "🎯"} {content.type.replace(/_/g, " ")}
        </span>
        <p
          className="text-base font-bold"
          style={{ color: "var(--fg)" }}
        >
          {contentTitle(content, locale)}
        </p>
        <p
          className="text-xs"
          style={{ color: "var(--fg-muted)" }}
        >
          {contentDescription(content, locale)}
        </p>
      </div>

      <p
        className="text-sm max-w-xs"
        style={{ color: "var(--fg-muted)" }}
      >
        {COMING_SOON_BODY[locale] ?? COMING_SOON_BODY.en}
      </p>

      <Link
        href="/contents"
        className="mt-2 h-11 px-5 inline-flex items-center justify-center font-bold text-sm"
        style={{
          background: "var(--accent)",
          color: "#fff",
          borderRadius: "var(--radius-sm)",
          boxShadow: "var(--shadow)",
        }}
      >
        ← {BACK_LABEL[locale] ?? BACK_LABEL.en}
      </Link>
    </div>
  );
}
