const mongoose = require('mongoose');

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wsysi.mongodb.net/movie_review_app?retryWrites=true&w=majority`
  )
  .then(() => console.log('DB connected'))
  .catch((err) => console.log(err));
