// 컨텐츠 메타데이터(title/description) AI 번역 스크립트
// - 입력: scripts/content-rewrites.json (en 원본만 담긴 객체)
// - 출력: scripts/content-translations.json (19개 로케일 전부 채워진 객체)
// - 별도로 SQL UPDATE 문도 stdout에 출력
//
// 사용법:
//   node --env-file=.env.local scripts/translate-content.mjs
//
// 톤 가이드: hooky / punchy / 자극적 / 짧은 카피. Buzzfeed 스타일.

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY missing");
  process.exit(1);
}

const SCRIPTS_DIR = path.join(process.cwd(), "scripts");
const INPUT = path.join(SCRIPTS_DIR, "content-rewrites.json");
const OUTPUT = path.join(SCRIPTS_DIR, "content-translations.json");

const LOCALES = {
  ko: "Korean (한국어)",
  ja: "Japanese (日本語)",
  zh: "Simplified Chinese (简体中文)",
  es: "Spanish (Español neutral)",
  pt: "Portuguese (Português brasileiro)",
  fr: "French (Français)",
  de: "German (Deutsch)",
  ru: "Russian (Русский)",
  hi: "Hindi (हिन्दी)",
  ar: "Arabic (العربية الفصحى الحديثة)",
  id: "Indonesian (Bahasa Indonesia)",
  vi: "Vietnamese (Tiếng Việt)",
  tr: "Turkish (Türkçe)",
  th: "Thai (ไทย)",
  it: "Italian (Italiano)",
  pl: "Polish (Polski)",
  nl: "Dutch (Nederlands)",
  bn: "Bengali (বাংলা)",
};

const SYSTEM_PROMPT = `You are writing punchy, clickbait-style copy for a global polling/tournament web app called "zzzQ.it".

STYLE RULES — these are critical:
- Hooky. Punchy. Buzzfeed-level attention-grabbing.
- MUCH shorter than typical translations. Fewer words = better.
- Create curiosity, urgency, FOMO. Make users NEED to click.
- Idiomatic native voice. Never translate literally.
- Single-sentence descriptions. Prefer 3-6 words in target language.
- Titles should be 2-5 words.
- Use native-sounding exclamations, questions, or commands where natural.
- Match the casual, fun, slightly edgy tone of the English source.

Hard constraints:
- Keep brand name "zzzQ.it" unchanged if it appears
- Output MUST be valid JSON matching input structure exactly
- Each content object must have {title: string, description: string}`;

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

async function translateBatch(model, localeCode, languageName, enSource) {
  // enSource is { "content-id": { en: {title, description} } }
  // We send en-only payload to Gemini and ask for translated versions in target locale
  const flatInput = Object.fromEntries(
    Object.entries(enSource).map(([id, v]) => [id, v.en]),
  );
  const userPrompt = `Target language: ${languageName}
Locale code: ${localeCode}

Rewrite each of these content titles and descriptions in ${languageName}. Apply the STYLE RULES — make them punchier, shorter, more hooky in the target language. Don't translate literally.

Input (English source):
${JSON.stringify(flatInput, null, 2)}

Return the same JSON structure with all values rewritten in ${languageName}. Output only valid JSON, no markdown fences, no explanation.`;

  const result = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + userPrompt }] },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.8,
      maxOutputTokens: 4096,
    },
  });
  const raw = result.response.text();
  return JSON.parse(extractFirstJson(raw));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const source = JSON.parse(await fs.readFile(INPUT, "utf8"));
  const contentIds = Object.keys(source);
  console.log(`📄 loaded ${contentIds.length} contents from ${INPUT}`);

  const MODEL_NAME = process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite";
  const ai = new GoogleGenerativeAI(API_KEY);
  const model = ai.getGenerativeModel({ model: MODEL_NAME });
  console.log(`🤖 model: ${MODEL_NAME}`);

  // 결과 축적 — 각 contentId에 대해 19개 로케일 전부 채움
  const output = {};
  for (const id of contentIds) {
    output[id] = { en: source[id].en };
  }

  const localeCodes = Object.keys(LOCALES);
  for (let i = 0; i < localeCodes.length; i++) {
    const locale = localeCodes[i];
    console.log(`[${i + 1}/${localeCodes.length}] → ${locale}...`);
    try {
      const translated = await translateBatch(model, locale, LOCALES[locale], source);
      // merge into output
      for (const id of contentIds) {
        if (translated[id]) {
          output[id][locale] = translated[id];
        }
      }
      console.log(`   ✓ ${Object.keys(translated).length} contents translated`);
    } catch (e) {
      console.error(`   ✗ ${locale} failed: ${e.message}`);
    }
    if (i < localeCodes.length - 1) await sleep(4100);
  }

  await fs.writeFile(OUTPUT, JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(`\n✅ wrote ${OUTPUT}`);
  console.log(`   ${contentIds.length} contents × 19 locales`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
