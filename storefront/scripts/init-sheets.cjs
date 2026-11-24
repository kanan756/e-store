/**
 * @file scripts/init-sheets.cjs
 * @description Server-side setup script to automatically initialize Google Sheets
 *   tabs and column headers for the CLASPO E-Commerce application.
 *
 *   Usage:
 *     node scripts/init-sheets.cjs
 */

const fs = require('fs');
const path = require('path');

// 1. Load environment variables from .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envExamplePath = path.join(__dirname, '..', '.env.example');

const envFileToRead = fs.existsSync(envLocalPath) ? envLocalPath : envExamplePath;
console.log(`Loading environment configuration from: ${path.basename(envFileToRead)}`);

const envContent = fs.readFileSync(envFileToRead, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx > -1) {
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

const rawSheetId = env.GOOGLE_SHEET_ID;
const clientEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
let privateKey = env.GOOGLE_PRIVATE_KEY;

if (!rawSheetId || !clientEmail || !privateKey) {
  console.error('Error: Missing GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, or GOOGLE_PRIVATE_KEY.');
  process.exit(1);
}

const sheetIdMatch = rawSheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
const sheetId = sheetIdMatch ? sheetIdMatch[1] : rawSheetId.trim();
privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n').trim();

// 2. Initialize Google Auth
const { google } = require(path.join(__dirname, '..', 'node_modules', 'googleapis'));
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const REQUIRED_SHEETS = {
  Users: [
    'userId',
    'fullName',
    'username',
    'phoneNumber',
    'email',
    'passwordHash',
    'provider',
    'profileImage',
    'emailVerified',
    'createdAt',
    'updatedAt',
  ],
  Orders: [
    'orderId',
    'userId',
    'orderNumber',
    'customerName',
    'email',
    'phoneNumber',
    'shippingAddress',
    'items',
    'subtotal',
    'shippingCharge',
    'discount',
    'totalAmount',
    'paymentMethod',
    'paymentStatus',
    'orderStatus',
    'transactionId',
    'createdAt',
    'updatedAt',
  ],
  'User Activity': [
    'activityId',
    'userId',
    'activityType',
    'description',
    'createdAt',
  ],
  'Password Reset': [
    'resetId',
    'userId',
    'email',
    'tokenHash',
    'expiresAt',
    'used',
    'createdAt',
  ],
  Products: [
    'name',
    'category',
    'description',
    'imageUrl',
    'price',
    'handle',
    'inStock',
    'partNumber',
  ],
  Blogs: [
    'title',
    'keywords',
    'slug',
    'publishDate',
    'content',
    'metaDescription',
    'imageUrl',
    'published',
  ],
  Inquiries: [
    'id',
    'name',
    'email',
    'subject',
    'message',
    'submittedAt',
    'status',
  ],
  Quotes: [
    'id',
    'name',
    'email',
    'phone',
    'company',
    'application',
    'quantity',
    'description',
    'submittedAt',
    'status',
    'hasAttachment',
  ],
  Subscribers: [
    'id',
    'email',
    'source',
    'submittedAt',
    'status',
  ],
};

async function run() {
  console.log(`Connecting to Google Spreadsheet (ID: ${sheetId})...`);
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const spreadsheetTitle = meta.data.properties.title;
  console.log(`Connected to: "${spreadsheetTitle}"`);

  const existingSheets = meta.data.sheets || [];
  const existingTitles = new Set(existingSheets.map((s) => s.properties?.title || ''));
  console.log('Existing tabs found:', Array.from(existingTitles));

  const toCreate = Object.keys(REQUIRED_SHEETS).filter((t) => !existingTitles.has(t));

  if (toCreate.length > 0) {
    console.log(`Creating missing tabs: ${toCreate.join(', ')}...`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: toCreate.map((title) => ({
          addSheet: { properties: { title } },
        })),
      },
    });
    console.log('Tabs created successfully.');
  } else {
    console.log('All required tabs already exist. Validating header rows...');
  }

  // Validate and populate headers
  for (const [title, columns] of Object.entries(REQUIRED_SHEETS)) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${title}!1:1`,
    });
    const headers = res.data.values?.[0] || [];
    if (headers.length === 0) {
      console.log(`Setting headers for tab "${title}"...`);
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${title}!A1:${String.fromCharCode(64 + columns.length)}1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [columns],
        },
      });
      console.log(`Headers set for "${title}": [${columns.join(', ')}]`);
    } else {
      console.log(`Headers already present in "${title}": [${headers.join(', ')}]`);
    }
  }

  // Remove default empty Sheet1 if present
  const sheet1 = existingSheets.find((s) => s.properties?.title === 'Sheet1');
  if (sheet1 && sheet1.properties?.sheetId !== undefined && existingSheets.length + toCreate.length > 1) {
    const s1Data = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sheet1!A1:B2',
    });
    const hasData = (s1Data.data.values?.length ?? 0) > 0;
    if (!hasData) {
      try {
        console.log('Removing default empty "Sheet1"...');
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: sheetId,
          requestBody: {
            requests: [{ deleteSheet: { sheetId: sheet1.properties.sheetId } }],
          },
        });
        console.log('"Sheet1" removed.');
      } catch (e) {
        // ignore
      }
    }
  }

  console.log('\n Google Sheets Initialization Complete!');
  console.log('The database is ready with all customer, order, activity, and authentication tables.');
}

run().catch((err) => {
  console.error('Initialization failed:', err.message || err);
  process.exit(1);
});
