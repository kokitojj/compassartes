const { Pool } = require('pg');

// El cliente de 'pg' usa automáticamente la variable de entorno DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
