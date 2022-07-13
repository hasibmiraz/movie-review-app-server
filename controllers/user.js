const { isValidObjectId } = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const EmailVerificationToken = require('../models/emailVerificationToken');
const PasswordResetToken = require('../models/passwordResetToken');
const { generateOTP, generateMailTransporter } = require('../utilities/mail');
const { sendError, generateRandomByte } = require('../utilities/statusHelper');

exports.create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });
  if (oldUser) return sendError(res, 'The email is already in use!');

  const newUser = new User({ name, email, password });
  await newUser.save();

  // Generate 6 digit OTP
  let OTP = generateOTP(6);

  // Store it in the DB
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();
  // Send OTP to the user
  const transport = generateMailTransporter();

  transport.sendMail({
    from: 'hasib@imdd.com',
    to: newUser.email,
    subject: 'Verify your email',

    html: `
    <p>Your verification OTP</p>
    <h1>${OTP}</h1>    
    `,
  });

  res.status(201).json({
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    },
  });
};

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;
  if (!isValidObjectId(userId)) return sendError(res, 'Invalid user');

  const user = await User.findById(userId);
  if (!user) return sendError(res, 'No user found!', 404);

  if (user.isVerified) return sendError(res, 'User is verified already!');

  const token = await EmailVerificationToken.findOne({ owner: userId });
  if (!token) return sendError(res, 'OTP not found!', 404);

  const isMatched = await token.compareToken(OTP);
  if (!isMatched) return sendError(res, 'Incorrect OTP!');

  user.isVerified = true;
  await user.save();

  await EmailVerificationToken.findByIdAndDelete(token._id);

  const transport = generateMailTransporter();

  transport.sendMail({
    from: 'miraz@imdd.com',
    to: user.email,
    subject: 'Welcome to IMDD.',

    html: `
    <h1>Welcome to IMDD</h1>    
    <p>Thank you for opening account in IMDD. Have a look at movies you have watched and rate them.</p>
    `,
  });

  res.json({ message: 'Your email is verified!' });
};

exports.resendEmailVerification = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return sendError(res, 'User not found!', 404);

  if (user && user.isVerified) return sendError(res, 'Email id is verified');

  const availableToken = await EmailVerificationToken.findOne({
    owner: userId,
  });
  if (availableToken)
    return sendError(
      res,
      'Check your email for the OTP or try again after 1 hour.'
    );

  // Generate 6 digit OTP
  let OTP = generateOTP(6);

  // Store it in the DB
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();
  // Send OTP to the user
  const transport = generateMailTransporter();

  transport.sendMail({
    from: 'hasib@imdd.com',
    to: user.email,
    subject: 'Verify your email',

    html: `
    <p>Your verification OTP</p>
    <h1>${OTP}</h1>
    `,
  });

  res.json({
    message: 'Check your email to get the OTP and verify your email!',
  });
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return sendError(res, 'Please provide an email!');

  const user = await User.findOne({ email });
  if (!user) return sendError(res, 'No user found with the email!', 404);

  const availableToken = await PasswordResetToken.findOne({ owner: user._id });
  if (availableToken)
    return sendError(
      res,
      'Check your email for the OTP or try again after 1 hour.'
    );

  const token = await generateRandomByte();
  const newPasswordResetToken = new PasswordResetToken({
    owner: user._id,
    token,
  });
  await newPasswordResetToken.save();

  const resetPasswordUrl = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;

  const transport = generateMailTransporter();

  transport.sendMail({
    from: 'security-hasib@imdd.com',
    to: user.email,
    subject: 'Reset password',

    html: `
    <h1>Reset your password by clicking the link below</h1>
    <a href='${resetPasswordUrl}'>Reset password</a>
    `,
  });

  res.json({ message: 'Check your email to reset password!' });
};

exports.sendResetPassTokenStatus = (req, res) => {
  res.json({ valid: true });
};

exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  const user = await User.findById(userId);
  const matched = await user.comparePassword(newPassword);
  if (matched)
    return sendError(
      res,
      'The new password can not be the same as the old one!'
    );

  user.password = newPassword;
  await user.save();

  await PasswordResetToken.findByIdAndDelete(req.resetToken._id);

  // Send OTP to the user
  const transport = generateMailTransporter();

  transport.sendMail({
    from: 'hasib@imdd.com',
    to: user.email,
    subject: 'Password Reset Successful',

    html: `
    <h1>Password reset successfully</h1>
    <p>Please login with your new password</p>
    `,
  });

  res.json({ message: 'Password reset successfully' });
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return sendError(res, 'Incorrect email/password!');

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, 'Incorrect email/password!');

  const { _id, name } = user;

  const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  res.json({ user: { id: _id, name, email, token: jwtToken } });
};
