const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Ruta principal del capítulo 3
router.get('/', (req, res) => {
    res.render('capitulo3/index');
});

// Rutas para cada sección
router.get('/3.1', (req, res) => {
    res.render('capitulo3/3.1');
});

router.get('/3.2', (req, res) => {
    res.render('capitulo3/3.2');
});

router.get('/3.3', (req, res) => {
    res.render('capitulo3/3.3');
});

router.get('/3.4', (req, res) => {
    res.render('capitulo3/3.4');
});

router.get('/3.5', (req, res) => {
    res.render('capitulo3/3.5');
});

router.get('/3.6', (req, res) => {
    res.render('capitulo3/3.6');
});

router.get('/3.7', (req, res) => {
    res.render('capitulo3/3.7');
});

router.get('/3.8', (req, res) => {
    res.render('capitulo3/3.8');
});

router.get('/3.9', (req, res) => {
    res.render('capitulo3/3.9');
});

router.get('/3.10', (req, res) => {
    res.render('capitulo3/3.10');
});

// Rutas para edición de contenido (protegidas por autenticación)
router.post('/edit/:section', isAuthenticated, async (req, res) => {
    try {
        const { section } = req.params;
        const { content } = req.body;
        
        // Aquí iría la lógica para guardar el contenido editado en la base de datos
        // Por ejemplo:
        // await Content.updateOne({ section }, { content });
        
        res.json({ success: true, message: 'Contenido actualizado correctamente' });
    } catch (error) {
        console.error('Error al editar contenido:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el contenido' });
    }
});

module.exports = router; 