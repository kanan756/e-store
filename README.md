# CLASPO — Custom Wire Harness & Cable Assembly Store

Welcome to the **CLASPO Store** project! This is a full-stack, modern eCommerce storefront built with **Next.js 16 (App Router)**, tailored for smart home solutions, electronics, and accessories.

IMPORTANT: This website operates purely as a customer-facing e-commerce application with a secure authentication system, customer account portal, and seamless Google Sheets integration.

The project uses **Google Sheets as a lightweight, accessible database** for products, orders, inquiries, quotes, and blog posts — making it incredibly easy for non-technical users to manage content without any separate CMS or backend server.

---

## ✨ Complete Feature List

### 🛒 Storefront & User Experience
- **Responsive Modern UI:** Fully mobile-responsive layout across all pages. The shop sidebar turns into a slide-out drawer on mobile. Checkout form reorganizes to single-column.
- **Dark Mode:** Full dark/light theme toggle with smooth transitions stored in localStorage.
- **SEO & Meta-Data:** Dynamic metadata per page (title, description, Open Graph) for all product, blog, and industry pages.
- **Part Number Display:** Products show their part number (PN) distinctly from the product name on the shop, product detail, and admin panel.
- **Animated Hero Section:** Homepage features an animated background canvas with smooth text reveals and calls to action.

---

### 🏪 Shop & Product System
- **Dynamic Product Catalog (`/shop`):** Auto-fetches products from Google Sheets. Filters and displays them in a responsive 3-column grid.
- **Advanced Search:** Search by **Product Name**, **Category**, OR **Part Number** simultaneously.
- **Sidebar Filters:** Filter by Category (checkboxes), Availability (In Stock Only), and Sort (Price Low-High / High-Low).
- **Pagination:** Products paginated 6 per page. Page resets automatically when filters change.
- **Category Banner:** A warning note appears automatically when user filters for Wires/Cables ("Sold per foot").
- **Individual Product Pages (`/products/[handle]`):** Each product has a dedicated page with:
  - Multi-image gallery with arrow navigation and thumbnails
  - Tabbed navigation: Overview, Features, Services, Gallery, Customize
  - Part Number shown in header
  - Price display (or "Contact for price" if $0)
  - Add to Cart button (disabled for Out of Stock items)
  - JSON-LD structured data (ProductSchema) for SEO
- **Static Product Detail Pages (`/products/[product-name]`):** 30+ hand-crafted product category pages with full specifications, tech data, applications, and gallery images.

---

### 🛒 Cart & Checkout
- **Shopping Cart (`/cart`):** View, adjust quantities, and remove items. Flat **$15.00 shipping** always added.
- **MOQ Enforcement:** Minimum Order Quantity of **5 pieces** for Wire and Cable products. User is alerted if they try to reduce below MOQ.
- **Secure Checkout (`/checkout`):**
  - Collects: First Name, Last Name, Email, Phone, Address, City, State, Postal Code
  - "Save Info for next time" checkbox uses localStorage
  - **Zod validation** on all fields before submission
  - Stripe Checkout Session is created server-side by resolving product prices directly from Google Sheets (prevents client-side price tampering)
- **Order Confirmed Page (`/order-confirmed`):** Displays a branded confirmation with invoice download link (uses a secure token stored in sessionStorage).

---

### 📧 Contact, Quotes & Communications
- **Contact / Inquiry Form (`/contact`):** Fields: Name, Company, Email, Phone (required), Subject, Message. Protected by **Google reCAPTCHA v3** + honeypot anti-spam.
- **Request a Quote Form:** Separate form for custom quote requests. Logged to `Quotes` tab in Google Sheets.
- **Email Notifications (both forms):**
  - Admin receives HTML alert email for every new inquiry/quote
  - Customer receives branded HTML auto-reply confirmation email
