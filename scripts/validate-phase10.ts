/**
 * Phase 10 validator — QA, Performance and Production Deployment.
 *
 *   bun run scripts/validate-phase10.ts
 *
 * Verifies invariants introduced by Phase 10:
 *   - Lead rate-limiter primitive behaves correctly.
 *   - Lead server functions wire the honeypot + rate limiter.
 *   - Both lead-bearing UI forms render a honeypot input.
 *   - LCP hero image is preloaded on the home route.
 *   - robots.txt + sitemap.xml exist.
 *   - Production checklist doc exists.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  consume,
  __resetRateLimit,
  LEAD_EMAIL_LIMIT,
  LEAD_GLOBAL_LIMIT,
} from "../src/lib/modules/leads/lead.rate-limit";

type Check = { name: string; ok: boolean; detail?: string };
const checks: Check[] = [];
const record = (name: string, ok: boolean, detail?: string) =>
  checks.push({ name, ok, detail });

function read(p: string): string {
  return readFileSync(resolve(p), "utf8");
}

// ---------- 1. Rate limiter primitive ----------
__resetRateLimit();
let lastOk = true;
for (let i = 0; i < LEAD_EMAIL_LIMIT.max; i++) {
  if (!consume("k1", LEAD_EMAIL_LIMIT).ok) lastOk = false;
}
record("rate limiter accepts up to max hits", lastOk);
const denied = consume("k1", LEAD_EMAIL_LIMIT);
record(
  "rate limiter denies the (max+1)th hit with retryAfterMs",
  !denied.ok && typeof denied.retryAfterMs === "number" && denied.retryAfterMs! >= 0,
);
record(
  "separate keys have independent budgets",
  consume("k2", LEAD_EMAIL_LIMIT).ok,
);
record(
  "default lead budgets are sane",
  LEAD_EMAIL_LIMIT.max > 0 &&
    LEAD_EMAIL_LIMIT.windowMs > 0 &&
    LEAD_GLOBAL_LIMIT.max >= LEAD_EMAIL_LIMIT.max,
);

// ---------- 2. Server function wiring ----------
const fnSrc = read("src/lib/modules/leads/lead.functions.ts");
record("lead.functions imports rate-limit primitive", fnSrc.includes('from "./lead.rate-limit"'));
record("lead.functions declares honeypot field", /honeypot/.test(fnSrc) && /website:\s*honeypot/.test(fnSrc));
record(
  "contact handler short-circuits when honeypot is filled",
  /data\.website[\s\S]{0,80}return\s*\{[\s\S]{0,120}kind:\s*"contact"/.test(fnSrc),
);
record(
  "newsletter handler short-circuits when honeypot is filled",
  /data\.website[\s\S]{0,80}return\s*\{[\s\S]{0,120}kind:\s*"newsletter"/.test(fnSrc),
);
record("contact handler enforces lead limits", /enforceLeadLimits\(data\.email\)[\s\S]{0,200}submitContact/.test(fnSrc));
record("newsletter handler enforces lead limits", /enforceLeadLimits\(data\.email\)[\s\S]{0,200}submitNewsletter/.test(fnSrc));

// ---------- 3. Client helper passes honeypot ----------
const captureSrc = read("src/lib/lead-capture.ts");
record(
  "submitContact forwards honeypot value as `website`",
  /submitContact\([^)]*honeypot[^)]*\)[\s\S]*website:\s*honeypot/.test(captureSrc),
);
record(
  "submitNewsletter forwards honeypot value as `website`",
  /submitNewsletter\([^)]*honeypot[^)]*\)[\s\S]*website:\s*honeypot/.test(captureSrc),
);

// ---------- 4. UI forms render honeypot inputs ----------
const ctaSrc = read("src/components/faratech/cta.tsx");
const footerSrc = read("src/components/faratech/footer.tsx");
record('CTA form has name="website" honeypot input', /name="website"/.test(ctaSrc) && /aria-hidden="true"/.test(ctaSrc));
record('Footer form has name="website" honeypot input', /name="website"/.test(footerSrc) && /aria-hidden="true"/.test(footerSrc));
record("CTA form passes honeypot to submitContact", /submitContact\(parsed\.data,\s*hp\)/.test(ctaSrc));
record("Footer form passes honeypot to submitNewsletter", /submitNewsletter\(parsed\.data,\s*hp\)/.test(footerSrc));

// ---------- 5. Performance: LCP preload ----------
const homeRoute = read("src/routes/$lang.index.tsx");
record(
  "Home route preloads the LCP hero image with fetchpriority=high",
  /rel:\s*"preload"[\s\S]{0,160}as:\s*"image"[\s\S]{0,160}fetchpriority:\s*"high"/.test(homeRoute),
);

// ---------- 6. Production assets ----------
record("public/robots.txt exists", existsSync("public/robots.txt"));
record("public/sitemap.xml exists", existsSync("public/sitemap.xml"));
record("public/site.webmanifest exists", existsSync("public/site.webmanifest"));

// ---------- 7. Production checklist documentation ----------
record(
  "docs/# 009_PRODUCTION_CHECKLIST.md exists",
  existsSync("docs/# 009_PRODUCTION_CHECKLIST.md"),
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
console.log(`\nPhase 10: ${total - failed}/${total} checks passed.`);
if (failed > 0) process.exit(1);
