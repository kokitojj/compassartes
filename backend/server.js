require('dotenv').config(); // Carga las variables de entorno desde .env
console.log('DATABASE_URL cargada:', process.env.DATABASE_URL);

// Importaciones
const express = require('express');
const cors = require('cors');
const configureCloudinary = require('./config/cloudinaryConfig');
const pool = require('./config/db');

// Importar todos los archivos de rutas
const authRoutes = require('./routes/authRoutes');
const obrasRoutes = require('./routes/obrasRoutes');
const blogRoutes = require('./routes/blogRoutes');
const artistRoutes = require('./routes/artistRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');
const fisioloadRoutes = require('./routes/fisioloadRoutes');
const app = express();
const PORT = process.env.PORT || 3007;

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Para parsear body de peticiones JSON

// --- Función para Inicializar la Base de Datos ---
const initializeDatabase = async () => {
  const client = await pool.connect();
  console.log('Conectado a la base de datos para inicialización.');
  try {
    // Elimina los tipos y tablas si existen para una recreación limpia
    await client.query(`DROP TABLE IF EXISTS wellness_entries CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS users CASCADE;`);
    await client.query(`DROP TYPE IF EXISTS user_role;`);
    await client.query(`DROP TYPE IF EXISTS session_type;`);

    // Creación de un tipo ENUM para los roles de usuario
    await client.query(`CREATE TYPE user_role AS ENUM ('player', 'coach', 'admin');`);

    // Creación de la tabla de users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role user_role NOT NULL DEFAULT 'player',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insertar usuario administrador si no existe
    const adminExists = await client.query('SELECT COUNT(*) FROM users WHERE username = $1', ['admin']);
    if (parseInt(adminExists.rows[0].count, 10) === 0) {
      await client.query(
        'INSERT INTO users (id, username, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5)',
        [1, 'admin', '$2a$10$d1zaWyI2blEoBsC6EqSZU.Qhw2tNkvZV0QzrSnJ9sqdMboOZiAC0.', 'Admin Web', 'admin']
      );
      console.log('Usuario administrador insertado.');
    } else {
      console.log('Usuario administrador ya existe.');
    }

    // Creación de un tipo ENUM para el tipo de sesión
    await client.query(`CREATE TYPE session_type AS ENUM ('practice', 'game');`);

    // Creación de la tabla para los registros de bienestar (wellness)
    await client.query(`
      CREATE TABLE IF NOT EXISTS wellness_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_type session_type NOT NULL,
        duration_minutes INTEGER,
        fatigue_pre SMALLINT NOT NULL CHECK (fatigue_pre >= 1 AND fatigue_pre <= 10),
        sleep_quality SMALLINT NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
        sleep_hours NUMERIC(4, 2) NOT NULL,
        stress_level SMALLINT NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
        mood SMALLINT NOT NULL CHECK (mood >= 1 AND mood <= 10),
        muscle_soreness SMALLINT NOT NULL CHECK (muscle_soreness >= 1 AND muscle_soreness <= 10),
        injury_pain SMALLINT CHECK (injury_pain >= 0 AND injury_pain <= 10),
        menstrual_period BOOLEAN NOT NULL,
        nutrition_quality SMALLINT NOT NULL CHECK (nutrition_quality >= 1 AND nutrition_quality <= 10),
        fatigue_post SMALLINT CHECK (fatigue_post >= 1 AND fatigue_post <= 10),
        rpe SMALLINT CHECK (rpe >= 0 AND rpe <= 10),
        comments TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // Crear tabla de obras
    await client.query(`
      CREATE TABLE IF NOT EXISTS obras (
        id SERIAL PRIMARY KEY,
        artista_id INT REFERENCES users(id) ON DELETE CASCADE,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        imagen_url VARCHAR(255) NOT NULL,
        fecha_subida TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    // Crear tabla de blog
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        artista_id INT REFERENCES users(id) ON DELETE CASCADE,
        titulo VARCHAR(255) NOT NULL,
        contenido TEXT NOT NULL,
        fecha_publicacion TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS secciones (
        id SERIAL PRIMARY KEY,
        nombre_grupo VARCHAR(100) UNIQUE NOT NULL,
        descripcion TEXT,
        imagen_url VARCHAR(255)
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS grupo_miembros (
        grupo_id INT REFERENCES secciones(id) ON DELETE CASCADE,
        usuario_id INT REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (grupo_id, usuario_id)
      );
    `);
    console.log('Tablas de Grupos verificadas/creadas correctamente.');

    // --- Add seccion_id to obras and blog_posts if they don't exist ---
    console.log('Verifying schema for obras and blog_posts...');

    // Check and alter 'obras' table
    const obrasColumnExists = await client.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'obras' AND column_name = 'seccion_id'
    `);
    if (obrasColumnExists.rowCount === 0) {
      await client.query(`
        ALTER TABLE obras
        ADD COLUMN seccion_id INTEGER,
        ADD CONSTRAINT fk_seccion
          FOREIGN KEY(seccion_id)
          REFERENCES secciones(id)
          ON DELETE SET NULL;
      `);
      console.log('Column seccion_id added to "obras" table.');
    } else {
      console.log('Column seccion_id already exists in "obras" table.');
    }

    // Check and alter 'blog_posts' table
    const blogPostsColumnExists = await client.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'seccion_id'
    `);
    if (blogPostsColumnExists.rowCount === 0) {
      await client.query(`
        ALTER TABLE blog_posts
        ADD COLUMN seccion_id INTEGER,
        ADD CONSTRAINT fk_seccion_blog
          FOREIGN KEY(seccion_id)
          REFERENCES secciones(id)
          ON DELETE SET NULL;
      `);
      console.log('Column seccion_id added to "blog_posts" table.');
    } else {
      console.log('Column seccion_id already exists in "blog_posts" table.');
    }

    // Add slug column to secciones table
    const slugColumnExists = await client.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'secciones' AND column_name = 'slug'
    `);
    if (slugColumnExists.rowCount === 0) {
      await client.query(`
        ALTER TABLE secciones
        ADD COLUMN slug VARCHAR(255) UNIQUE;
      `);
      console.log('Column slug added to "secciones" table.');
    } else {
      console.log('Column slug already exists in "secciones" table.');
    }

    // Add destacado_portada column to obras table
    const destacadoPortadaColumnExists = await client.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'obras' AND column_name = 'destacado_portada'
    `);
    if (destacadoPortadaColumnExists.rowCount === 0) {
      await client.query(`
        ALTER TABLE obras
        ADD COLUMN destacado_portada BOOLEAN DEFAULT FALSE;
      `);
      console.log('Column destacado_portada added to "obras" table.');
    } else {
      console.log('Column destacado_portada already exists in "obras" table.');
    }
    
    console.log('Tablas verificadas/creadas correctamente.');
  } catch (err) {
    console.error('Error al inicializar las tablas:', err);
    throw err; // Lanza el error para detener el inicio si falla
  } finally {
    client.release();
    console.log('Cliente de inicialización liberado.');
  }
};

// --- Conectar Rutas ---
// Aquí le decimos a Express qué prefijo de URL corresponde a cada router.
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/obras', obrasRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/artistas', artistRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/fisioload', fisioloadRoutes);

// --- Iniciar Servidor ---
const startServer = async () => {
  try {
    configureCloudinary();
    // Esperamos a que la DB esté lista ANTES de iniciar el servidor.
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor API de angelbfisio corriendo en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor. Saliendo.', err);
    process.exit(1); // Detiene la aplicación si la DB no se puede inicializar
  }
};

startServer();