- **Customer Account Portal (`/account`):**
  - **Registration & Login:** Full customer registration (Full Name, Username, Phone Number, Email, Password, Confirm Password) and email/password login.
  - **Google Authentication:** One-click Continue with Google via NextAuth.js.
  - **Password Management:** Forgot Password with secure single-use token email reset, plus in-app Change Password.
  - **Profile Management:** View and update personal details (Full Name, Username, Phone Number) with uniqueness checks.
  - **My Orders & Order History:** Real-time customer order tracking with strict authorization (customers access only their own orders).
  - **Wishlist & Cart Overview:** Direct integration with saved wishlist items and shopping cart counters.
  - **Security:** Secure server-side password hashing (bcrypt), rate-limited authentication endpoints, and Google Sheets persistent customer storage.

---

### 📦 Additional Pages
- **Track Order (`/track-order`):** Customers enter their email to see all their orders and their real-time status + tracking comments.
- **Blog (`/blog` + `/blog/[slug]`):** Dynamic blog with full article pages, SEO metadata, reading time estimate.
- **Products Overview (`/products`):** 7 main product category showcase page with alternating image/text layout.
- **Industries (`/industries`):** 6 industry pages — Automotive/EV, Aerospace/Defense, Medical Devices, Industrial/Factory, Robotics/Automation, Solar Energy.
- **Services (`/services`):** Manufacturing capabilities and services overview.
- **Certifications (`/certifications`):** Quality certifications showcase.
- **About (`/about`):** Company info, team, mission.
- **Contact (`/contact`):** Map + contact form.
- **Privacy Policy, Terms, Cookies:** Legal pages.
- **Sitemap (`/sitemap.xml`) & Robots (`/robots.txt`):** Auto-generated for SEO.

---

### 🌐 SEO & Performance
- **ISR (Incremental Static Regeneration):** Shop page revalidates every 60 seconds. Product and blog pages revalidate every hour.
- **Static Pre-rendering:** All 105 routes are pre-built at deploy time for instant load times in production.
- **Image Optimization:** All images converted to `.webp` format for smaller file sizes and faster loading.
- **React Cache + TTL Cache:** Google Sheets API calls are deduplicated and cached (60s TTL) to minimize API usage.

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling | CSS (Vanilla + Custom Variables) |
| Database | Google Sheets API (`googleapis`) |
| Authentication | NextAuth.js (Credentials + Google OAuth) |
| Payments | Stripe |
| Emails | Nodemailer (Gmail SMTP) |
| Validation | Zod |
| Anti-spam | Google reCAPTCHA v3 + Honeypot |
| Deployment | Vercel |

---

## 🚀 Quick Start & Setup Guide

### 1️⃣ Prerequisites
- **Node.js ≥ 20** → https://nodejs.org
- **Git** → https://git-scm.com/downloads
- A **Google Account** (for Sheets API & reCAPTCHA)
- A **Stripe Account** (for payments)
- A **Gmail Account** (for sending emails via App Password)

### 2️⃣ Clone the repo
```bash
git clone https://github.com/Heet-P/e-store.git
cd e-store
```

### 3️⃣ Create environment files
```bash
cp storefront/.env.example storefront/.env.local
```
Fill in all keys in `storefront/.env.local`:

| Variable | What it does | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_STORE_URL` | URL of the store (dev: `http://localhost:3000`) | Type it yourself |
| `GMAIL_USER` | Gmail address that sends emails | Your Gmail address |
| `GMAIL_APP_PASSWORD` | App password for Gmail | **Google → Security → App passwords** |
| `EMAIL_FROM_NAME` | Friendly sender name shown in emails | Sender name (e.g. "CLASPO") |
| `GOOGLE_SHEET_ID` | ID of the Google Sheet database | Open sheet → URL → part after `/d/` and before `/edit` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service-account email for Sheets API | **Google Cloud → IAM → Service Accounts** |
| `GOOGLE_PRIVATE_KEY` | Private key of the service account | Download JSON from service account → copy `private_key` |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL of the app | Same as `NEXT_PUBLIC_STORE_URL` |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments | **Stripe Dashboard → Developers → API Keys** |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | **Stripe Dashboard → Webhooks → Add endpoint** |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 site key | **Google reCAPTCHA Admin Console** |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA secret key | Same page as above |
| `RECAPTCHA_MIN_SCORE` | Min score before blocking (dev: `0.3`, prod: `0.5`) | Set manually |

