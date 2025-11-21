// backend/src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { PORT } = require('./config');

// import tras
const authRoutes = require('./routes/auth');
const seriesRoutes = require('./routes/series');
const sensorsRoutes = require('./routes/sensors');
const measurementsRoutes = require('./routes/measurements');

const app = express();

// CORS – na razie globalnie, żeby nie było błędów CORS
app.use(cors());

// JSON body
app.use(express.json());

// test backendu
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