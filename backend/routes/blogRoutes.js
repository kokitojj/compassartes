const express = require('express');
const pool = require('../config/db');
const { protect: authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// --- CREATE ---
// POST /api/blog - Crear un nuevo post (protegido)
router.post('/', authenticateToken, async (req, res) => {
  const { titulo, contenido, seccion_id } = req.body;
  const artista_id = req.user.id;
  if (!titulo || !contenido)
    return res
      .status(400)
      .json({ error: 'Título y contenido son requeridos.' });

  try {
    const newPost = await pool.query(
      'INSERT INTO blog_posts (artista_id, titulo, contenido, seccion_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [artista_id, titulo, contenido, seccion_id]
    );
    res.status(201).json(newPost.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el post.' });
  }
});

// --- READ ---
// GET /api/blog - Obtener todos los posts (público)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT b.*, u.full_name FROM blog_posts b JOIN users u ON b.artista_id = u.id ORDER BY b.fecha_publicacion DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los posts.' });
  }
});

// GET /api/blog/:id - Obtener un post por ID (público)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT b.*, u.full_name FROM blog_posts b JOIN users u ON b.artista_id = u.id WHERE b.id = $1',
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Post no encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el post.' });
  }
});

// --- UPDATE ---
// PUT /api/blog/:id - Actualizar un post (protegido)
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { titulo, contenido, seccion_id } = req.body;
  const artista_id = req.user.id;

  try {
    const postResult = await pool.query(
      'SELECT * FROM blog_posts WHERE id = $1',
      [id]
    );
    if (postResult.rows.length === 0)
      return res.status(404).json({ error: 'Post no encontrado.' });
    if (postResult.rows[0].artista_id !== artista_id)
      return res.status(403).json({ error: 'No autorizado.' });

    const updatedPost = await pool.query(
      'UPDATE blog_posts SET titulo = $1, contenido = $2, seccion_id = $3 WHERE id = $4 RETURNING *',
      [titulo, contenido, seccion_id, id]
    );
    res.json(updatedPost.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el post.' });
  }
});

// --- DELETE ---
// DELETE /api/blog/:id - Borrar un post (protegido)
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const artista_id = req.user.id;

  try {
    const postResult = await pool.query(
      'SELECT * FROM blog_posts WHERE id = $1',
      [id]
    );
    if (postResult.rows.length === 0)
      return res.status(404).json({ error: 'Post no encontrado.' });
    if (postResult.rows[0].artista_id !== artista_id)
      return res.status(403).json({ error: 'No autorizado.' });

    await pool.query('DELETE FROM blog_posts WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error al borrar el post.' });
  }
});

module.exports = router;
