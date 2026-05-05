const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'dev_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

const generateRandomToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateRandomToken,
};
