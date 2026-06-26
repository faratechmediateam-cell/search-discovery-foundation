/**
 * Phase 9 validator — Internationalization Hardening.
 *
 * Verifies the invariants introduced by Phase 9 without touching DB state.
 *
 *   bun run scripts/validate-phase9.ts
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  LANGS,
  DEFAULT_LANG,
  isLang,
  dirOf,
  localeTag,
  t,
  pickLocalized,
  formatNumber,
  formatDate,
  toLocalDigits,
  htmlLangDirScript,
  T,
} from "../src/lib/i18n";

type Check = { name: string; ok: boolean; detail?: string };
const checks: Check[] = [];
const record = (name: string, ok: boolean, detail?: string) =>
  checks.push({ name, ok, detail });

// ---------- 1. i18n module surface ----------
record("Lang set covers en/fa/ar", LANGS.length === 3 && LANGS.includes("fa") && LANGS.includes("en") && LANGS.includes("ar"));
record("DEFAULT_LANG is fa (canonical)", DEFAULT_LANG === "fa");
record("isLang accepts en/fa/ar and rejects others", isLang("fa") && isLang("en") && isLang("ar") && !isLang("de") && !isLang(undefined));
record("dirOf maps fa/ar to rtl, en to ltr", dirOf("fa") === "rtl" && dirOf("ar") === "rtl" && dirOf("en") === "ltr");
record("localeTag returns BCP-47 tags", localeTag("fa") === "fa-IR" && localeTag("en") === "en-US" && localeTag("ar") === "ar-SA");

// ---------- 2. t() fa-canonical fallback ----------
record(
  "t() falls back to fa before en when lang missing",
  t({ fa: "سلام", en: "hello" }, "ar") === "سلام",
);
record(
  "t() returns en when fa missing",
  t({ en: "hello" } as Parameters<typeof t>[0], "ar") === "hello",
);
record("t() returns empty string for empty dict", t({}, "fa") === "");

// ---------- 3. pickLocalized for DB fields ----------
record(
  "pickLocalized returns fa when ar absent",
  pickLocalized({ fa: "س", en: "x" }, "ar") === "س",
);
record(
  "pickLocalized prefers requested when present",
  pickLocalized({ fa: "س", en: "x" }, "en") === "x",
);
record("pickLocalized handles null", pickLocalized(null, "fa") === undefined);

// ---------- 4. Number / date / digit helpers ----------
{
  const faNum = formatNumber(1234, "fa");
  record("formatNumber(fa) emits Persian digits", /[۰-۹]/.test(faNum));
  const enNum = formatNumber(1234, "en");
  record("formatNumber(en) emits ASCII digits", /1,?234/.test(enNum));
}
{
  const d = new Date("2026-06-26T00:00:00Z");
  const enDate = formatDate(d, "en");
  record("formatDate(en) renders a string", typeof enDate === "string" && enDate.length > 0);
  record("formatDate handles invalid input", formatDate("not-a-date", "fa") === "");
}
record("toLocalDigits(fa) maps ASCII digits", toLocalDigits("Room 12", "fa") === "Room ۱۲");
record("toLocalDigits(ar) maps ASCII digits", toLocalDigits("12", "ar") === "١٢");
record("toLocalDigits(en) is identity for ASCII", toLocalDigits("12", "en") === "12");

// ---------- 5. SSR-safe html lang/dir script ----------
{
  const script = htmlLangDirScript("fa");
  record(
    "htmlLangDirScript embeds requested lang/dir",
    script.includes('"fa"') && script.includes('"rtl"'),
  );
  record(
    "htmlLangDirScript is a self-invoking IIFE",
    script.startsWith("(function(){") && script.endsWith("})();"),
  );
}

// ---------- 6. UI dictionary completeness (fa is required everywhere) ----------
{
  const missingFa = Object.entries(T).filter(
    ([, d]) => typeof (d as Record<string, unknown>).fa !== "string" || !(d as { fa: string }).fa,
  );
  record(
    "every entry in T has a non-empty fa value",
    missingFa.length === 0,
    missingFa.length ? `missing fa: ${missingFa.map(([k]) => k).join(", ")}` : undefined,
  );
}

// ---------- 7. $lang route head sets html.lang/dir for SSR ----------
{
  const src = readFileSync(resolve("src/routes/$lang.tsx"), "utf8");
  record(
    "$lang route imports htmlLangDirScript",
    src.includes("htmlLangDirScript"),
  );
  record(
    "$lang route head emits the inline lang/dir script",
    /head:\s*\(\s*\{\s*params\s*\}\s*\)\s*=>/.test(src) && src.includes("htmlLangDirScript("),
  );
}

// ---------- 8. seo.ts delegates to canonical pickLocalized ----------
{
  const src = readFileSync(resolve("src/lib/seo.ts"), "utf8");
  record(
    "seo.ts imports pickLocalized from ./i18n",
    /from\s+"\.\/i18n"/.test(src) && src.includes("pickLocalized"),
  );
  record(
    "seo.ts no longer redeclares pickLocalized locally",
    !/const\s+pickLocalized\s*=/.test(src) && !/function\s+pickLocalized\s*\(/.test(src),
  );
}

// ---------- 9. Hreflang + canonical wiring on public routes ----------
for (const f of [
  "src/routes/$lang.index.tsx",
  "src/routes/$lang.products.index.tsx",
  "src/routes/$lang.products.$category.index.tsx",
  "src/routes/$lang.products.$category.$product.tsx",
]) {
  const path = resolve(f);
  if (!existsSync(path)) {
    record(`route present: ${f}`, false);
    continue;
  }
  const src = readFileSync(path, "utf8");
  record(`${f} uses buildLocaleMeta (hreflang + canonical)`, src.includes("buildLocaleMeta"));
}

// ---------- 10. Public-facing routes scoped under /$lang ----------
{
  const indexSrc = readFileSync(resolve("src/routes/index.tsx"), "utf8");
  record(
    "root / redirects to default locale (fa)",
    indexSrc.includes("redirect") && indexSrc.includes('lang: "fa"'),
  );
}

// ---------- Report ----------
let failed = 0;
for (const c of checks) {
  const status = c.ok ? "✅" : "❌";
  console.log(`${status} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
  if (!c.ok) failed++;
}
console.log(`\n${checks.length - failed}/${checks.length} checks passed.`);
process.exit(failed === 0 ? 0 : 1);
