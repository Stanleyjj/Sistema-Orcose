const db = require('../config/db');

/**
 * GET /usuarios
 */
exports.listar = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, usuario, tipo FROM usuarios'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
};

/**
 * POST /usuarios
 */
exports.criar = async (req, res) => {
  const { usuario, senha, tipo } = req.body;

  try {
    await db.query(
      'INSERT INTO usuarios (usuario, senha, tipo) VALUES (?, SHA2(?,256), ?)',
      [usuario, senha, tipo]
    );

    res.status(201).json({ msg: 'Usuário criado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar usuário' });
  }
};

/**
 * PUT /usuarios/:id
 */
exports.atualizar = async (req, res) => {
  const { usuario, senha, tipo } = req.body;

  try {
    let query = '';
    let params = [];

    if (senha && senha.trim() !== '') {
      // Atualiza usuário + senha + tipo
      query = 'UPDATE usuarios SET usuario = ?, senha = SHA2(?,256), tipo = ? WHERE id = ?';
      params = [usuario, senha, tipo, req.params.id];
    } else {
      // Atualiza apenas usuário + tipo, mantém a senha
      query = 'UPDATE usuarios SET usuario = ?, tipo = ? WHERE id = ?';
      params = [usuario, tipo, req.params.id];
    }

    await db.query(query, params);

    res.json({ msg: 'Usuário atualizado' });
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ erro: 'Erro ao atualizar usuário' });
  }
};

/**
 * DELETE /usuarios/:id
 */
exports.excluir = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM usuarios WHERE id = ?',
      [req.params.id]
    );

    res.json({ msg: 'Usuário excluído' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao excluir usuário' });
  }
};