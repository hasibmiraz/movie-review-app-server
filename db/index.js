const mongoose = require('mongoose');
require('dotenv').config();

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wsysi.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => console.log('DB connected'))
  .catch((err) => console.log(err));
