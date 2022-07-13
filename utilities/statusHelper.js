const crypto = require('crypto');

exports.sendError = (res, error, statusCode = 401) =>
  res.status(statusCode).json({ error });

exports.generateRandomByte = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(30, (err, buff) => {
      if (err) reject(err);
      const buffStr = buff.toString('hex');
      resolve(buffStr);
    });
  });
};

exports.handleNotFound = (req, res) => this.sendError(res, 'Not found', 404);
