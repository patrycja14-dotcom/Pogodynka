// backend/src/routes/sensors.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/sensors
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.id, s.series_id, s.name, s.location, s.unit, s.api_key, s.is_active,
              ms.name AS series_name
       FROM sensors s
       JOIN measurement_series ms ON s.series_id = ms.id
       ORDER BY s.id`
    );
    res.status(200).json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Błąd pobierania sensorów' });
  }
});

// POST /api/sensors
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    // pole z body
    const { series_id, name, location, unit } = req.body;

    // prosta walidacja
    if (!series_id || !name || !unit) {
      return res.status(400).json({ message: 'Brak wymaganych pól' });
    }

    const apiKey = crypto.randomBytes(16).toString('hex');

    const result = await db.query(
      `INSERT INTO sensors (series_id, name, location, unit, api_key, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [Number(series_id), name, location || null, unit, apiKey, true]
    );

    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Błąd dodawania sensora' });
  }
});

// możesz mieć też PUT/DELETE poniżej – zostaw je jak były

// POST /api/sensors/:id/measurements
// Endpoint dla fizycznego sensora (autoryzacja przez X-API-KEY)
router.post('/:id/measurements', async (req, res) => {
  const sensorId = parseInt(req.params.id, 10);
  const apiKey = req.header('x-api-key');
  const { value, timestamp } = req.body;

  if (Number.isNaN(sensorId)) {
    return res.status(400).json({ message: 'Nieprawidłowe ID sensora' });
  }

  if (!apiKey) {
    return res.status(401).json({ message: 'Brak nagłówka X-API-KEY' });
  }

  if (typeof value !== 'number') {
    return res.status(400).json({ message: 'Pole "value" musi być liczbą' });
  }

  try {
    // 1. Sprawdź, czy sensor istnieje i czy api_key się zgadza
    const sensorResult = await db.query(
      'SELECT id, series_id, is_active FROM sensors WHERE id = $1 AND api_key = $2',
      [sensorId, apiKey]
    );

    if (sensorResult.rows.length === 0) {
      return res.status(401).json({ message: 'Niepoprawny sensor lub api_key' });
    }

    const sensor = sensorResult.rows[0];

    if (sensor.is_active === false) {
      return res.status(403).json({ message: 'Sensor jest nieaktywny' });
    }

    // 2. Przygotuj znacznik czasu – jeśli nie przyszedł z payloadu, użyj NOW()
    const ts = timestamp ? new Date(timestamp) : new Date();

    // 3. Zapisz pomiar w tabeli measurements
    await db.query(
      'INSERT INTO measurements (series_id, timestamp, value) VALUES ($1, $2, $3)',
      [sensor.series_id, ts, value]
    );

    return res.status(201).json({ message: 'Pomiar z sensora zapisany' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Błąd zapisu pomiaru z sensora' });
  }
});

module.exports = router;