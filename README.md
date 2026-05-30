# Superior Harnessing & Assembly (SHA) Store

Welcome to the **Superior Harnessing & Assembly (SHA) Store** project! This is a full-stack, modern eCommerce storefront and administrative dashboard built with Next.js, tailored specifically for B2B electronics manufacturing (Wire Harnessing, Cable Assembly, PCB Assembly). 

The project leverages Google Sheets as a lightweight, accessible database for products, orders, and blog posts, making it incredibly easy for non-technical users to manage the store's content.

---

## ✨ Features

### 🛒 User & Core Storefront Experience
- **Responsive Modern UI:** Fully mobile-responsive layout across all pages with a clean design.
- **SEO & Meta-Data:** Dynamic routing and metadata configured for SEO best practices.
- **Dynamic Product Catalog:** The main shop page automatically fetches and renders products directly from the Google Sheets database.
- **Individual Product Pages:** Dynamic routing (`/products/[handle]`) generates unique pages for every product.
- **Shopping Cart System:** A fully functional, mobile-optimized cart that handles quantity adjustments, item removal, and persistent state.
- **Track Order System:** A dedicated page where customers can input their email address to view real-time statuses and tracking comments for all their historical orders.
- **Blog & Resources:** A dynamic blog page (`/blog`) that reads from the database and renders full articles with SEO-friendly URL slugs.
- **About & Services:** Themed informational pages specifically tailored for manufacturing services.

### 💳 Payment & Checkout
- **Payment Gateway Integration:** Securely process customer transactions using **Razorpay** and **Stripe**.
- **Automated Order Logging:** Upon successful payment, orders are instantly recorded into the `Orders` tab of your Google Sheet.

### 📧 Contact & Communications
- **Secure Contact Form:** A user-facing inquiry form equipped with honeypot fields and **Google reCAPTCHA v3** to prevent bot spam.
- **Customer Auto-Replies:** Customers receive an instant, beautifully branded HTML email confirming their inquiry.
- **Admin Notifications:** Admins receive lightweight HTML alerts for new contact submissions.
- **Database Sync:** Form submissions are automatically appended to the `Inquiries` tab in Google Sheets.

### 🛠️ Admin Dashboard & Management (`/admin`)
- **Secure Authentication:** Cookie-based protected login to ensure only authorized users can access the backend.
- **KPI Overview:** High-level dashboard displaying critical metrics (Total Products, Orders Processed, Total Revenue) and a quick-glance table of recent orders.
- **Product CRUD:** Full ability to add new products, update pricing/details, and delete items with exact-row precision sync to Google Sheets.
- **Order Management:** View incoming orders, update fulfillment status, and add tracking comments.
- **Blog CMS:** A built-in content management system to draft, publish, and delete blog posts directly from the dashboard.
- **Customer Status Emails:** Automatically send customers a rich HTML email whenever their order status is updated.

---

## 💻 Technical Stuff

### Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Database:** Google Sheets API (`googleapis`)
- **Authentication:** NextAuth.js
- **Payments:** Razorpay & Stripe
- **Emails:** Nodemailer
- **Validation:** Zod

### 🚀 Quick Start & Setup Guide

#### 1️⃣ Prerequisites
- **Node.js ≥ 20** – download from https://nodejs.org
- **Git** – https://git-scm.com/downloads
- **A Google account** – needed for Google Sheets API and reCAPTCHA

#### 2️⃣ Clone the repo
```bash
git clone https://github.com/Heet-P/e-store.git
cd e-store
```

#### 3️⃣ Create environment files
Create a `.env.local` file inside the `storefront` directory:
```bash
cp storefront/.env.example storefront/.env.local
```

Fill in the following keys in your `.env.local`:

| Variable                                    | What it does                                                      | Where to get it                                                                                                                                                                                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`               | Razorpay public key for payments                                  | **Razorpay Dashboard → Settings → API Keys**                                                                                                                                                                                                    |
| `NEXT_PUBLIC_STORE_URL`                     | URL of the store (dev: `http://localhost:3000`)                   | Type it yourself                                                                                                                                                                                                                                |
| `ADMIN_PASSWORD`                            | Password for the admin panel                                      | Choose a strong password                                                                                                                                                                                                                        |
| `GMAIL_USER`                                | Gmail address that sends emails                                   | Your Gmail address                                                                                                                                                                                                                              |
| `GMAIL_APP_PASSWORD`                        | App password for Gmail (no 2FA prompt)                            | **Google → Security → App passwords**                                                                                                                                                                                                           |
| `EMAIL_FROM_NAME`                           | Friendly sender name                                              | Anything you like                                                                                                                                                                                                                               |
| `GOOGLE_SHEET_ID`                           | ID of the Google Sheet used as the DB                             | Open the sheet → **File → Share → Get link** – the part after `/d/`                                                                                                                                                                             |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`              | Service‑account email for Sheets API                              | **Google Cloud → IAM → Service Accounts → Create**                                                                                                                                                                                              |
| `GOOGLE_PRIVATE_KEY`                        | Private key of the service account (the whole key block)          | Same service‑account creation – download JSON and copy the `private_key` value                                                                                                                                                                  |
| `NEXTAUTH_SECRET`                           | Random secret for JWT signing                                     | `openssl rand -base64 32`                                                                                                                                                                                                                       |
| `NEXTAUTH_URL`                              | URL of the app (dev: `http://localhost:3000`)                     | Same as store URL                                                                                                                                                                                                                               |
| `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` | OAuth client for “Login with Google”                              | **Google Cloud → APIs & Services → Credentials → Create OAuth client ID → Web application** – add `http://localhost:3000` to _Authorized JavaScript origins_ and `http://localhost:3000/api/auth/callback/google` to _Authorized redirect URIs_ |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`            | reCAPTCHA v3 site key – **very important** for the contact form   | **Google reCAPTCHA → Admin console → + → Choose “reCAPTCHA v3”, Domain: `localhost`**                                                                                                                                                           |
| `RECAPTCHA_SECRET_KEY`                      | reCAPTCHA secret key                                              | Same page as above                                                                                                                                                                                                                              |
| `RECAPTCHA_MIN_SCORE`                       | Minimum reCAPTCHA score before blocking (dev: `0.3`, prod: `0.5`) | Set as shown                                                                                                                                                                                                                                    |

> **NOTE:** Keep the surrounding triple quotes around `GOOGLE_PRIVATE_KEY`. Do **not** add extra spaces.

#### 4️⃣ Install dependencies
Navigate to the storefront directory and install dependencies:
```bash
cd storefront
npm install
```

#### 5️⃣ Run the development server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

#### 6️⃣ Stripe for localhost (Optional):
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### ☁️ Deployment
1. Sign up at https://vercel.com and import the repo.
2. Add all the environment variables from step 3 as **Vercel Environment Variables** (keep `NEXT_PUBLIC_` keys public, the rest secret).
3. Deploy! Vercel will build the app automatically.
4. After deployment, go back to the Google reCAPTCHA console, add your new domain, and replace the site/secret keys in Vercel.
5. Raise `RECAPTCHA_MIN_SCORE` to `0.5` (or higher) for production.
