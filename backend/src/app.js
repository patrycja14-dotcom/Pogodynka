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

// CORS – frontend na porcie 5173
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_ORIGIN,
}));

app.use(express.json());

// test backendu
app.get('/', (req, res) => {
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