// backend/src/config/db.js

const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'T3cn0rcOse',
  database: 'contabilidade',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Teste inicial
(async () => {
  try {
    const conn = await pool.getConnection();
    logger.success('MySQL Pool conectado com sucesso');
    conn.release();
  } catch (err) {
    logger.error('Erro ao conectar no MySQL', err);
    process.exit(1);
  }
})();

module.exports = pool;