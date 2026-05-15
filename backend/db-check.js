const { Client } = require('pg');

async function checkDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();

  try {
    const stores = await client.query('SELECT * FROM store');
    console.log('Stores:', stores.rows.length);

    const channels = await client.query('SELECT * FROM sales_channel');
    console.log('Sales Channels:', channels.rows.length);

    const regions = await client.query('SELECT * FROM region');
    console.log('Regions:', regions.rows.length);
  } catch(e) {
    console.error(e.message);
  } finally {
    await client.end();
  }
}

require('dotenv').config();
checkDb();
