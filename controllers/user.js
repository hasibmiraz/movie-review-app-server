const User = require('../models/user');

exports.create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });
  if (oldUser)
    return res.status(401).json({ error: 'The email is already in use!' });

  const newUser = new User({ name, email, password });
  await newUser.save();

  // var transport = nodemailer.createTransport({
  //   host: "smtp.mailtrap.io",
  //   port: 2525,
  //   auth: {
  //     user: "49263afb4c4efb",
  //     pass: "1a13ef8720d243"
  //   }
  // });

  res.status(201).json({ user: newUser });
};
