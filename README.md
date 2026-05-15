# Client Store — Full-Stack Ecommerce

Medusa.js backend + Next.js 15 storefront for a premium industrial ecommerce store.

---

## Project Structure

```
/
├── backend/          Medusa.js v1 backend + admin panel
├── storefront/       Next.js 15 + TypeScript storefront
├── Client Store.html Original design reference (static HTML)
├── styles.css        Original design CSS
└── script.js        Original design JS
```

---

## 1 — Backend Setup (Medusa.js)

### Prerequisites
- Node.js 18+
- A PostgreSQL database on Supabase (free tier)

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
```

### Run migrations

```bash
npx medusa migrations run
```

### Create admin user

```bash
npx medusa user -e admin@clientstore.com -p YourStrongPassword123
```

### Start backend

```bash
npm run develop
# Backend: http://localhost:9000
# Admin:   http://localhost:9000/app
```

### Add your first product via admin panel

1. Open http://localhost:9000/app
2. Log in with the admin credentials you created
3. Go to Products → New Product
4. Fill in title, description, price (in paise — ₹100 = 10000), add an image
5. Set inventory quantity > 0
6. Publish the product

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
#   NEXT_PUBLIC_RAZORPAY_KEY_ID   — from Razorpay dashboard (test key starts with rzp_test_)
#   NEXT_PUBLIC_STORE_URL         — your production domain (for sitemap/SEO)
```

### Start storefront

```bash
npm run dev
# Storefront: http://localhost:3000
```

---

## 3 — Payment Flow (Razorpay)

1. Create a Razorpay account at razorpay.com
2. Get your API keys from Dashboard → Settings → API Keys
3. Add backend `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   RAZORPAY_ACCOUNT=acc_xxxxx
   RAZORPAY_WEBHOOK_SECRET=xxxxx
   ```
4. Add storefront `.env.local`:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
   ```

---

## 4 — Production Deployment

### Backend → Railway

1. Push `/backend` to a GitHub repo
2. Create a new Railway project → Deploy from GitHub
3. Set all environment variables from `.env.template`
4. Update `STORE_CORS` to your Vercel storefront URL
5. Run migrations: in Railway shell → `npx medusa migrations run`

### Storefront → Vercel

1. Push `/storefront` to a GitHub repo
2. Import into Vercel
3. Set environment variables from `.env.local.template`
4. Update `NEXT_PUBLIC_MEDUSA_BACKEND_URL` to your Railway backend URL

---

## 5 — Razorpay Webhook (for production)

Add a webhook in Razorpay Dashboard:
- URL: `https://your-backend.railway.app/razorpay/hooks`
- Events: `payment.captured`, `payment.failed`

---

## Pages

| URL | Description |
|-----|-------------|
| `/` | Homepage with hero, categories, featured products |
| `/products` | All products grid |
| `/products/[handle]` | Product detail with add-to-cart |
| `/cart` | Cart with quantity controls |
| `/checkout` | Guest checkout form + Razorpay payment |
| `/order-confirmed` | Post-payment thank you page |

## Admin Panel

`https://your-backend.railway.app/app`

The client can:
- Add/edit products (name, description, images, price, stock)
- View all orders
- Mark orders as fulfilled after manual shipping
- No code changes needed for any of this
