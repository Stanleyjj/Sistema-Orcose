const db = require('../config/db');

module.exports = async function auth(req, res, next) {
  const usuario = req.get('x-user');
  const tipo = req.get('x-tipo');

  if (!usuario || !tipo) {
    return res.status(401).json({
      erro: 'Acesso não autorizado. Faça login.'
    });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, tipo FROM usuarios WHERE usuario = ?',
      [usuario]
    );

    if (!rows.length) {
      return res.status(401).json({ erro: 'Usuário inválido' });
    }

    // se o tipo não bater, bloqueia
    if (rows[0].tipo !== tipo) {
      return res.status(403).json({ erro: 'Perfil inválido' });
    }

    // Bloqueio de rotas de usuários para não-admin
    if (req.baseUrl === '/usuarios' && tipo !== 'ADMIN') {
      return res.status(403).json({ erro: 'Acesso restrito a administradores' });
    }

    req.usuario = usuario;
    req.tipo = tipo;
    req.userId = rows[0].id;

    next();

  } catch (err) {
    console.error('Erro auth:', err);
    res.status(500).json({ erro: 'Erro de autenticação' });
  }
};