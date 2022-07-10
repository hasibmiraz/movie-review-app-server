const nodemailer = require('nodemailer');
const { isValidObjectId } = require('mongoose');

const User = require('../models/user');
const EmailVerificationToken = require('../models/emailVerificationToken');
const { generateOTP, generateMailTransporter } = require('../utilities/mail');
const { sendError } = require('../utilities/statusHelper');

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
  var transport = generateMailTransporter();

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
    message: 'Email has been sent to your email. Please verify your account!',
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

  var transport = generateMailTransporter();

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
  var transport = generateMailTransporter();

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
