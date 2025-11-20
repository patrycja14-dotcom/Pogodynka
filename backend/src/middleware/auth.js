// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const config = require('../config');   // <- poprawka. Importujemy cały obiekt

const JWT_SECRET = config.JWT_SECRET;   // <- wyciągamy secret z config

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Brak nagłówka Authorization' });
  }

  // Oczekiwany format: "Bearer token"
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Zły format nagłówka Authorization (oczekiwano: Bearer <token>)' });
  }

  const token = parts[1];

  if (!token) {
    return res.status(401).json({ message: 'Brak tokenu' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Nieprawidłowy token' });
    }

    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Brak uprawnień administratora' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };