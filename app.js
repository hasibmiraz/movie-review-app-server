const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('express-async-errors');
require('dotenv').config();

require('./db');
const userRouter = require('./routes/user');
const { errorHandler } = require('./middlewares/errorHandler');
const { handleNotFound } = require('./utilities/statusHelper');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
const port = process.env.PORT || 5000;

// Routes
app.use('/api/user', userRouter);

app.use('*', handleNotFound);

// error handling middleware
app.use(errorHandler);

// Port
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
