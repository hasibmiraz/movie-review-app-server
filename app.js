const express = require('express');
const userRouter = require('./routes/user');

const app = express();
const port = process.env.PORT || 5000;

// Routes
app.use('/api', userRouter);

// Port
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
