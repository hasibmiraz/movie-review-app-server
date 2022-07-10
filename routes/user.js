const express = require('express');
const router = express.Router();
const {
  create,
  verifyEmail,
  resendEmailVerification,
  forgetPassword,
  sendResetPassTokenStatus,
  resetPassword,
} = require('../controllers/user');
const { isValidPassResetToken } = require('../middlewares/user');
const {
  userValidator,
  validate,
  validateResetPassword,
} = require('../middlewares/validator');

router.post('/create', userValidator, validate, create);
router.post('/verify-email', verifyEmail);
router.post('/resend-email-verification-token', resendEmailVerification);
router.post('/forget-password', forgetPassword);
router.post(
  '/verify-pass-reset-token',
  isValidPassResetToken,
  sendResetPassTokenStatus
);
router.post(
  '/reset-password',
  validateResetPassword,
  validate,
  isValidPassResetToken,
  resetPassword
);

module.exports = router;
