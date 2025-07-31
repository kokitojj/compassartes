const pool = require('../../config/db');

// @desc    Get section details by slug or ID
// @route   GET /api/public/secciones/:slug
// @access  Public
const getSectionBySlug = async (req, res) => {
  const { slug } = req.params;
  let query;
  // Comprueba si el slug es numérico para decidir si buscar por ID o por slug
  if (!isNaN(slug)) {
    query = {
      text: 'SELECT * FROM secciones WHERE id = $1',
      values: [parseInt(slug, 10)],
    };
  } else {
    query = {
      text: 'SELECT * FROM secciones WHERE slug = $1',
      values: [slug],
    };
  }

  try {
    // 1. Obtener la información de la sección
    const sectionRes = await pool.query(query);
    if (sectionRes.rows.length === 0) {
      return res.status(404).json({ error: 'Sección no encontrada.' });
    }
    const section = sectionRes.rows[0];

    // 2. Obtener las obras asociadas a la sección
    const obrasRes = await pool.query(
      'SELECT o.*, u.full_name as artista_nombre FROM obras o JOIN users u ON o.artista_id = u.id WHERE o.seccion_id = $1 ORDER BY o.fecha_subida DESC',
      [section.id]
    );

    // 3. Obtener los posts asociados a la sección
    const postsRes = await pool.query(
      'SELECT b.*, u.full_name as autor_nombre FROM blog_posts b JOIN users u ON b.artista_id = u.id WHERE b.seccion_id = $1 ORDER BY b.fecha_publicacion DESC',
      [section.id]
    );

    // 4. Combinar y devolver los datos
    res.json({
      ...section,
      obras: obrasRes.rows,
      posts: postsRes.rows,
    });

  } catch (err) {
    console.error('Error al obtener la sección:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = {
  getSectionBySlug,
};
