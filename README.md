# Client Store — Full-Stack Ecommerce

---

## 🚀 Quick Start & Full Setup Guide (New Features)

This guide walks you through **every** step to get the project up and running, **including** the brand‑new blog system, contact form with reCAPTCHA, mobile navigation, and hardened security. It’s written for absolute beginners – even a kid can follow it!

### 1️⃣ Prerequisites
- **Node.js ≥ 20** – download from https://nodejs.org or use `nvm install 20`.
- **Git** – https://git-scm.com/downloads.
- **A Google account** – needed for several API keys.
- **A browser** – Chrome/Edge/Firefox.

### 2️⃣ Clone the repo
```bash
git clone https://github.com/Heet-P/e-store.git
cd e-store
```

### 3️⃣ Create environment files
#### Storefront (`storefront/.env.local`)
```bash
cp .env.example .env.local   # creates a copy you can edit
```
Open `.env.local` in any editor and fill in the following keys (all are explained where to obtain them):

| Variable | What it does | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key for payments | **Razorpay Dashboard → Settings → API Keys** |
| `NEXT_PUBLIC_STORE_URL` | URL of the store (dev: `http://localhost:3000`) | Type it yourself |
| `ADMIN_PASSWORD` | Password for the admin panel | Choose a strong password |
| `GMAIL_USER` | Gmail address that sends emails | Your Gmail address |
| `GMAIL_APP_PASSWORD` | App password for Gmail (no 2FA prompt) | **Google → Security → App passwords** |
| `EMAIL_FROM_NAME` | Friendly sender name | Anything you like |
| `GOOGLE_SHEET_ID` | ID of the Google Sheet used as the DB | Open the sheet → **File → Share → Get link** – the part after `/d/` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service‑account email for Sheets API | **Google Cloud → IAM → Service Accounts → Create** |
| `GOOGLE_PRIVATE_KEY` | Private key of the service account (the whole key block) | Same service‑account creation – download JSON and copy the `private_key` value |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL of the app (dev: `http://localhost:3000`) | Same as store URL |
| `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` | OAuth client for “Login with Google” | **Google Cloud → APIs & Services → Credentials → Create OAuth client ID → Web application** – add `http://localhost:3000` to *Authorized JavaScript origins* and `http://localhost:3000/api/auth/callback/google` to *Authorized redirect URIs* |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 site key – **very important** for the contact form | **Google reCAPTCHA → Admin console → + → Choose “reCAPTCHA v3”, Domain: `localhost`** |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA secret key | Same page as above |
| `RECAPTCHA_MIN_SCORE` | Minimum reCAPTCHA score before blocking (dev: `0.3`, prod: `0.5`) | Set as shown |

> **NOTE:** Keep the surrounding triple quotes around `GOOGLE_PRIVATE_KEY`. Do **not** add extra spaces.

#### Backend (`backend/.env` – optional)
If you want to use the optional PostgreSQL backend, copy the template and fill in the values:
```bash
cp .env.example .env   # if the file exists
```
Edit the file and replace placeholders with your Supabase/Postgres connection string, CORS origins, and secrets. If you don’t need the backend, you can leave this file empty – the app will work with Google Sheets only.

### 4️⃣ Install dependencies
```bash
npm install   # runs in the repo root and installs both backend & storefront packages
```

### 5️⃣ Run the development server
```bash
npm run dev   # starts Next.js on http://localhost:3000
```
Open the URL in a browser. You should see the home page, a hamburger menu on mobile widths, and a **Contact** link.

### 6️⃣ Test the new features
- **Mobile navigation** – shrink the browser or open DevTools device mode, click the hamburger, watch the drawer slide down.
- **Blog** – visit `/blog` to see a list of posts pulled from the Google Sheet. Click a post to view its detail page.
- **Contact form** – fill it out and submit. You’ll get an auto‑reply email, and the server log will show something like:
  ```
  [reCAPTCHA] { success: true, score: 0.7, action: 'contact', errors: undefined }
  ```
- **Admin panel** – go to `/admin`, log in with the admin password you set, and explore Products, Blogs, Orders, and Inquiries.
- **Rate limiting** – try submitting the contact form more than 5 times in a minute. You’ll receive a **429 Too Many Requests** response.

### 7️⃣ Deploy (optional)
1. Sign up at https://vercel.com and import the repo.
2. Add all the environment variables from step 3 as **Vercel Environment Variables** (keep `NEXT_PUBLIC_` keys public, the rest secret).
3. Deploy! Vercel will build the app automatically.
4. After deployment, go back to the Google reCAPTCHA console, add your new domain, and replace the site/secret keys in Vercel.
5. Raise `RECAPTCHA_MIN_SCORE` to `0.5` (or higher) for production.

---

# Client Store — Full-Stack Ecommerce

---

## Project Structure

```
/
├── backend/          (optional) Node.js API that can use PostgreSQL for extra features
├── storefront/       Next.js 16 + TypeScript storefront (Google Sheets DB)
└── report.md         Detailed breakdown of development progress
```

---

## 1 — Backend (Optional)

If you need a custom API or database, you can set up the optional backend. Otherwise the storefront works purely with Google Sheets.

### Prerequisites
- Node.js 20+

### Install
```bash
cd backend
npm install
```

### Configure environment
```bash
cp .env.example .env   # or create .env from scratch
# Edit .env with your actual values (optional):
#   DATABASE_URL — PostgreSQL connection string
#   JWT_SECRET   — run: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
#   COOKIE_SECRET — same command as above
#   STORE_CORS   — must include http://localhost:3000
```

### Run backend (if used)
```bash
npm run dev
# Backend: http://localhost:9000
```

---

## 2 — Storefront Setup (Next.js)

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
