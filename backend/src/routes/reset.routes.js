const express = require('express');
const router = express.Router();
const { resetar } = require('../controllers/reset.controller');

router.post('/reset', resetar);

module.exports = router;