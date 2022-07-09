const express = require('express');
const router = express.Router();
const { create, verifyEmail } = require('../controllers/user');
const { userValidator, validate } = require('../middlewares/validator');

router.post('/create', userValidator, validate, create);
router.post('/verify-email', verifyEmail);

module.exports = router;
