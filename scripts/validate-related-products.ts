/**
 * Release 1.3 — Related Products validator (FEATURE-0004 / RFC-0003 / ADR-0001).
 *
 * Static, dependency-free invariant check. Every assertion maps to one
 * of the Definition-of-Done items in the release brief: repository,
 * service, server-function and route wiring; DTO integrity;
 * localization; architecture preservation; and backward compatibility.
 *
 *   bun run scripts/validate-related-products.ts
 */
import { readFileSync } from "node:fs";

const checks: Array<{ name: string; pass: boolean; detail?: string }> = [];

function read(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch (e) {
    return `__MISSING__:${(e as Error).message}`;
  }
}
function check(name: string, pass: boolean, detail?: string) {
  checks.push({ name, pass, detail });
}
function has(src: string, needle: string | RegExp): boolean {
  return typeof needle === "string" ? src.includes(needle) : needle.test(src);
}

const dto = read("src/lib/modules/products/product.dto.ts");
const repo = read("src/lib/modules/products/product.repository.ts");
const service = read("src/lib/modules/products/product.service.ts");
const fns = read("src/lib/modules/products/product.functions.ts");
const route = read("src/routes/$lang.products.$category.$product.tsx");
const ui = read("src/components/faratech/related-products.tsx");
const i18n = read("src/lib/i18n.ts");

// ── DTO integrity ──────────────────────────────────────────────────
check("DTO: RelatedProductsQuery exported", has(dto, "RelatedProductsQuery"));
check("DTO: RelatedProductsResultDto exported", has(dto, "RelatedProductsResultDto"));
check("DTO: query has productId field", has(dto, /productId:\s*string/));
check("DTO: query has categoryKey field", has(dto, /categoryKey:\s*ProductCategoryKey/));
check("DTO: query has optional limit", has(dto, /limit\?:\s*number/));
check("DTO: result reuses ProductSummaryDto", has(dto, "items: ProductSummaryDto[]"));

// ── Repository wiring ──────────────────────────────────────────────
check("Repo: imports RelatedProductsQuery", has(repo, "RelatedProductsQuery"));
check("Repo: findRelated method exists", has(repo, /async findRelated\(/));
check("Repo: excludes current product (neq id)", has(repo, /\.neq\("id",\s*query\.productId\)/));
check("Repo: filters same category", has(repo, /\.eq\("category_key",\s*query\.categoryKey\)/));
check("Repo: deterministic ordering by updated_at", has(repo, /\.order\("updated_at"/));
check("Repo: applies a limit", has(repo, /\.limit\(/));
check("Repo: reuses SUMMARY_SELECT projection", has(repo, /SUMMARY_SELECT/));

// ── Service wiring ─────────────────────────────────────────────────
check("Service: imports related types", has(service, "RelatedProductsQuery"));
check("Service: getRelated method exists", has(service, /async getRelated\(/));
check("Service: delegates to repo.findRelated", has(service, "this.repo.findRelated"));
check("Service: maps rows through mapProductSummary", has(service, "rows.map(mapProductSummary)"));

// ── Server Function wiring ─────────────────────────────────────────
check("Fn: RelatedSchema defined", has(fns, "RelatedSchema"));
check("Fn: RelatedSchema uses uuid productId", has(fns, /productId:\s*z\.string\(\)\.uuid\(\)/));
check("Fn: RelatedSchema bounds limit", has(fns, /limit:\s*z\.number\(\)\.int\(\)\.min\(1\)\.max\(24\)/));
check("Fn: getRelatedProducts exported", has(fns, "export const getRelatedProducts"));
check("Fn: handler calls service.getRelated", has(fns, "service.getRelated(data)"));
check("Fn: GET method (cacheable)", has(fns, /createServerFn\(\{\s*method:\s*"GET"\s*\}\)/));

// ── Route integration ──────────────────────────────────────────────
check("Route: imports getRelatedProducts", has(route, "getRelatedProducts"));
check("Route: imports RelatedProducts component", has(route, '"@/components/faratech/related-products"'));
check("Route: fetches related in loader", has(route, /getRelatedProducts\(\{\s*data:/));
check("Route: passes relatedItems via loader return", has(route, "relatedItems: related.items"));
check("Route: renders RelatedProducts component", has(route, "<RelatedProducts"));

// ── UI / localization / accessibility ──────────────────────────────
check("UI: section element with aria-labelledby", has(ui, 'aria-labelledby="related-products-heading"'));
check("UI: heading id matches aria-labelledby", has(ui, 'id="related-products-heading"'));
check("UI: returns null when items are empty", has(ui, /items\.length === 0\) return null/));
check("UI: supports loading skeleton", has(ui, "loading?: boolean") && has(ui, "Skeleton"));
check("UI: localized title via T.relatedProducts", has(ui, "T.relatedProducts"));
check("UI: uses enumToSlug for product link", has(ui, "enumToSlug(p.categoryKey)"));
check("UI: focus-visible ring (a11y)", has(ui, "focus-visible:ring"));
check("UI: lazy-loads images", has(ui, 'loading="lazy"'));
check("UI: NO direct repository/service imports (layering)",
  !has(ui, "product.repository") && !has(ui, "product.service"));
check("UI: NO direct DB client import", !has(ui, "getServerSupabase"));

// ── Localization (fa / en / ar) ────────────────────────────────────
check("i18n: relatedProducts key present", has(i18n, "relatedProducts:"));
check("i18n: fa translation present", has(i18n, /relatedProducts:\s*\{[^}]*fa:\s*"محصولات مرتبط"/s));
check("i18n: en translation present", has(i18n, /relatedProducts:\s*\{[^}]*en:\s*"Related Products"/s));
check("i18n: ar translation present", has(i18n, /relatedProducts:\s*\{[^}]*ar:\s*"منتجات ذات صلة"/s));
check("i18n: loading state translated", has(i18n, "relatedProductsLoading:"));

// ── Architecture preservation (ADR-0001) ───────────────────────────
check("Arch: Route does NOT import repository", !has(route, "product.repository"));
check("Arch: Route does NOT import service", !has(route, "product.service"));
check("Arch: UI does NOT call createServerFn", !has(ui, "createServerFn"));
check("Arch: Service does NOT touch DB directly", !has(service, "getServerSupabase"));
check("Arch: Server Fn does NOT touch DB directly", !has(fns, "getServerSupabase"));

// ── Backward compatibility ─────────────────────────────────────────
check("BC: existing searchProducts still exported", has(fns, "export const searchProducts"));
check("BC: existing getProductBySlug still exported", has(fns, "export const getProductBySlug"));
check("BC: existing listProducts still exported", has(fns, "export const listProducts"));
check("BC: ProductPage signature unchanged (still uses category+product props)",
  has(route, "<ProductPage lang={l} category={category} product={product} />"));

// ── SEO (RFC-0003 §SEO) ────────────────────────────────────────────
check("SEO: related-products component does NOT inject JSON-LD",
  !has(ui, "application/ld+json") && !has(ui, "productJsonLd"));

// ── Report ─────────────────────────────────────────────────────────
let pass = 0;
for (const c of checks) {
  const mark = c.pass ? "✓" : "✗";
  console.log(`  ${mark} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
  if (c.pass) pass++;
}
const total = checks.length;
console.log(`\nvalidate-related-products: ${pass}/${total} checks passed`);
if (pass !== total) {
  process.exit(1);
}
