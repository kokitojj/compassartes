const express = require('express');
const pool = require('../config/db');
const adminAuth = require('../middleware/adminAuthMiddleware');
const { getAllWellnessEntries } = require('../src/controllers/fisioloadController');
const {
  createUser,
  getUserById,
  updateUser,
} = require('../src/controllers/userController');
const router = express.Router();

// User Management
router.post('/users', adminAuth, createUser);
router.get('/users/:id', adminAuth, getUserById);
router.put('/users/:id', adminAuth, updateUser);

// --- GET (Leer) ---

router.get('/wellness-entries', adminAuth, getAllWellnessEntries);

router.get('/dashboard-stats', adminAuth, async (req, res) => {
  try {
    const users = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'player'"
    );
    const artworks = await pool.query('SELECT COUNT(*) FROM obras');
    const posts = await pool.query('SELECT COUNT(*) FROM blog_posts');
    res.json({
      total_users: parseInt(users.rows[0].count, 10),
      total_artworks: parseInt(artworks.rows[0].count, 10),
      total_posts: parseInt(posts.rows[0].count, 10),
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las estadísticas.' });
  }
});

router.get('/all-content', adminAuth, async (req, res) => {
  try {
    const obrasRes = await pool.query(
      'SELECT o.*, u.full_name FROM obras o JOIN users u ON o.artista_id = u.id ORDER BY o.fecha_subida DESC'
    );
    const postsRes = await pool.query(
      'SELECT b.*, u.full_name FROM blog_posts b JOIN users u ON b.artista_id = u.id ORDER BY b.fecha_publicacion DESC'
    );
    res.json({ obras: obrasRes.rows, blogPosts: postsRes.rows });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener todo el contenido.' });
  }
});

// --- UPDATE (Actualizar) ---
// PUT /api/admin/obras/:id - Admin edita cualquier obra
router.put('/obras/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion } = req.body;
  try {
    const updatedObra = await pool.query(
      'UPDATE obras SET titulo = $1, descripcion = $2 WHERE id = $3 RETURNING *',
      [titulo, descripcion, id]
    );
    if (updatedObra.rows.length === 0)
      return res.status(404).json({ error: 'Obra no encontrada.' });
    res.json(updatedObra.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar la obra.' });
  }
});

// PUT /api/admin/posts/:id - Admin edita cualquier post
router.put('/posts/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { titulo, contenido } = req.body;
  try {
    const updatedPost = await pool.query(
      'UPDATE blog_posts SET titulo = $1, contenido = $2 WHERE id = $3 RETURNING *',
      [titulo, contenido, id]
    );
    if (updatedPost.rows.length === 0)
      return res.status(404).json({ error: 'Post no encontrado.' });
    res.json(updatedPost.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el post.' });
  }
});

// --- DELETE (Borrar) ---
router.delete('/obras/:id', adminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM obras WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error al borrar la obra.' });
  }
});

router.delete('/posts/:id', adminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM blog_posts WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error al borrar el post.' });
  }
});

// --- GET /api/admin/users - Listar todos los users ---
router.get('/users', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, username, role, to_char(created_at, 'YYYY-MM-DD') as created_at FROM users ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener users:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// --- PUT /api/admin/users/:id/role - Actualizar el rol de un usuario ---
router.put('/users/:id/role', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Validación simple del rol
  if (!['player', 'coach', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Rol no válido.' });
  }

  try {
    const updatedUser = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, full_name, username, role',
      [role, id]
    );
    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error('Error al actualizar el rol:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// --- DELETE /api/admin/users/:id - Borrar un usuario ---
// ¡CUIDADO! Esto también borrará en cascada sus obras y posts.
router.delete('/users/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  // Medida de seguridad: no permitir que un admin se borre a sí mismo.
  if (parseInt(id, 10) === req.user.id) {
    return res
      .status(403)
      .json({ error: 'No puedes borrar tu propia cuenta de administrador.' });
  }
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Error al borrar el usuario:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// --- NUEVO: Gestión de Secciones ---

// POST /api/admin/secciones - Crear una nueva sección
router.post('/secciones', adminAuth, async (req, res) => {
  const { nombre_grupo, descripcion, imagen_url } = req.body;
  if (!nombre_grupo) {
    return res.status(400).json({ error: 'El nombre de la sección es requerido.' });
  }
  try {
    const newGroup = await pool.query(
      'INSERT INTO secciones (nombre_grupo, descripcion, imagen_url) VALUES ($1, $2, $3) RETURNING *',
      [nombre_grupo, descripcion, imagen_url]
    );
    res.status(201).json(newGroup.rows[0]);
  } catch (err) {
    console.error('Error al crear la sección:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// PUT /api/admin/secciones/:id - Actualizar una sección
router.put('/secciones/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { nombre_grupo, descripcion, imagen_url } = req.body;
  if (!nombre_grupo) {
    return res.status(400).json({ error: 'El nombre de la sección es requerido.' });
  }
  try {
    const updatedGroup = await pool.query(
      'UPDATE secciones SET nombre_grupo = $1, descripcion = $2, imagen_url = $3 WHERE id = $4 RETURNING *',
      [nombre_grupo, descripcion, imagen_url, id]
    );
    if (updatedGroup.rows.length === 0) {
      return res.status(404).json({ error: 'Sección no encontrada.' });
    }
    res.json(updatedGroup.rows[0]);
  } catch (err) {
    console.error('Error al actualizar la sección:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// DELETE /api/admin/secciones/:id - Borrar una sección
router.delete('/secciones/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const deleteOp = await pool.query(
      'DELETE FROM secciones WHERE id = $1 RETURNING *',
      [id]
    );
    if (deleteOp.rows.length === 0) {
      return res.status(404).json({ error: 'Sección no encontrada.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error al borrar la sección:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
