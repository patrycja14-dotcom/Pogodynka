// backend/src/db.js
const { Pool } = require('pg');

const config = {};

if (process.env.DATABASE_URL) {
  config.connectionString = process.env.DATABASE_URL;
  config.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(config);

module.exports = pool;