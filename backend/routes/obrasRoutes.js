const express = require('express');
const pool = require('../config/db');
const { protect: authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/multerMiddleware');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// --- CREATE ---
// POST /api/obras - Crear una nueva obra (protegido)
router.post(
  '/',
  authenticateToken,
  upload.single('artworkImage'),
  async (req, res) => {
    const { titulo, descripcion, seccion_id } = req.body;
    const artista_id = req.user.id;
    const imagen_url = req.file.path;

    if (!titulo || !imagen_url)
      return res.status(400).json({ error: 'Título e imagen son requeridos.' });

    try {
      const newObra = await pool.query(
        'INSERT INTO obras (artista_id, titulo, descripcion, imagen_url, seccion_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [artista_id, titulo, descripcion, imagen_url, seccion_id]
      );
      res.status(201).json(newObra.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al guardar la obra.' });
    }
  }
);

// --- READ ---
// GET /api/obras - Obtener todas las obras (público)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT o.*, u.full_name FROM obras o JOIN users u ON o.artista_id = u.id ORDER BY o.fecha_subida DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las obras.' });
  }
});

// GET /api/obras/:id - Obtener una obra por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT o.*, u.full_name FROM obras o JOIN users u ON o.artista_id = u.id WHERE o.id = $1',
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Obra no encontrada.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la obra.' });
  }
});

// --- UPDATE ---
// PUT /api/obras/:id - Actualizar una obra (protegido)
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, imagen_url, seccion_id, destacado_portada } = req.body;
  const artista_id = req.user.id;

  try {
    // Verificar que el artista es el dueño de la obra
    const obraResult = await pool.query('SELECT * FROM obras WHERE id = $1', [
      id,
    ]);
    if (obraResult.rows.length === 0)
      return res.status(404).json({ error: 'Obra no encontrada.' });
    if (obraResult.rows[0].artista_id !== artista_id)
      return res
        .status(403)
        .json({ error: 'No autorizado para modificar esta obra.' });

    const updatedObra = await pool.query(
      'UPDATE obras SET titulo = $1, descripcion = $2, imagen_url = $3, seccion_id = $4, destacado_portada = $5 WHERE id = $6 RETURNING *',
      [titulo, descripcion, imagen_url, seccion_id, destacado_portada, id]
    );
    res.json(updatedObra.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la obra.' });
  }
});

// --- DELETE ---
// DELETE /api/obras/:id - Borrar una obra (protegido)
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const artista_id = req.user.id;

  try {
    // Verificar propiedad
    const obraResult = await pool.query('SELECT * FROM obras WHERE id = $1', [
      id,
    ]);
    if (obraResult.rows.length === 0)
      return res.status(404).json({ error: 'Obra no encontrada.' });
    if (obraResult.rows[0].artista_id !== artista_id)
      return res.status(403).json({ error: 'No autorizado.' });

    // Opcional: Borrar la imagen de Cloudinary
    const imageUrl = obraResult.rows[0].imagen_url;
    const publicId = imageUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`angelbfisio_obras/${publicId}`);

    // Borrar de la base de datos
    await pool.query('DELETE FROM obras WHERE id = $1', [id]);
    res.status(204).send(); // 204 No Content
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al borrar la obra.' });
  }
});

module.exports = router;
