const express = require('express');
const db = require('../database/db.js');

const router = express.Router();

// Vista principal de la obra
router.get('/', (req, res, next) => {
    res.render('obra', { pageTitle: 'Obra Colectiva' });
});

// Devuelve todas las imágenes guardadas para el sketch.
router.get('/data', (req, res, next) => {
    const data = db.getSketchData();
    res.send(data);
});

module.exports = router;