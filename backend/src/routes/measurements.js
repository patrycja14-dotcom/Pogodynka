// backend/src/routes/measurements.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// helper – walidacja zakresu min/max
async function validateValue(seriesId, value) {
  const result = await db.query(
    'SELECT min_value, max_value FROM measurement_series WHERE id = $1',
    [seriesId]
  );
  if (result.rows.length === 0) {
    const e = new Error('SERIES_NOT_FOUND');
    throw e;
  }
  const { min_value, max_value } = result.rows[0];
  if (value < min_value || value > max_value) {
    const e = new Error('OUT_OF_RANGE');
    e.range = { min_value, max_value };
    throw e;
  }
}

// GET /api/measurements?seriesId=1,2&from=...&to=...
// (publiczny – żeby frontend mógł pobierać dane wykresu)
router.get('/', async (req, res) => {
  try {
    const { seriesId, from, to } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (seriesId) {
      const ids = seriesId
        .split(',')
        .map(x => parseInt(x, 10))
        .filter(Boolean);
      if (ids.length > 0) {
        conditions.push(`series_id = ANY($${idx}::int[])`);
        params.push(ids);
        idx++;
      }
    }
    if (from) {
      conditions.push(`timestamp >= $${idx}`);
      params.push(from);
      idx++;
    }
    if (to) {
      conditions.push(`timestamp <= $${idx}`);
      params.push(to);
      idx++;
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const result = await db.query(
      `SELECT * FROM measurements ${where} ORDER BY timestamp ASC`,
      params
    );

    res.status(200).json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Błąd pobierania pomiarów' });
  }
});

// POST /api/measurements (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { series_id, timestamp, value } = req.body;
  try {
    await validateValue(series_id, value);
    const result = await db.query(
      `INSERT INTO measurements (series_id, timestamp, value)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [series_id, timestamp, value]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    if (e.message === 'SERIES_NOT_FOUND') {
      return res.status(404).json({ message: 'Seria nie istnieje' });
    }
    if (e.message === 'OUT_OF_RANGE') {
      return res.status(400).json({
        message: 'Wartość poza zakresem dla serii',
        allowed_range: e.range
      });
    }
    console.error(e);
    res.status(500).json({ message: 'Błąd dodawania pomiaru' });
  }
});

// PUT /api/measurements/:id (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { series_id, timestamp, value } = req.body;
  try {
    await validateValue(series_id, value);
    const result = await db.query(
      `UPDATE measurements
       SET series_id = $1, timestamp = $2, value = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [series_id, timestamp, value, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pomiar nie znaleziony' });
    }
    res.status(200).json(result.rows[0]);
  } catch (e) {
    if (e.message === 'SERIES_NOT_FOUND') {
      return res.status(404).json({ message: 'Seria nie istnieje' });
    }
    if (e.message === 'OUT_OF_RANGE') {
      return res.status(400).json({
        message: 'Wartość poza zakresem dla serii',
        allowed_range: e.range
      });
    }
    console.error(e);
    res.status(500).json({ message: 'Błąd edycji pomiaru' });
  }
});

// DELETE /api/measurements/:id (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM measurements WHERE id = $1',
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Pomiar nie znaleziony' });
    }
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Błąd usuwania pomiaru' });
  }
});

module.exports = router;