const User = require('../models/User');
const Token = require('../models/Token');
const { generateAccessToken, generateRefreshToken, generateRandomToken } = require('../utils/tokens');
const transporter = require('../config/mailer');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ email, password });
    const verifyToken = generateRandomToken();
    
    await Token.create({
      userId: user._id,
      token: verifyToken,
      type: 'verifyEmail',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send verification email
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verifyToken}`;
    await transporter.sendMail({
      from: '"Lost & Found" <noreply@lostfound.com>',
      to: email,
      subject: 'Verify your email',
      html: `<p>Please click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
    });

    res.status(201).json({ message: 'User registered. Please check your email to verify.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email before logging in.' });
      }

      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken();

      await Token.create({
        userId: user._id,
        token: refreshToken,
        type: 'refresh',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      res.cookie('refreshToken', refreshToken, cookieOptions);
      res.json({ accessToken, user: { _id: user._id, email: user.email, role: user.role } });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await Token.findOneAndDelete({ token: refreshToken, type: 'refresh' });
    }
    res.clearCookie('refreshToken', cookieOptions);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    const tokenDoc = await Token.findOne({ token: refreshToken, type: 'refresh' });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const accessToken = generateAccessToken(user._id, user.role);
    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const tokenDoc = await Token.findOne({ token, type: 'verifyEmail' });
    
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    await User.findByIdAndUpdate(tokenDoc.userId, { isVerified: true });
    await tokenDoc.deleteOne();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = generateRandomToken();
    await Token.create({
      userId: user._id,
      token: resetToken,
      type: 'resetPassword',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      from: '"Lost & Found" <noreply@lostfound.com>',
      to: email,
      subject: 'Reset Password',
      html: `<p>Please click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });

    res.json({ message: 'Password reset link sent to email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const tokenDoc = await Token.findOne({ token, type: 'resetPassword' });
    
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(tokenDoc.userId);
    user.password = newPassword;
    await user.save();
    await tokenDoc.deleteOne();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, logout, refresh, verifyEmail, forgotPassword, resetPassword };
