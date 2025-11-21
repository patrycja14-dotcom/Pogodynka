// backend/src/initUsersTable.js
require('dotenv').config();
const pool = require('./db');

async function main() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    // 1. Tworzymy tabelę users jeśli nie istnieje
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('Tabela users OK.');

    // 2. Wstawiamy / aktualizujemy admina (hasło: admin123)
    const adminHash =
      '$2b$12$zaUmHfFciX1oz9TWBqJHg.DSj8xDWWDW5OI0WMdWMvQ5UiZlvymmC';

    await pool.query(
      `
      INSERT INTO users (username, password_hash, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (username) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          updated_at = NOW();
    `,
      ['admin', adminHash, 'admin']
    );

    console.log('Admin admin/admin123 jest w bazie.');
  } catch (err) {
    console.error('Błąd w initUsersTable:', err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();