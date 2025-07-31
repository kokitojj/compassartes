const express = require('express');
const pool = require('../config/db');
const { protect: authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// --- GET /api/artistas/mis-obras ---
// Devuelve todas las obras del artista actualmente autenticado.
router.get('/mis-obras', authenticateToken, async (req, res) => {
  // El ID del usuario se obtiene del token JWT verificado por el middleware.
  const artista_id = req.user.id;
  try {
    const result = await pool.query(
      'SELECT * FROM obras WHERE artista_id = $1 ORDER BY fecha_subida DESC',
      [artista_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las obras.' });
  }
});

// --- GET /api/artistas/mis-posts ---
// Devuelve todos los posts del blog del artista actualmente autenticado.
router.get('/mis-posts', authenticateToken, async (req, res) => {
  const artista_id = req.user.id;
  try {
    const result = await pool.query(
      'SELECT * FROM blog_posts WHERE artista_id = $1 ORDER BY fecha_publicacion DESC',
      [artista_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las entradas del blog.' });
  }
});

module.exports = router;
