const db = require('../config/db');

/**
 * GET /empresas
 */
exports.listar = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM empresas');
    res.json(rows);
  } catch (err) {
    console.error('Erro listar empresas:', err);
    res.status(500).json({ erro: 'Erro ao listar empresas' });
  }
};

/**
 * GET /empresas/:id
 */
exports.buscar = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM empresas WHERE id = ?',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: 'Empresa não encontrada' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar empresa' });
  }
};

/**
 * POST /empresas
 */
exports.criar = async (req, res) => {
  try {
    await db.query('INSERT INTO empresas SET ?', req.body);
    res.status(201).json({ msg: 'Empresa criada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Empresa já existente' });
  }
};

/**
 * PUT /empresas/:id
 */
exports.atualizar = async (req, res) => {
  try {
    await db.query(
      'UPDATE empresas SET ? WHERE id = ?',
      [req.body, req.params.id]
    );

    res.json({ msg: 'Empresa atualizada' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar empresa' });
  }
};

/**
 * DELETE /empresas/:id
 */
exports.excluir = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM empresas WHERE id = ?',
      [req.params.id]
    );

    res.json({ msg: 'Empresa excluída' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao excluir empresa' });
  }
};