// backend/src/routes/series.js 
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/series  – lista serii (PUBLICZNA)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, description, min_value, max_value, color, icon FROM measurement_series ORDER BY id',
      []
    );
    res.status(200).json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Błąd serwera przy pobieraniu serii' });
  }
});

// POST /api/series – tworzenie nowej serii (tylko admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, description, min_value, max_value, color, icon } = req.body;

  if (!name || min_value === undefined || max_value === undefined) {
    return res.status(400).json({ message: 'Brak wymaganych pól' });
  }

  try {
    const result = await db.query(
      `INSERT INTO measurement_series (name, description, min_value, max_value, color, icon)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, min_value, max_value, color, icon`,
      [name, description || '', min_value, max_value, color || '#007bff', icon || 'circle']
    );

    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Błąd serwera przy dodawaniu serii' });
  }
});

module.exports = router;