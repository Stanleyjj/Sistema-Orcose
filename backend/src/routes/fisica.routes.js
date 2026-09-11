const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/fisica.controller');
const upper = require('../middleware/uppercase.middleware');

// CRUD completo
router.get('/', auth, controller.listar);
router.get('/:id', auth, controller.buscar);
router.post('/', auth, upper, controller.criar);
router.put('/:id', auth, upper, controller.atualizar);
router.delete('/:id', auth, controller.excluir);

module.exports = router;