> **NOTE:** Keep the triple quotes around `GOOGLE_PRIVATE_KEY` — e.g. `GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."`

### 4️⃣ Google Sheet Setup
Your Google Sheet needs the following tabs (exact names):
- `Products` — columns: `ID, Name, Part Number, Handle, Category, Price, Description, ImageURL, InStock`
- `Orders` — auto-written by the checkout webhook
- `Inquiries` — written by the contact form
- `Quotes` — written by the quote request form
- `Blogs` — articles and updates
- `Subscribers` — written by the newsletter form
- `Customers` — user accounts (Full Name, Username, Phone, Email, Password Hash, Provider)

**Share the sheet** with your `GOOGLE_SERVICE_ACCOUNT_EMAIL` as **Editor**.

### 5️⃣ Install dependencies & run
```bash
cd storefront
npm install
npm run dev
```
Open `http://localhost:3000`

### 6️⃣ Stripe Webhook (for order confirmation emails)
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Copy the webhook signing secret shown and paste it as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

---

## ☁️ Deployment (Vercel)

1. Push repo to GitHub.
2. Sign up at https://vercel.com → **Import Project**.
3. Set **Root Directory** to `storefront`.
4. Add all environment variables from Step 3 as Vercel Environment Variables.
5. Deploy!
6. After deployment:
   - Add your live domain to **Google reCAPTCHA** console.
   - Add your live Stripe webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`.
   - Set `RECAPTCHA_MIN_SCORE` to `0.5` for production.

---

## 📁 Folder Structure

```
e-store/
├── storefront/               ← Main Next.js app
│   ├── app/                  ← All pages (App Router)
│   │   ├── (store)/          ← Customer-facing pages
│   │   │   ├── shop/         ← Shop page
│   │   │   ├── products/     ← Product detail pages (dynamic + static)
│   │   │   ├── cart/         ← Shopping cart
│   │   │   ├── checkout/     ← Checkout form + Stripe
│   │   │   ├── contact/      ← Contact / Inquiry form
│   │   │   ├── blog/         ← Blog listing + articles
│   │   │   ├── industries/   ← 6 industry sub-pages
│   │   │   ├── track-order/  ← Customer order tracking
│   │   │   ├── login/        ← Customer sign in
│   │   │   ├── signup/       ← Customer registration
│   │   │   ├── account/      ← Customer profile & orders portal
│   │   │   ├── forgot-password/ ← Password reset request
│   │   │   ├── reset-password/  ← Password reset confirmation
│   │   │   └── order-confirmed/
│   │   └── api/              ← All API routes
│   ├── components/           ← Reusable UI components
│   ├── context/              ← Cart & Wishlist context (global state)
│   ├── lib/                  ← Google Sheets logic, helpers, format utils
│   ├── styles/               ← globals.css (design tokens, animations)
│   └── public/               ← Static assets (images, icons)
└── scripts/                  ← Development helper scripts (image conversion, bulk page generation)
```

---

## 🔐 Security Notes
- Customer passwords are encrypted with salted **bcrypt (10 rounds)** before storage.
- Rate-limiting protects customer login, registration, and password reset endpoints.
- Server-side session verification ensures customers can only query and modify their own account and orders.
- Stripe prices are resolved **server-side** from Google Sheets. Cart prices from the browser are never trusted.
- reCAPTCHA v3 + honeypot protect all public forms from bots.
- All environment secrets are server-only (no `NEXT_PUBLIC_` prefix on sensitive keys).
