const nodemailer = require('nodemailer');
const { isValidObjectId } = require('mongoose');

const User = require('../models/user');
const EmailVerificationToken = require('../models/emailVerificationToken');

exports.create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });
  if (oldUser)
    return res.status(401).json({ error: 'The email is already in use!' });

  const newUser = new User({ name, email, password });
  await newUser.save();

  // Generate 6 digit OTP
  let OTP = '';
  for (let i = 0; i <= 5; i++) {
    const randomVal = Math.round(Math.random() * 9);
    OTP += randomVal;
  }
  // Store it in the DB
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();
  // Send OTP to the user
  var transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

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
  if (!isValidObjectId(userId)) return res.json({ error: 'Invalid user' });

  const user = await User.findById(userId);
  if (!user) return res.json({ error: 'No user found!' });

  if (user.isVerified) return res.json({ error: 'User is verified already!' });

  const token = await EmailVerificationToken.findOne({ owner: userId });
  if (!token) return res.json({ error: 'OTP not found!' });

  const isMatched = await token.compareToken(OTP);
  if (!isMatched) return res.json({ error: 'Incorrect OTP!' });

  user.isVerified = true;
  await user.save();

  await EmailVerificationToken.findByIdAndDelete(token._id);

  var transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

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
