require('dotenv').config();
const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect().then(async () => {
  await c.query("INSERT INTO region (id, name, currency_code, tax_rate) VALUES ('reg_default123', 'Default Region', 'usd', 0) ON CONFLICT DO NOTHING");
  await c.query("INSERT INTO region_payment_providers (region_id, provider_id) VALUES ('reg_default123', 'manual') ON CONFLICT DO NOTHING");
  await c.query("INSERT INTO region_fulfillment_providers (region_id, provider_id) VALUES ('reg_default123', 'manual') ON CONFLICT DO NOTHING");
  console.log('Region created');
}).catch(e => console.error(e)).finally(() => c.end());
