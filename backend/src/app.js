const express = require('express');
const cors = require('cors');
const path = require('path');

const logger = require('./utils/logger');

// Rotas
const authRoutes = require('./routes/auth.routes');
const empresasRoutes = require('./routes/empresas.routes');
const fisicaRoutes = require('./routes/fisica.routes');
const usuariosRoutes = require('./routes/usuarios.routes');

// Middleware
const authMiddleware = require('./middleware/auth');

const app = express();

// ================================
// MIDDLEWARES
// ================================

app.use(cors());
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// ================================
// FRONTEND
// ================================

app.use(express.static(path.join(__dirname, '../../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/login.html'));
});

// ================================
// ROTAS
// ================================

app.use('/auth', authRoutes);
app.use('/empresas', authMiddleware, empresasRoutes);
app.use('/fisica', authMiddleware, fisicaRoutes);
app.use('/usuarios', authMiddleware, usuariosRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

const resetRoutes = require('./routes/reset.routes');
app.use('/admin', resetRoutes);

module.exports = app;