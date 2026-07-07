const { Pool } = require('pg');

const dbPassword = process.env.DB_PASSWORD;
if (!dbPassword) {
  console.error("[FATAL] La variabile d'ambiente DB_PASSWORD non è configurata!");
  process.exit(1);
}

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres-app',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quizlab',
  user: process.env.DB_USER || 'quizlab_user',
  password: dbPassword,
});

module.exports = pool;
