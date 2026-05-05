const express = require('express');
const { z } = require('zod');
const { register, login, logout, refresh, verifyEmail, forgotPassword, resetPassword } = require('../controllers/authController');
const validate = require('../middlewares/validateMiddleware');
const { loginLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  })
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  })
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string(),
    newPassword: z.string().min(6),
  })
});

router.post('/register', validate(registerSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', loginLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

module.exports = router;
