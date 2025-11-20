// backend/src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { PORT } = require('./config');

// import istniejących tras
const authRoutes = require('./routes/auth');
const seriesRoutes = require('./routes/series');
const sensorsRoutes = require('./routes/sensors');
const measurementsRoutes = require('./routes/measurements');

const app = express();

// Dozwolone originy frontendu (dev + produkcja)
const allowedOrigins = [
  'http://localhost:5173',
  'https://pogodynka-frontend.onrender.com',
];

// CORS
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// JSON z body
app.use(express.json());

// test backendu (healthcheck)
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Pogodynka backend działa!' });
});

// REST API
app.use('/api/auth', authRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/sensors', sensorsRoutes);
app.use('/api/measurements', measurementsRoutes);

// start serwera
app.listen(PORT, () => {
  console.log(`Backend nasłuchuje na porcie ${PORT}`);
});