# Codebase Audit Report
Date: 2026-05-15
Auditor: Claude Code

## Critical Issues Fixed
- `backend/medusa-config.js`: removed insecure `supersecret` JWT/cookie fallbacks; production secrets now must come from environment variables.
- `backend/.gitignore` and `storefront/.gitignore`: added complete env/build ignores so `.env`, `.env.local`, `.env.production`, `.env.development`, build output, and dependencies are excluded.
- `storefront/package.json`: upgraded Next from `15.3.2` to `16.2.6` to match the intended Next 16 stack and pick up current framework fixes.

## High Issues Fixed
- `backend/src/loaders/rate-limit.ts`: added rate limiting for store cart and checkout completion routes.
- `backend/medusa-config.js`: removed hardcoded localhost CORS fallbacks; `STORE_CORS` and `ADMIN_CORS` now come from env.
- `storefront/app/(store)/checkout/page.tsx`: added zod validation for checkout name, email, phone, address, city, state, and pincode before Medusa API calls.
- `storefront/app/(store)/checkout/page.tsx`: prevented double payment submission and replaced raw error display with safe customer-facing messages.
- `storefront/context/cart-context.tsx`: validates any stored cart ID with Medusa before using it and clears completed/invalid carts.

## Moderate Issues Fixed
- `storefront/next.config.ts`: added security headers and replaced wildcard image host patterns with explicit env-configured hostnames.
- `storefront/app/robots.ts`: blocked indexing for `/api/`, `/checkout`, `/order-confirmed`, `/cart`, and `/admin/`.
- `storefront/lib/types.ts` plus product/cart files: removed source `any` usage and direct backend entity typing from client components.
- `backend/package.json`: updated `pg` to `8.20.0` and `typeorm` to `0.3.29`.

## Low Issues / Observations
- `ProductSchema` JSON-LD and `ThemeScript` are the only `dangerouslySetInnerHTML` usages; both render controlled static/structured data.
- Root helper scripts `backend/db-check.js` and `backend/create-region.js` still print operational status only; they do not log secrets or customer/payment data.

## Dependencies
### Vulnerable Packages Fixed
- Added `express-rate-limit`.
- Added `zod`.
- Upgraded `next` to `16.2.6`.
- Updated `pg` and `typeorm` to current safe releases.

### Outdated Packages Updated
- `next`: `15.3.2` -> `16.2.6`
- `pg`: `8.12.0` -> `8.20.0`
- `typeorm`: `0.3.16` -> `0.3.29`

### Unstable / Flagged Packages
- `medusa-payment-razorpay`: very low weekly downloads (73) and last publish on 2024-11-20; keep under review.
- `medusa-payment-manual` and `medusa-fulfillment-manual`: low weekly downloads and last publish on 2024-07-18; acceptable only because they are Medusa v1 ecosystem plugins.
- Remaining audit vulnerabilities are tied to Medusa v1/Admin/Medusa JS transitive dependencies. `npm audit fix --force` would migrate to Medusa v2-era packages or otherwise break the current stack, so those were not forced.

## TypeScript
- Errors before audit: 5 storefront, 0 backend
- Errors after audit: 0

## What Was NOT Changed
- Did not force `npm audit fix --force` for Medusa packages because it would perform breaking Medusa major upgrades and violate the no-stack-swap constraint.
- Did not replace `@medusajs/medusa-js`; doing so would remove many storefront audit findings but would be a library swap.
- Did not add custom Razorpay webhook code because this repo has no custom `backend/src/api` webhook route; the configured Razorpay plugin already receives `RAZORPAY_WEBHOOK_SECRET`.

## Recommendations Post-Launch
- Plan a Medusa v2 migration or replace the deprecated Medusa JS client with the maintained Store API client path.
- Move production rate limiting to Redis-backed storage so limits survive process restarts and multi-instance Railway scaling.
- Add Sentry or another error monitor for checkout and payment completion failures.
- Rotate all production secrets after deployment and confirm `STORE_CORS`/`ADMIN_CORS` are exact production origins.
- Re-evaluate `medusa-payment-razorpay`; its low package activity makes it a supply-chain risk for a payment-critical integration.
