/**
 * Release 1.2 — Design System & UI Foundation validator.
 *
 *   bun run scripts/validate-design-system.ts
 *
 * Verifies invariants introduced by FEATURE-0003 / RFC-0002:
 *   - Design tokens (radius, shadow, motion) live in `src/styles.css`.
 *   - Shared presentation components exist under `src/components/ui/`.
 *   - Button has been EXTENDED (not replaced) with `brand` variant + `xl` size.
 *   - i18n keys for shared loading / error / empty states cover en/fa/ar.
 *   - New UI components remain presentation-only (no repo/service imports).
 *   - Architecture rules (ADR-0001) preserved: components never import from
 *     `lib/modules/*` repository/service/functions layers.
 *   - Accessibility primitives (role, aria-live, sr-only label) are present.
 *   - Components are RTL-safe (no `text-left` / `text-right` / `ml-*` / `mr-*`
 *     used in new DS components; logical utilities or symmetric ones only).
 *   - Existing shadcn primitives (alert, badge, card, input, skeleton, label,
 *     form) are still present (backward compatibility).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

type Check = { name: string; ok: boolean; detail?: string };
const checks: Check[] = [];
const record = (name: string, ok: boolean, detail?: string) =>
  checks.push({ name, ok, detail });
const read = (p: string) => readFileSync(resolve(p), "utf8");

// ---------- 1. Design tokens in styles.css ----------
const styles = read("src/styles.css");
record("Tokens: radius scale defined", /--radius-sm:[\s\S]*--radius-2xl:/.test(styles));
record("Tokens: shadow scale defined (xs..xl)", /--shadow-xs:[\s\S]*--shadow-xl:/.test(styles));
record(
  "Tokens: motion timing tokens defined",
  /--duration-fast:/.test(styles) &&
    /--duration-base:/.test(styles) &&
    /--duration-slow:/.test(styles) &&
    /--ease-standard:/.test(styles),
);
record("Tokens: ds-page page container utility", /\.ds-page\s*\{/.test(styles));
record("Tokens: ds-section spacing utility", /\.ds-section\s*\{/.test(styles));
record("Tokens: ds-focus-ring accessibility utility", /\.ds-focus-ring:focus-visible/.test(styles));
record("Tokens: ds-spin respects prefers-reduced-motion", /prefers-reduced-motion[\s\S]*ds-spin/.test(styles));

// ---------- 2. New DS components exist ----------
const dsComponents = [
  "src/components/ui/loading-spinner.tsx",
  "src/components/ui/empty-state.tsx",
  "src/components/ui/error-state.tsx",
  "src/components/ui/page-container.tsx",
  "src/components/ui/section.tsx",
];
for (const p of dsComponents) {
  record(`DS component exists: ${p.split("/").pop()}`, existsSync(p));
}

// ---------- 3. Button extended (not replaced) ----------
const btn = read("src/components/ui/button.tsx");
record("Button: existing variants preserved", /default:/.test(btn) && /destructive:/.test(btn) && /outline:/.test(btn) && /ghost:/.test(btn) && /link:/.test(btn));
record("Button: new `brand` variant added", /brand:\s*"bg-brand-red/.test(btn));
record("Button: new `xl` size added", /xl:\s*"h-12/.test(btn));

// ---------- 4. Accessibility primitives in new components ----------
const spinner = read("src/components/ui/loading-spinner.tsx");
record("Spinner: role=status + sr-only label", /role="status"/.test(spinner) && /sr-only/.test(spinner));
const empty = read("src/components/ui/empty-state.tsx");
record("EmptyState: role=status + heading", /role="status"/.test(empty) && /<h2/.test(empty));
const err = read("src/components/ui/error-state.tsx");
record("ErrorState: role=alert + aria-live", /role="alert"/.test(err) && /aria-live="assertive"/.test(err));

// ---------- 5. RTL safety (no physical alignment in new DS components) ----------
const rtlBadPattern = /\b(text-left|text-right|ml-\d|mr-\d|pl-\d|pr-\d|left-\d|right-\d)\b/;
for (const p of dsComponents) {
  const src = read(p);
  record(`RTL-safe (no physical-axis utilities): ${p.split("/").pop()}`, !rtlBadPattern.test(src));
}

// ---------- 6. Architectural compliance (presentation-only) ----------
const layerBadPattern = /from\s+["']@\/lib\/modules\/[^"']+\/(?:[a-z-]+\.)?(repository|service|functions)["']/;
for (const p of dsComponents.concat(["src/components/ui/button.tsx"])) {
  const src = read(p);
  record(
    `Layered architecture preserved: ${p.split("/").pop()} imports no repo/service/fn`,
    !layerBadPattern.test(src),
  );
  record(
    `No direct Supabase import in ${p.split("/").pop()}`,
    !/from\s+["'][^"']*supabase[^"']*["']/.test(src),
  );
}

// ---------- 7. i18n state keys (en/fa/ar) ----------
const i18n = read("src/lib/i18n.ts");
for (const key of ["loading", "retry", "errorTitle", "errorBody", "emptyTitle", "emptyBody"]) {
  const re = new RegExp(`\\b${key}\\b:\\s*\\{[^}]*\\ben:[^}]*\\bfa:[^}]*\\bar:|\\b${key}\\b:\\s*\\{[^}]*\\bfa:[^}]*\\ben:[^}]*\\bar:`);
  record(`i18n key "${key}" defined with en/fa/ar`, re.test(i18n));
}

// ---------- 8. Backward compatibility (existing primitives untouched) ----------
for (const p of [
  "src/components/ui/alert.tsx",
  "src/components/ui/badge.tsx",
  "src/components/ui/card.tsx",
  "src/components/ui/input.tsx",
  "src/components/ui/textarea.tsx",
  "src/components/ui/label.tsx",
  "src/components/ui/skeleton.tsx",
  "src/components/ui/form.tsx",
]) {
  record(`Backward compatibility: ${p.split("/").pop()} still present`, existsSync(p));
}

// ---------- 9. Tailwind theme references for tokens ----------
record(
  "Tailwind @theme exposes color + radius tokens",
  /@theme inline\s*\{[\s\S]*--color-primary:[\s\S]*--radius-lg:/.test(styles),
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
console.log(`\nRelease 1.2: ${total - failed}/${total} checks passed.`);
if (failed > 0) process.exit(1);
