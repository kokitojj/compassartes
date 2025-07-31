const express = require('express');
const pool = require('../config/db');
const { getSectionBySlug } = require('../src/controllers/sectionController');
const router = express.Router();

// --- GET /api/public/secciones/:slug ---
router.get('/secciones/:slug', getSectionBySlug);

// --- GET /api/public/obras/destacadas ---
router.get('/obras/destacadas', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT o.*, u.full_name FROM obras o JOIN users u ON o.artista_id = u.id WHERE o.destacado_portada = true ORDER BY o.fecha_subida DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener las obras destacadas:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// --- GET /api/public/artistas ---
// Devuelve una lista de todos los artistas registrados.
router.get('/artistas', async (req, res) => {
  try {
    // Seleccionamos solo la información pública necesaria
    const result = await pool.query(
      "SELECT id, full_name, to_char(created_at, 'YYYY-MM-DD') as miembro_desde FROM users WHERE role = 'player' ORDER BY full_name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la lista de artistas.' });
  }
});

// --- GET /api/public/artistas/:id ---
// Devuelve el perfil completo de un artista, incluyendo sus obras y posts.
router.get('/artistas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Obtener la información del artista
    const artistResult = await pool.query(
      'SELECT id, full_name FROM users WHERE id = $1',
      [id]
    );
    if (artistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artista no encontrado.' });
    }
    const artista = artistResult.rows[0];

    // 2. Obtener las obras del artista
    const obrasResult = await pool.query(
      'SELECT * FROM obras WHERE artista_id = $1 ORDER BY fecha_subida DESC',
      [id]
    );

    // 3. Obtener los posts del blog del artista
    const blogResult = await pool.query(
      'SELECT * FROM blog_posts WHERE artista_id = $1 ORDER BY fecha_publicacion DESC',
      [id]
    );

    // 4. Combinar todo en una sola respuesta
    res.json({
      artista,
      obras: obrasResult.rows,
      blogPosts: blogResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el perfil del artista.' });
  }
});

// --- GET /api/public/secciones - Listar todas las secciones ---
router.get('/secciones', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre_grupo, descripcion, imagen_url FROM secciones ORDER BY nombre_grupo ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener la lista de secciones:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// --- GET /api/public/secciones/:id - Obtener perfil de una sección y sus miembros ---
router.get('/secciones/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Obtener la información de la sección
    const grupoResult = await pool.query('SELECT * FROM secciones WHERE id = $1', [
      id,
    ]);
    if (grupoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sección no encontrada.' });
    }
    const grupo = grupoResult.rows[0];

    // 2. Obtener los miembros de la sección
    const miembrosResult = await pool.query(
      `
            SELECT u.id, u.full_name 
            FROM users u
            JOIN grupo_miembros gm ON u.id = gm.usuario_id
            WHERE gm.grupo_id = $1
            ORDER BY u.full_name ASC
        `,
      [id]
    );

    // 3. Combinar todo en una sola respuesta
    res.json({
      seccion: grupo,
      miembros: miembrosResult.rows,
    });
  } catch (err) {
    console.error('Error al obtener el perfil de la sección:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// --- GET /api/public/posts/latest ---
// Devuelve los 10 posts más recientes del blog.
router.get('/posts/latest', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         bp.id, 
         bp.titulo, 
         bp.contenido, 
         bp.fecha_publicacion, 
         u.full_name 
       FROM blog_posts bp
       JOIN users u ON bp.artista_id = u.id
       ORDER BY bp.fecha_publicacion DESC 
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los últimos posts:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
