const db = require('../config/db');

/**
* POST /auth/login
*/
exports.login = async (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ erro: 'Usuário e senha são obrigatórios' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, usuario, tipo FROM usuarios WHERE usuario = ? AND senha = SHA2(?,256)',
      [usuario, senha]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário ou senha incorretas' });
    }

    const user = rows[0];

    res.json({
      id: user.id,
      usuario: user.usuario,
      tipo: user.tipo
    });

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ erro: 'Erro interno no login' });
  }
};