# Client Store — Full-Stack Ecommerce

Medusa.js v2 backend + Next.js 15 storefront for a premium industrial ecommerce store.

---

## Project Structure

```
/
├── backend/          Medusa.js v2 backend + admin panel
├── storefront/       Next.js 15 + TypeScript storefront
└── report.md         Detailed breakdown of development progress
```

---

## 1 — Backend Setup (Medusa.js v2)

### Prerequisites
- Node.js 20+
- A PostgreSQL database on Supabase (free tier) or local PostgreSQL instance.

### Install

```bash
cd backend
npm install
```

### Configure environment

```bash
cp .env.template .env
# Edit .env with your actual values:
#   DATABASE_URL — from Supabase project settings → Database → Connection String (URI)
#   JWT_SECRET   — run: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
#   COOKIE_SECRET — same command as above
#   STORE_CORS   — must include http://localhost:3000
```

### Run migrations

```bash
# This applies all v2 database schemas to your Supabase instance.
npx medusa db:migrate
```

### Create admin user

```bash
npx medusa user -e admin@clientstore.com -p YourStrongPassword123
```

### Start backend

```bash
npm run dev
# Backend: http://localhost:9000
# Admin:   http://localhost:9000/app
```

---

## 2 — Storefront Setup (Next.js)

### Install

```bash
cd storefront
npm install
```

### Configure environment

```bash
cp .env.local.template .env.local
# Edit .env.local:
#   NEXT_PUBLIC_MEDUSA_BACKEND_URL — http://localhost:9000 for local dev
#   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY — Create this inside the Medusa Admin (Settings -> API Keys)
#   NEXT_PUBLIC_MEDUSA_REGION_ID — The ID of the Region you created in Medusa Admin
```

### Start storefront

```bash
npm run dev
# Storefront: http://localhost:3000
```

---

## 3 — Logistics & Shipping Setup (Required for Checkout)

Medusa v2 has a strict logistics hierarchy. You must configure this in the Admin Panel before checkout will work:

1. Go to **Settings → Locations** and create a Stock Location.
2. Go to **Settings → Regions** and ensure your country is added to the Region.
3. Go to **Settings → Locations**, select your location, and create a **Fulfillment Set**.
4. Inside the Fulfillment Set, create a **Service Zone**.
5. Inside the Service Zone, add a **Shipping Option Type**.
6. Finally, create a **Shipping Option** (e.g., "Standard Shipping" for €0).

Without a valid Shipping Option, the storefront cart will fail to complete the checkout flow!

---

## 4 — Payment Flow (Razorpay)

Currently, the storefront implements a client-side Razorpay widget. 

1. Create a Razorpay account at razorpay.com
2. Get your API keys from Dashboard → Settings → API Keys
3. Add to storefront `.env.local`:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
   ```
4. **Backend Handling:** Because the backend uses `pp_system_default` (a dummy provider), Medusa is not directly connected to Razorpay. Orders will be marked as **"Authorized" (Not paid)**. You must manually verify the payment in your Razorpay Dashboard and click **"Capture"** in the Medusa Admin to mark the order as Paid.

To fully automate this in production, you must install a Medusa v2 Razorpay Plugin on the backend and configure Webhooks.

---

## 5 — Frequent Errors & Fixes (Troubleshooting)

### Error 1: `400 Bad Request` or "CORS policy blocked" on Storefront
**Cause:** The backend `STORE_CORS` environment variable does not include the storefront's URL.
**Fix:** In `backend/.env`, set `STORE_CORS="http://localhost:3000,http://localhost:8000"`. Ensure there are no trailing slashes. Restart the backend.

### Error 2: "Column n0.deleted_at does not exist" or Database Crashes
**Cause:** Out-of-sync database schemas between old Medusa v1 and new Medusa v2 modules.
**Fix:** You must completely wipe the database. If using Supabase, go to the SQL Editor and run `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`. Then run `npx medusa db:migrate` again.

### Error 3: Storefront throws `400` during Cart Creation (Stale Region Error)
**Cause:** If you delete the database and re-migrate, the `region_id` changes. Your browser still holds a cookie for the old `region_id`.
**Fix:** Open Browser DevTools (F12) → Application → Cookies → Delete the `medusa_cart_id` and `medusa_region_id` cookies. Refresh the page.

### Error 4: "Payment was received, but we couldn't finalize the order"
**Cause:** The Medusa v2 `completeCartWorkflow` sometimes throws a state transition error with `pp_system_default` even when the order was successfully created in the database.
**Fix:** We implemented a patch in `storefront/app/(store)/checkout/page.tsx` that re-fetches the cart to verify if it was completed, bypassing the false error and redirecting the user safely.

### Error 5: Admin Panel Orders say "Not paid" after successful purchase
**Cause:** This is intended behavior. The order is "Authorized".
**Fix:** Open the order in the Admin Panel, scroll to the Payment section, and click **Capture**. To automate this, you must install the Razorpay backend plugin.

### Error 6: Products are invisible on the Shop page
**Cause:** Next.js client-side routing wasn't triggering the GSAP scroll-reveal `.rv` animation classes on new pages.
**Fix:** Fixed by attaching Next.js `usePathname()` to the `RevealObserver` component in the storefront so animations re-trigger on route changes.

---

## 6 — Production Deployment

1. **Deploy Backend:** Push `/backend` to Railway or Render. Set all production `.env` variables.
2. **Deploy Storefront:** Push `/storefront` to Vercel. Set `NEXT_PUBLIC_MEDUSA_BACKEND_URL` to your live backend domain.
3. **Set up Caching:** The storefront is already configured with Next.js ISR (`revalidate = 60`) for lightning-fast page loads.
4. **Cloud Storage:** You must install an S3 or Supabase Storage plugin on the backend to handle product images, otherwise images will break upon backend server restarts.
