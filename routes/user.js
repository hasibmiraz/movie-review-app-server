const express = require('express');
const router = express.Router();
const {
  create,
  verifyEmail,
  resendEmailVerification,
  forgetPassword,
  sendResetPassTokenStatus,
  resetPassword,
  signIn,
} = require('../controllers/user');
const { isValidPassResetToken } = require('../middlewares/user');
const {
  userValidator,
  validate,
  validateResetPassword,
  signInValidator,
} = require('../middlewares/validator');

router.post('/create', userValidator, validate, create);
router.post('/signin', signInValidator, validate, signIn);
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
