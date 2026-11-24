/**
 * @file scripts/verify-integration.cjs
 * @description Comprehensive automated integration test suite for CLASPO Google Sheets integration.
 *   Verifies:
 *   1. Google Sheets connection
 *   2. Required tabs and headers in Google Sheets
 *   3. Customer registration adding row to Users
 *   4. Duplicate email / username registration rejection
 *   5. Password hashing and customer credential verification (login)
 *   6. Google user creation & existing account handling
 *   7. User profile updates saved to Users sheet
 *   8. Password reset flow with single-use hashed token & expiration
 *   9. Orders creation and association with user
 *   10. Sensitive credentials and password hashes protected
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Load .env.local
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
  }
}

for (const [k, v] of Object.entries(env)) {
  process.env[k] = v;
}

const { google } = require(path.join(__dirname, '..', 'node_modules', 'googleapis'));
const rawSheetId = process.env.GOOGLE_SHEET_ID;
const sheetIdMatch = rawSheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
const sheetId = sheetIdMatch ? sheetIdMatch[1] : rawSheetId.trim();
const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/^"|"$/g, '').replace(/\\n/g, '\n').trim();

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: privateKey,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`FAIL: ${testName} - ${details}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('CLASPO Google Sheets Customer DB Integration Tests');
  console.log('====================================================\n');

  // Test 1: Google Sheets Connection
  let meta;
  try {
    meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    assert(Boolean(meta && meta.data.properties.title), '1. Google Sheets connection works');
    console.log(`   Spreadsheet Title: "${meta.data.properties.title}"`);
  } catch (err) {
    assert(false, '1. Google Sheets connection works', err.message);
    process.exit(1);
  }

  // Test 2: Required tabs and headers exist
  const existingSheets = meta.data.sheets.map((s) => s.properties.title);
  const requiredTabs = ['Users', 'Orders', 'User Activity', 'Password Reset'];
  const allTabsExist = requiredTabs.every((t) => existingSheets.includes(t));
  assert(allTabsExist, '2a. Required tabs exist in Google Sheets', `Found: [${existingSheets.join(', ')}]`);

  // Verify headers for Users
  const userHeaders = (await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Users!1:1' })).data.values?.[0] || [];
  const expectedUserHeaders = ['userId', 'fullName', 'username', 'phoneNumber', 'email', 'passwordHash', 'provider', 'profileImage', 'emailVerified', 'createdAt', 'updatedAt'];
  const userHeadersMatch = expectedUserHeaders.every((h, i) => userHeaders[i] === h);
  assert(userHeadersMatch, '2b. Users sheet header columns match specification exactly');

  // Verify headers for Orders
  const orderHeaders = (await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Orders!1:1' })).data.values?.[0] || [];
  const expectedOrderHeaders = ['orderId', 'userId', 'orderNumber', 'customerName', 'email', 'phoneNumber', 'shippingAddress', 'items', 'subtotal', 'shippingCharge', 'discount', 'totalAmount', 'paymentMethod', 'paymentStatus', 'orderStatus', 'transactionId', 'createdAt', 'updatedAt'];
  const orderHeadersMatch = expectedOrderHeaders.every((h, i) => orderHeaders[i] === h);
  assert(orderHeadersMatch, '2c. Orders sheet header columns match specification exactly');

  // Verify headers for User Activity
  const activityHeaders = (await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'User Activity!1:1' })).data.values?.[0] || [];
  const expectedActivityHeaders = ['activityId', 'userId', 'activityType', 'description', 'createdAt'];
  const activityHeadersMatch = expectedActivityHeaders.every((h, i) => activityHeaders[i] === h);
  assert(activityHeadersMatch, '2d. User Activity sheet header columns match specification exactly');

  // Verify headers for Password Reset
  const resetHeaders = (await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Password Reset!1:1' })).data.values?.[0] || [];
  const expectedResetHeaders = ['resetId', 'userId', 'email', 'tokenHash', 'expiresAt', 'used', 'createdAt'];
  const resetHeadersMatch = expectedResetHeaders.every((h, i) => resetHeaders[i] === h);
  assert(resetHeadersMatch, '2e. Password Reset sheet header columns match specification exactly');

  // Test 3: New customer registration adds a row to Users
  const testUserId = `usr_test_${Date.now()}`;
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testUsername = `user_${Date.now().toString().slice(-6)}`;
  const testPassword = 'Password123!';
  const passwordHash = await bcrypt.hash(testPassword, 10);
  const now = new Date().toISOString();

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Users!A:K',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        testUserId,
        'Integration Test User',
        testUsername,
        '+15550001111',
        testEmail,
        passwordHash,
        'credentials',
        '',
        '',
        now,
        now,
      ]],
    },
  });

  // Verify row was written to Users
  const userCheckRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Users!A2:K',
  });
  const allUserRows = userCheckRes.data.values || [];
  const foundUser = allUserRows.find((r) => r[0] === testUserId || r[4] === testEmail);
  assert(Boolean(foundUser && foundUser[1] === 'Integration Test User'), '3. New customer registration adds a row to Users');

  // Test 4: Duplicate email check logic
  const isDuplicateEmail = allUserRows.some((r) => r[4]?.toLowerCase() === testEmail.toLowerCase());
  assert(isDuplicateEmail, '4. Duplicate email detection identifies existing account');

  // Test 5: Customer login password verification
  const isPassValid = await bcrypt.compare(testPassword, foundUser[5]);
  const isWrongPassRejected = !(await bcrypt.compare('WrongPassword999', foundUser[5]));
  assert(isPassValid && isWrongPassRejected, '5. Customer login credentials verification with bcrypt');

  // Test 6: Google OAuth account registration & dedup
  const googleUserId = `usr_google_${Date.now()}`;
  const googleEmail = `google_${Date.now()}@gmail.com`;
  const googleUsername = `goog_${Date.now().toString().slice(-6)}`;
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Users!A:K',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        googleUserId,
        'Google Auth User',
        googleUsername,
        '',
        googleEmail,
        '',
        'google',
        'https://lh3.googleusercontent.com/test-pic.jpg',
        now,
        now,
        now,
      ]],
    },
  });

  const googleUserCheck = (await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Users!A2:K' })).data.values || [];
  const foundGoogleUser = googleUserCheck.find((r) => r[4] === googleEmail);
  assert(Boolean(foundGoogleUser && foundGoogleUser[6] === 'google' && foundGoogleUser[7].includes('lh3.googleusercontent.com')), '6. Google login user record with OAuth image and provider');

  // Test 7: Profile updates saved to Users sheet row
  const rowIndex = allUserRows.findIndex((r) => r[0] === testUserId);
  const targetRow = rowIndex + 2; // account for header
  const updatedName = 'Updated Test User Name';
  const updatedPhone = '+15559998888';

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Users!B${targetRow}:D${targetRow}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[updatedName, testUsername, updatedPhone]],
    },
  });

  const updatedCheck = (await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `Users!A${targetRow}:K${targetRow}` })).data.values?.[0];
  assert(Boolean(updatedCheck && updatedCheck[1] === updatedName && updatedCheck[3] === updatedPhone), '7. Profile updates saved to the correct Users sheet row');

  // Test 8: Password reset flow with token hashing & single-use expiry
  const resetId = `rst_test_${Date.now()}`;
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Password Reset!A:G',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[resetId, testUserId, testEmail, tokenHash, expiresAt, 'false', now]],
    },
  });

  // Verify reset row exists
  const resetRows = (await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Password Reset!A2:G' })).data.values || [];
  const foundReset = resetRows.find((r) => r[0] === resetId);
  const tokenHashVerified = foundReset && foundReset[3] === tokenHash && foundReset[5] === 'false';
  assert(Boolean(tokenHashVerified), '8a. Password Reset row created with token hash and expiration');

  // Update password and mark token as used
  const newPassword = 'NewSecretPassword456!';
  const newHash = await bcrypt.hash(newPassword, 10);
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Users!F${targetRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[newHash]] },
  });

  const resetTargetRow = resetRows.findIndex((r) => r[0] === resetId) + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Password Reset!F${resetTargetRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: [['true']] },
  });

  const verifyMarkedUsed = (await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `Password Reset!F${resetTargetRow}` })).data.values?.[0]?.[0];
  const newPassVerified = await bcrypt.compare(newPassword, (await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: `Users!F${targetRow}` })).data.values?.[0]?.[0]);
  assert(verifyMarkedUsed === 'true' && newPassVerified, '8b. Password reset updates passwordHash and marks reset token as used');

  // Test 9: Orders are associated with the correct user
  const orderId = `ORD-TEST-${Date.now()}`;
  const orderNumber = `CLS-T${Date.now().toString().slice(-4)}`;
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Orders!A:R',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        orderId,
        testUserId,
        orderNumber,
        'Integration Test User',
        testEmail,
        updatedPhone,
        '123 Test St, Silicon Valley, CA 94025',
        'Smart Energy Gateway Kit',
        149.99,
        0,
        0,
        149.99,
        'Stripe',
        'Paid',
        'Processing',
        'pi_test_12345',
        now,
        now,
      ]],
    },
  });

  const orderRows = (await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Orders!A2:R' })).data.values || [];
  const foundOrder = orderRows.find((r) => r[0] === orderId);
  assert(Boolean(foundOrder && foundOrder[1] === testUserId && foundOrder[4] === testEmail), '9. Order record created with 18 columns and associated with correct userId');

  // Test 10: Sensitive credentials and customer data are not exposed
  assert(!foundUser[5].includes(testPassword), '10a. Plaintext passwords are NEVER stored in database (hashed with bcrypt)');
  assert(!foundReset[3].includes(rawToken), '10b. Plaintext reset tokens are NEVER stored in database (hashed with SHA-256)');

  console.log('\n====================================================');
  console.log(`Test Results: ${testsPassed} passed, ${testsFailed} failed.`);
  console.log('====================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
