const CAMPOS_MAIUSCULOS = [
  'razao_social',
  'nome'  
];

module.exports = (req, res, next) => {

  if (!req.body) return next();

  Object.keys(req.body).forEach(campo => {

    if (
      CAMPOS_MAIUSCULOS.includes(campo) &&
      typeof req.body[campo] === 'string'
    ) {
      req.body[campo] =
        req.body[campo].toLocaleUpperCase('pt-BR');
    }

  });

  next();

};