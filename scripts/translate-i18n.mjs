// i18n UI 문자열 AI 번역 스크립트
// - src/lib/messages/en.json을 source of truth로 읽어서
// - Gemini API로 18개 로케일에 대해 자연스러운 의역 생성
// - src/lib/messages/{locale}.json 에 저장
//
// 사용법:
//   node --env-file=.env.local scripts/translate-i18n.mjs
//
// 환경변수:
//   GEMINI_API_KEY — Google AI Studio에서 발급
//
// rate limit:
//   Gemini 2.0 Flash 무료 티어 = 15 RPM → 요청 사이 4.1초 sleep

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error(
    "❌ GEMINI_API_KEY 환경변수가 없습니다. .env.local에 추가하고 --env-file=.env.local 옵션으로 실행하세요.",
  );
  process.exit(1);
}

const MESSAGES_DIR = path.join(process.cwd(), "src/lib/messages");

// locale code → 자연어 이름 + 스타일 힌트
const LOCALES = {
  ko: "Korean (한국어, 친근한 반말 톤이 아닌 가벼운 존댓말 또는 캐주얼)",
  ja: "Japanese (日本語, カジュアルでフレンドリーな文体)",
  zh: "Simplified Chinese (简体中文, 口语化、年轻化)",
  es: "Spanish (Español neutral latino, tono juguetón)",
  pt: "Portuguese (Português, preferência brasileiro, tom casual)",
  fr: "French (Français, ton décontracté, vouvoiement léger)",
  de: "German (Deutsch, lockerer Ton, kein Sie)",
  ru: "Russian (Русский, дружелюбный разговорный стиль)",
  hi: "Hindi (हिन्दी, युवा और मज़ेदार)",
  ar: "Arabic (العربية الفصحى الحديثة, نبرة ودية)",
  id: "Indonesian (Bahasa Indonesia, santai dan fun)",
  vi: "Vietnamese (Tiếng Việt, vui nhộn, gần gũi)",
  tr: "Turkish (Türkçe, samimi ve eğlenceli)",
  th: "Thai (ไทย, เป็นกันเอง สนุก)",
  it: "Italian (Italiano, colloquiale e divertente)",
  pl: "Polish (Polski, luźny i przyjazny)",
  nl: "Dutch (Nederlands, informeel en speels)",
  bn: "Bengali (বাংলা, তরুণ এবং মজাদার)",
};

const SYSTEM_PROMPT = `You are localizing a casual, fun global polling/tournament web app called "zzzQ.it".

CORE PRINCIPLE: Never translate word-for-word. Produce idiomatic, natural phrasing that a native speaker would actually use. Think like a Buzzfeed or casual quiz app copywriter.

Tone: playful, concise, friendly. Short and punchy. This is a consumer app for entertainment.

Hard constraints:
- Keep brand name "zzzQ.it" EXACTLY as is (do not transliterate or translate)
- Keep emojis and punctuation style consistent with the source
- Preserve placeholder examples like "e.g. zzzQ" but adapt "e.g." to natural usage in target locale (예:, 例:, ej., etc.)
- Output MUST be valid JSON matching the input structure EXACTLY (same keys, same nesting)
- All leaf values must be strings
- Keep button/label text SHORT — these render in small mobile UI spaces; avoid long phrasings
- Avoid overly formal/literary register unless the language culturally requires it
- For UI labels that are single English words (e.g. "Match", "Final", "Winner"), use the most natural short equivalent, not the dictionary translation`;

function userPrompt(localeCode, languageName, source) {
  return `Target language: ${languageName}
Locale code: ${localeCode}

Source JSON (English, this is the single source of truth):
${JSON.stringify(source, null, 2)}

Return the SAME JSON structure with all string values translated into ${languageName}. Output only valid JSON, no markdown code fences, no explanation.`;
}

// 모델이 가끔 첫 JSON 오브젝트 뒤에 덤으로 텍스트를 붙여서 parse 실패 → 첫 {..} 블록만 추출
function extractFirstJson(text) {
  const firstBrace = text.indexOf("{");
  if (firstBrace < 0) return text;
  let depth = 0;
  for (let i = firstBrace; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return text.slice(firstBrace, i + 1);
    }
  }
  return text.slice(firstBrace);
}

async function translateLocale(model, localeCode, languageName, source) {
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT + "\n\n" + userPrompt(localeCode, languageName, source) }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.5,
      maxOutputTokens: 4096,
    },
  });
  const raw = result.response.text();
  const cleaned = extractFirstJson(raw);
  return JSON.parse(cleaned);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const enPath = path.join(MESSAGES_DIR, "en.json");
  const source = JSON.parse(await fs.readFile(enPath, "utf8"));
  console.log(`📄 source loaded: ${enPath}`);

  // gemini-2.0-flash 대신 1.5-flash 사용 (free tier 안정적)
  const MODEL_NAME = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
  const ai = new GoogleGenerativeAI(API_KEY);
  const model = ai.getGenerativeModel({ model: MODEL_NAME });
  console.log(`🤖 model: ${MODEL_NAME}`);

  await fs.mkdir(MESSAGES_DIR, { recursive: true });

  const codes = Object.keys(LOCALES);
  const failed = [];
  for (let i = 0; i < codes.length; i++) {
    const locale = codes[i];
    const languageName = LOCALES[locale];
    const idx = `[${i + 1}/${codes.length}]`;
    console.log(`${idx} → ${locale} (${languageName.split(" ")[0]})...`);
    try {
      const translated = await translateLocale(model, locale, languageName, source);
      const outPath = path.join(MESSAGES_DIR, `${locale}.json`);
      await fs.writeFile(outPath, JSON.stringify(translated, null, 2) + "\n", "utf8");
      console.log(`   ✓ wrote ${path.relative(process.cwd(), outPath)}`);
    } catch (e) {
      console.error(`   ✗ failed: ${e.message}`);
      failed.push(locale);
    }
    if (i < codes.length - 1) {
      await sleep(4100); // 15 RPM rate limit
    }
  }

  console.log("");
  if (failed.length === 0) {
    console.log("✅ All locales translated successfully");
  } else {
    console.log(`⚠️  ${failed.length} locale(s) failed: ${failed.join(", ")}`);
    console.log("   Re-run the script to retry failed locales");
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
