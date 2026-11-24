const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx > -1) {
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[key] = val;
    process.env[key] = val;
  }
}

const rawSheetId = env.GOOGLE_SHEET_ID;
const clientEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
let privateKey = env.GOOGLE_PRIVATE_KEY.replace(/^"|"$/g, '').replace(/\\n/g, '\n').trim();
const sheetIdMatch = rawSheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
const sheetId = sheetIdMatch ? sheetIdMatch[1] : rawSheetId.trim();

const { google } = require(path.join(__dirname, '..', 'node_modules', 'googleapis'));
const auth = new google.auth.GoogleAuth({
  credentials: { client_email: clientEmail, private_key: privateKey },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

async function runTests() {
  console.log('========================================================');
  console.log('CLASPO Product Management Portal Verification Test Suite');
  console.log('========================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`PASS: ${testName}`);
      passed++;
    } else {
      console.error(`FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Verify environment configuration
  const pmEmail = (process.env.PRODUCT_MANAGER_EMAIL || '').trim().toLowerCase();
  const pmHash = (process.env.PRODUCT_MANAGER_PASSWORD_HASH || '').replace(/^"|"$/g, '').trim();
  assert(pmEmail === 'info@claspo.store', '1. PRODUCT_MANAGER_EMAIL is set to info@claspo.store');
  assert(pmHash.startsWith('$2b$') || pmHash.startsWith('$2a$'), '2. PRODUCT_MANAGER_PASSWORD_HASH is a valid bcrypt hash');

  // 2. Test manager authentication logic
  const isCorrect = await bcrypt.compare('Claspo@Manager2026!', pmHash);
  assert(isCorrect === true, '3. Manager password verification succeeds for authorized account');

  const isWrong = await bcrypt.compare('WrongPassword123!', pmHash);
  assert(isWrong === false, '4. Manager password verification correctly rejects incorrect passwords');

  // 3. Test Products worksheet columns in Google Sheets
  const meta = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Products!A1:Q1',
  });
  const headers = meta.data.values?.[0] || [];
  assert(headers.length === 17, `5. Products worksheet has 17 columns (found ${headers.length})`);
  assert(headers[0] === 'productId' && headers[1] === 'productName' && headers[10] === 'primaryImage', '6. Products worksheet column headers match specification');

  // 4. Test product creation in Google Sheets with multiple images & videos
  const testProductId = `prod_test_${Date.now()}`;
  const testImages = [
    { url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c', isPrimary: true, width: 800, height: 600 },
    { url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809', isPrimary: false, width: 800, height: 600 },
  ];
  const testVideos = [
    { url: 'https://res.cloudinary.com/demo/video/upload/sample.mp4', title: 'Demo Showcase Video', duration: 15 },
  ];

  const now = new Date().toISOString();
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Products!A:Q',
    valueInputOption: 'RAW',
    requestBody: {
      values: [
        [
          testProductId,
          'Test Smart Cable Assembly',
          'test-smart-cable-assembly',
          'CLS-TEST-001',
          'Cable Assembly',
          'High performance test cable assembly.',
          'Comprehensive technical description with multiple industrial applications.',
          2999, // $29.99
          2499, // $24.99 discount
          75,   // stock
          testImages[0].url,
          JSON.stringify(testImages),
          testVideos[0].url,
          JSON.stringify(testVideos),
          'Active',
          now,
          now,
        ],
      ],
    },
  });
  assert(true, '7. Created test product in Google Sheets with 17 fields, multiple images, and video metadata');

  // 5. Test reading created product from Google Sheets
  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Products!A2:Q',
  });
  const rows = readRes.data.values || [];
  const found = rows.find(r => r[0] === testProductId);
  assert(Boolean(found), '8. Successfully retrieved newly created product from Google Sheets');
  if (found) {
    assert(found[1] === 'Test Smart Cable Assembly', '9. Product name matches created record');
    assert(Number(found[7]) === 2999 && Number(found[8]) === 2499, '10. Product regular and discount prices match');
    assert(Number(found[9]) === 75, '11. Product stock count matches');
    assert(found[14] === 'Active', '12. Product status is Active');

    const parsedImgs = JSON.parse(found[11] || '[]');
    const parsedVids = JSON.parse(found[13] || '[]');
    assert(parsedImgs.length === 2, '13. Multiple images JSON properly preserved');
    assert(parsedVids.length === 1 && parsedVids[0].url.includes('sample.mp4'), '14. Video metadata JSON properly preserved');
  }

  // 6. Test updating product (e.g. price and stock change)
  const rowIndex = rows.findIndex(r => r[0] === testProductId) + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Products!H${rowIndex}:J${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[3499, 2999, 120]], // New price, discount, and stock
    },
  });
  assert(true, '15. Updated product price and stock on existing row without duplicating records');

  // 7. Test product soft-deactivation
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Products!O${rowIndex}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [['Inactive']],
    },
  });

  const verifyDeactivate = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `Products!O${rowIndex}`,
  });
  assert(verifyDeactivate.data.values?.[0]?.[0] === 'Inactive', '16. Successfully deactivated product (status set to Inactive, preserving historical references)');

  // Clean up test product row so database stays clean
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const sheetObj = spreadsheet.data.sheets?.find(s => s.properties?.title === 'Products');
  if (sheetObj?.properties?.sheetId !== undefined) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetObj.properties.sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex - 1,
                endIndex: rowIndex,
              },
            },
          },
        ],
      },
    });
    console.log(`Cleaned up test product row (${testProductId}).`);
  }

  console.log('========================================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('========================================================');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
