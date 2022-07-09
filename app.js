const express = require('express');

require('./db');
const userRouter = require('./routes/user');
const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;

// Routes
app.use('/api/user', userRouter);

// Port
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
