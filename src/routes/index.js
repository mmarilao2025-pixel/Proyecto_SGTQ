const express = require('express');
const path = require('path');

const router = express.Router();

/**
 * Rutas para servir archivos estáticos del frontend
 */

// Ruta raíz
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Cualquier otra ruta SPA
router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

module.exports = router;
