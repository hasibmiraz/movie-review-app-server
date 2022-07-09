const nodemailer = require('nodemailer');

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
    from: 'miraz@movie-review-app.com',
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
