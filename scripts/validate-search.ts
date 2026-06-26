/**
 * Release 1.1 — Search & Discovery validator.
 *
 *   bun run scripts/validate-search.ts
 *
 * Verifies invariants introduced by FEATURE-0002 / RFC-0001:
 *   - Repository exposes a `search()` method using the Supabase FTS column.
 *   - Service exposes `search()` and delegates to the repository.
 *   - Server function `searchProducts` is created with Zod validation.
 *   - Route `$lang.search.tsx` exists, is `noindex`, and uses the server fn.
 *   - DTOs `SearchProductsQuery` / `SearchProductsResultDto` are exported.
 *   - Localization keys exist in all three locales (fa / en / ar).
 *   - Layered architecture is respected: the route does NOT import the
 *     repository or service directly.
 *   - The FTS migration is present.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

type Check = { name: string; ok: boolean; detail?: string };
const checks: Check[] = [];
const record = (name: string, ok: boolean, detail?: string) =>
  checks.push({ name, ok, detail });

const read = (p: string) => readFileSync(resolve(p), "utf8");

// ---------- 1. DTOs ----------
const dtoSrc = read("src/lib/modules/products/product.dto.ts");
record(
  "DTO exports SearchProductsQuery",
  /export interface SearchProductsQuery\b/.test(dtoSrc),
);
record(
  "DTO exports SearchProductsResultDto",
  /export interface SearchProductsResultDto\b/.test(dtoSrc),
);
record(
  "SearchProductsQuery requires `q: string`",
  /SearchProductsQuery[\s\S]*?\bq:\s*string/.test(dtoSrc),
);

// ---------- 2. Repository ----------
const repoSrc = read("src/lib/modules/products/product.repository.ts");
record(
  "Repository imports SearchProductsQuery",
  /SearchProductsQuery/.test(repoSrc),
);
record(
  "Repository defines async search()",
  /async\s+search\s*\(/.test(repoSrc),
);
record(
  "Repository search() uses the FTS column",
  /textSearch\(\s*"search_tsv"/.test(repoSrc),
);
record(
  "Repository search() uses the 'simple' tsvector config",
  /config:\s*"simple"/.test(repoSrc),
);

// ---------- 3. Service ----------
const svcSrc = read("src/lib/modules/products/product.service.ts");
record(
  "Service defines async search()",
  /async\s+search\s*\(/.test(svcSrc),
);
record(
  "Service.search delegates to repo.search",
  /this\.repo\.search\(/.test(svcSrc),
);
record(
  "Service imports SearchProductsQuery/Result types",
  /SearchProductsQuery/.test(svcSrc) && /SearchProductsResultDto/.test(svcSrc),
);

// ---------- 4. Server function ----------
const fnSrc = read("src/lib/modules/products/product.functions.ts");
record(
  "Server function `searchProducts` is exported",
  /export const searchProducts\s*=\s*createServerFn/.test(fnSrc),
);
record(
  "Server function validates input with Zod",
  /SearchSchema\s*=\s*z\.object/.test(fnSrc) &&
    /\.inputValidator\([\s\S]*?SearchSchema/.test(fnSrc),
);
record(
  "Server function delegates to ProductService.search",
  /service\.search\(/.test(fnSrc),
);

// ---------- 5. Route ----------
const routePath = "src/routes/$lang.search.tsx";
record("Search route file exists", existsSync(routePath));
const routeSrc = existsSync(routePath) ? read(routePath) : "";
record(
  "Route imports the searchProducts server function",
  /from\s+"@\/lib\/modules\/products\/product\.functions"/.test(routeSrc) &&
    /\bsearchProducts\b/.test(routeSrc),
);
record(
  "Route validates ?q= search param via Zod",
  /validateSearch/.test(routeSrc) && /SearchSchema/.test(routeSrc),
);
record(
  "Route is marked robots=noindex (SEO step 6)",
  /content:\s*"noindex,nofollow"/.test(routeSrc),
);
record(
  "Route renders a localized search input (placeholder uses T.searchPlaceholder)",
  /T\.searchPlaceholder/.test(routeSrc),
);
record(
  "Route renders loading / empty / no-results states",
  /T\.searching/.test(routeSrc) &&
    /T\.searchEmptyState/.test(routeSrc) &&
    /T\.searchNoResults/.test(routeSrc),
);

// ---------- 6. Architectural compliance ----------
record(
  "Route does NOT import the repository (layered architecture)",
  !/product\.repository/.test(routeSrc),
);
record(
  "Route does NOT import the service directly (layered architecture)",
  !/product\.service/.test(routeSrc),
);
record(
  "Route does NOT import Supabase clients directly",
  !/supabase/i.test(routeSrc) ||
    !/from\s+["'][^"']*supabase[^"']*["']/.test(routeSrc),
);

// ---------- 7. Localization ----------
const i18nSrc = read("src/lib/i18n.ts");
for (const key of [
  "search",
  "searchPlaceholder",
  "searchSubmit",
  "searching",
  "searchResultsFor",
  "searchResultsCount",
  "searchNoResults",
  "searchEmptyState",
]) {
  const re = new RegExp(
    `\\b${key}\\b:\\s*\\{[^}]*\\ben:[^}]*\\bfa:[^}]*\\bar:|\\b${key}\\b:\\s*\\{[^}]*\\bfa:[^}]*\\ben:[^}]*\\bar:`,
  );
  record(`i18n key "${key}" defined with en/fa/ar`, re.test(i18nSrc));
}

// ---------- 8. Migration ----------
const migrationsDir = "supabase/migrations";
let hasFtsMigration = false;
if (existsSync(migrationsDir)) {
  for (const f of readdirSync(migrationsDir)) {
    const src = read(`${migrationsDir}/${f}`);
    if (
      /search_tsv\s+tsvector/.test(src) &&
      /to_tsvector\(\s*'simple'/.test(src) &&
      /products_search_tsv_idx/.test(src)
    ) {
      hasFtsMigration = true;
      break;
    }
  }
}
record(
  "FTS migration (search_tsv column + GIN index) exists",
  hasFtsMigration,
);

// ---------- Report ----------
let failed = 0;
for (const c of checks) {
  const tag = c.ok ? "  ok  " : " FAIL ";
  // eslint-disable-next-line no-console
  console.log(`[${tag}] ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
  if (!c.ok) failed++;
}
const total = checks.length;
// eslint-disable-next-line no-console
console.log(`\nRelease 1.1: ${total - failed}/${total} checks passed.`);
if (failed > 0) process.exit(1);
