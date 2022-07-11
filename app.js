const express = require('express');
const morgan = require('morgan');
require('express-async-errors');
require('dotenv').config();

require('./db');
const userRouter = require('./routes/user');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
app.use(express.json());
app.use(morgan('dev'));
const port = process.env.PORT || 5000;

// Routes
app.use('/api/user', userRouter);

// error handling middleware
app.use(errorHandler);

// Port
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
