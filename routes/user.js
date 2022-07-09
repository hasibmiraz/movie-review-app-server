const express = require('express');
const router = express.Router();
const { create } = require('../controllers/user');
const { userValidator, validate } = require('../middlewares/validator');

router.post('/create', userValidator, validate, create);

module.exports = router;
