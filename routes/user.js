const express = require('express');
const router = express.Router();
const {
  create,
  verifyEmail,
  resendEmailVerification,
  forgetPassword,
} = require('../controllers/user');
const { userValidator, validate } = require('../middlewares/validator');

router.post('/create', userValidator, validate, create);
router.post('/verify-email', verifyEmail);
router.post('/resend-email-verification-token', resendEmailVerification);
router.post('/forget-password', forgetPassword);

module.exports = router;
