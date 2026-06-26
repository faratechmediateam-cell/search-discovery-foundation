# PRODUCTION DEPLOYMENT CHECKLIST

Phase 10 sign-off for the Faratech Medical Engineering Platform.

This list is the authoritative pre-launch gate. It supplements (does not
replace) `# 007_AI_HANDOFF.md`.

---

## 1. QA — cross-locale end-to-end

For each of `/fa`, `/en`, `/ar`:

- [ ] Home renders, hero image visible, navigation works.
- [ ] Products index lists categories and active products from DB.
- [ ] Category page renders for every category slug.
- [ ] Product detail page renders for every active product slug.
- [ ] Spare-parts page renders.
- [ ] `/` redirects to `/fa` (canonical default locale).
- [ ] Language switcher swaps locale and preserves the current path.
- [ ] `<html lang>` and `<html dir>` are correct on first paint (no RTL FOUC).

Forms:

- [ ] Contact form (CTA): validation messages localize.
- [ ] Newsletter form (Footer): validation messages localize.
- [ ] Successful submit writes a row to `public.leads` and triggers the
      email notification path.
- [ ] Honeypot-filled submissions return success without a DB row.
- [ ] Rate limiter denies the 6th submit per email per 10 minutes.

SEO:

- [ ] `<title>` and meta description differ per route and per locale.
- [ ] `link rel="canonical"` and `hreflang` alternates present on every
      indexable route.
- [ ] `og:image` resolves to the hero/product image where applicable.
- [ ] `sitemap.xml` reachable and reflects the live route set.
- [ ] `robots.txt` reachable; allows crawling.

---

## 2. Performance budgets

Targets (mobile, Lighthouse, throttled Slow 4G):

- LCP &lt; 2.0s
- CLS &lt; 0.05
- INP &lt; 150ms
- TBT &lt; 200ms

Production hardening applied:

- [x] LCP hero image preloaded on the home route with
      `fetchpriority="high"`.
- [x] Localized fallback resolved server-side (no client re-fetch).
- [x] Locale + direction set before hydration via inline IIFE in
      `$lang` route head (no RTL FOUC).
- [ ] Re-run Lighthouse on the published URL; capture report.

---

## 3. Abuse mitigation — public lead endpoint

- [x] Honeypot field (`website`) on both contact and newsletter forms.
      Server discards submissions whose honeypot is non-empty and returns
      a success-shaped response so bots cannot distinguish acceptance.
- [x] In-memory sliding-window rate limit on `submitContactLead` and
      `submitNewsletterLead` — 5 / email / 10 min and 60 global / min.
- [ ] Document the per-instance limitation in this checklist (done below)
      and revisit a durable limiter (KV / Redis) when traffic justifies it.

**Limitation:** the rate limiter is per Worker isolate. It is a
first-line defense, not a global throttle. RLS on `public.leads`
remains the hard boundary (insert-only for `anon`).

---

## 4. Environment review

- [ ] Production Lovable Cloud project linked.
- [ ] `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` set in the prod env.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in the prod env (server-only).
- [ ] Email notification credentials (Resend / SMTP) configured.
- [ ] All Phase 1–10 migrations applied to production.
- [ ] `public.leads` table reachable from server functions; RLS active.

---

## 5. Deployment

- [ ] `bun run build` succeeds.
- [ ] `bun run scripts/validate-phase10.ts` passes.
- [ ] Typecheck (`bunx tsgo --noEmit`) clean.
- [ ] Publish via Lovable; verify the production URL serves the home
      page and a sample product page.
- [ ] Smoke-test contact + newsletter submission against production.
- [ ] Connect custom domain when ready (post-launch — out of scope here).

---

## 6. Deferred / out of scope

These items are explicitly not part of Phase 10 and require a new
roadmap to schedule:

- Authentication, admin CMS, dashboard.
- Full-text search.
- Analytics / PostHog instrumentation.
- AI-generated `en` / `ar` localized content.
- Durable rate limiter (KV-backed).
- Locale-detection redirect on `/` using `Accept-Language`.
