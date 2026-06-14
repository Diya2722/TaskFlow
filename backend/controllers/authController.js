// controllers/authController.js
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');

// Create JWT token
const createToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

// Set token as secure httpOnly cookie
// rememberMe = true  → 30 days (stays logged in even after browser close)
// rememberMe = false → 1 day session
const sendCookie = (res, token, rememberMe) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: rememberMe
      ? 30 * 24 * 60 * 60 * 1000   // 30 days
      : 24 * 60 * 60 * 1000,        // 1 day
  });
};

const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

    const { name, email, password } = parsed.data;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    // New users get 30-day cookie by default so they stay logged in
    sendCookie(res, createToken(user._id), true);

    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

    const { email, password } = parsed.data;
    const rememberMe = req.body.rememberMe !== false; // default true

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    sendCookie(res, createToken(user._id), rememberMe);
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out' });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
};

module.exports = { register, login, logout, getMe };
