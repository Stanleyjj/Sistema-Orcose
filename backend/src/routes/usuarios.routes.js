const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/usuarios.controller');

router.get('/', auth, controller.listar);
router.post('/', auth, controller.criar);
router.put('/:id', auth, controller.atualizar);
router.delete('/:id', auth, controller.excluir);

module.exports = router;