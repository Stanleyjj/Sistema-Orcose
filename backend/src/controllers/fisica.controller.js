const db = require('../config/db');

/**
 * GET /fisica
 */
exports.listar = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM fisica');
    res.json(rows);
  } catch (err) {
    console.error('Erro listar Pessoa Fisica:', err);
    res.status(500).json({ erro: 'Erro ao listar Pessoa Fisica' });
  }
};

/**
 * GET /fisica/:id
 */
exports.buscar = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM fisica WHERE id = ?',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: 'Pessoa Fisica não encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar Pessoa Fisica' });
  }
};

/**
 * POST /empresas
 */
exports.criar = async (req, res) => {
  try {
    await db.query('INSERT INTO fisica SET ?', req.body);
    res.status(201).json({ msg: 'Pessoa Fisica criada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Pessoa Fisica já existente' });
  }
};

/**
 * PUT /empresas/:id
 */
exports.atualizar = async (req, res) => {
  try {
    await db.query(
      'UPDATE fisica SET ? WHERE id = ?',
      [req.body, req.params.id]
    );

    res.json({ msg: 'Pessoa Fisica atualizada' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar Pessoa Fisica' });
  }
};

/**
 * DELETE /empresas/:id
 */
exports.excluir = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM fisica WHERE id = ?',
      [req.params.id]
    );

    res.json({ msg: 'Pessoa Fisica excluída' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao excluir Fisica' });
  }
};