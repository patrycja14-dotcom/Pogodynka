// backend/src/db.js
const { Pool } = require('pg');

// pgAdmin
const pool = new Pool({
  user: 'postgres',        // użytkownik z pgAdmin
  host: 'localhost',
  database: 'pomiary_db',  // baza
  password: 'postgres',    // HASŁO do użytkownika postgres
  port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
