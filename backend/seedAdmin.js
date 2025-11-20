// backend/seedAdmin.js
const bcrypt = require('bcrypt');
const db = require('./src/db');

async function seed() {
  try {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    // Upewniamy się, że tabela istnieje (jeśli odpalisz bez wcześniejszego SQL-a, też zadziała)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        username      VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255)      NOT NULL,
        role          VARCHAR(20)       NOT NULL DEFAULT 'admin',
        created_at    TIMESTAMP         NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMP         NOT NULL DEFAULT NOW()
      );
    `);

    await db.query(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING`,
      ['admin', hash, 'admin']
    );

    console.log('Użytkownik admin/admin123 gotowy (albo już istniał).');
    process.exit(0);
  } catch (err) {
    console.error('Błąd podczas seedowania użytkownika:', err);
    process.exit(1);
  }
}

seed();