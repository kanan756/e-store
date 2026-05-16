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
