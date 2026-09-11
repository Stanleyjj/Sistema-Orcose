const db = require('../config/db.js');

async function resetar(req, res) {
  try {
    await db.query('TRUNCATE TABLE empresas');
    await db.query('TRUNCATE TABLE fisica');
    res.json({ ok: true });
  } catch (err) {
    console.error('ERRO RESET:', err);
    res.status(500).json({ erro: err.message });
  }
}

module.exports = { resetar };