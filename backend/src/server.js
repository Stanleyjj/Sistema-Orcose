const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.success(`Servidor rodando na porta ${PORT}`);
});


process.on('uncaughtException', err => {
  logger.error('Erro não tratado', err);
  process.exit(1);
});

process.on('unhandledRejection', err => {
  logger.error('Promise rejeitada', err);
  process.exit(1);
});

// ENCERRAMENTO LIMPO
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
  logger.warn('Encerrando servidor...');
  server.close(() => {
    logger.success('Servidor finalizado com segurança.');
    process.exit(0);
  });
}