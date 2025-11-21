// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Brak loginu lub hasła' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, password_hash, role FROM public.users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ message: 'Nieprawidłowe dane logowania' });
    }

    const user = result.rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res
        .status(401)
        .json({ message: 'Nieprawidłowe dane logowania' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (e) {
    console.error('Błąd serwera przy logowaniu:', e);
    return res
      .status(500)
      .json({ message: 'Błąd serwera przy logowaniu' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  return res.status(200).json({ user: req.user });
});

// PUT /api/auth/change-password
router.put('/change-password', authenticate, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: 'Podaj stare i nowe hasło' });
  }

  try {
    const result = await pool.query(
      'SELECT password_hash FROM public.users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'Użytkownik nie istnieje' });
    }

    const ok = await bcrypt.compare(
      oldPassword,
      result.rows[0].password_hash
    );
    if (!ok) {
      return res
        .status(400)
        .json({ message: 'Stare hasło nieprawidłowe' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE public.users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, req.user.id]
    );

    return res.status(204).send();
  } catch (e) {
    console.error('Błąd serwera przy zmianie hasła:', e);
    return res
      .status(500)
      .json({ message: 'Błąd serwera przy zmianie hasła' });
  }
});

module.exports = router;
