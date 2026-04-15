// content-translations.json → SQL UPDATE 문 생성
import fs from "node:fs/promises";

const d = JSON.parse(await fs.readFile("scripts/content-translations.json", "utf8"));
const stmts = [];
for (const [id, translations] of Object.entries(d)) {
  const json = JSON.stringify(translations);
  stmts.push(
    `update public.contents set translations = $cj$${json}$cj$::jsonb, updated_at = now() where id = '${id}';`,
  );
}
await fs.writeFile(
  "scripts/apply-content-translations.sql",
  stmts.join("\n") + "\n",
  "utf8",
);
console.log(`✓ wrote ${stmts.length} UPDATE statements`);
