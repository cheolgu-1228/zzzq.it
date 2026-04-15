import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ADSENSE_CLIENT, ADSENSE_ENABLED } from "@/src/lib/ads";
import {
  Geist,
  Geist_Mono,
  Noto_Sans,
  Noto_Sans_KR,
  Noto_Sans_JP,
  Noto_Sans_SC,
  Noto_Sans_Arabic,
  Noto_Sans_Devanagari,
  Noto_Sans_Bengali,
  Noto_Sans_Thai,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/src/components/ThemeProvider";
import { ThemeScript } from "@/src/components/ThemeScript";
import { LocaleProvider } from "@/src/components/LocaleProvider";
import { Header } from "@/src/components/Header";

// 라틴(en/es/pt/fr/de/it/nl/id/vi/tr/pl) 기본 폰트
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Noto Sans 보편 폰트 — 키릴(ru), 그리스, 확장 라틴 커버용
const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

// CJK 폰트 — 언어별 전용 Noto Sans
const notoKR = Noto_Sans_KR({
  variable: "--font-noto-kr",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

const notoJP = Noto_Sans_JP({
  variable: "--font-noto-jp",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

const notoSC = Noto_Sans_SC({
  variable: "--font-noto-sc",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

// 스크립트별 Noto — 아랍어(ar), 힌디/데바나가리(hi), 벵골어(bn), 태국어(th)
const notoAR = Noto_Sans_Arabic({
  variable: "--font-noto-ar",
  weight: ["400", "500", "700", "900"],
  subsets: ["arabic"],
  display: "swap",
});

const notoDV = Noto_Sans_Devanagari({
  variable: "--font-noto-dv",
  weight: ["400", "500", "700", "900"],
  subsets: ["devanagari", "latin"],
  display: "swap",
});

const notoBN = Noto_Sans_Bengali({
  variable: "--font-noto-bn",
  weight: ["400", "500", "700", "900"],
  subsets: ["bengali", "latin"],
  display: "swap",
});

const notoTH = Noto_Sans_Thai({
  variable: "--font-noto-th",
  weight: ["400", "500", "700", "900"],
  subsets: ["thai", "latin"],
  display: "swap",
});

// 모든 폰트 변수 모음 (html className에 일괄 주입)
const fontVars = [
  geistSans.variable,
  geistMono.variable,
  notoSans.variable,
  notoKR.variable,
  notoJP.variable,
  notoSC.variable,
  notoAR.variable,
  notoDV.variable,
  notoBN.variable,
  notoTH.variable,
].join(" ");

export const metadata: Metadata = {
  title: "zzzQ.it — Pick, vote, see the world",
  description:
    "Global opinion tournaments. Pick your favorite, compare with the world.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontVars} antialiased`}
      style={{ height: "100%" }}
    >
      <head>
        <ThemeScript />
        {/* Google AdSense — 프로덕션 환경에서만 로드 */}
        {ADSENSE_ENABLED && (
          <Script
            id="adsense-script"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      {/*
        뷰포트 고정 레이아웃:
        - body: 정확히 뷰포트 높이 (h-dvh) + 외부 스크롤 차단
        - header/footer: 고정 높이
        - main: flex-1 min-h-0 overflow-y-auto → 내용이 길면 main 내부에서만 스크롤
        - contents 페이지는 h-full로 viewport에 딱 맞춰서 스크롤 없이 표시
        - home/tournament/results 페이지는 높이가 길어지면 main 내부 스크롤
      */}
      <body
        className="flex flex-col overflow-hidden"
        style={{ height: "100dvh" }}
      >
        <ThemeProvider>
          <LocaleProvider>
            <Header />
            <main className="flex-1 min-h-0 w-full overflow-y-auto">
              {children}
            </main>
            <footer
              className="w-full py-2 text-center text-[11px] tracking-wide shrink-0"
              style={{
                color: "var(--fg-muted)",
                borderTop: "1px solid var(--card-border)",
              }}
            >
              ⓒ 2021. zzzQ All rights reserved.
            </footer>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
