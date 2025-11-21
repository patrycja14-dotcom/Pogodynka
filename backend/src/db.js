// backend/src/db.js
const { Pool } = require('pg');

console.log('DATABASE_URL in db.js:', process.env.DATABASE_URL ?? '(BRAK)');

const config = {};

if (process.env.DATABASE_URL) {
  config.connectionString = process.env.DATABASE_URL;
  // Render Postgres wymaga SSL
  config.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(config);

module.exports = pool;