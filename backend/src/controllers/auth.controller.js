import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const sanitize = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  isVerified: user.isVerified,
});

const sendAuth = (res, user, status = 200) => {
  const token = generateToken(user._id);
  const isProd = process.env.NODE_ENV === 'production';
  res
    .cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(status)
    .json({ success: true, token, user: sanitize(user) });
};

// POST /auth/register
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ fullName, email, password, phone, role });
    sendAuth(res, user, 201);
  } catch (err) {
    next(err);
  }
};

// POST /auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked' });
    }

    sendAuth(res, user);
  } catch (err) {
    next(err);
  }
};

// POST /auth/logout
export const logout = async (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  }).json({ success: true, message: 'Logged out' });
};

// GET /auth/me
export const getMe = async (req, res) => {
  res.json({ success: true, user: sanitize(req.user) });
};

// PUT /auth/update-profile
export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, password } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (password) user.password = password; // re-hashed by pre-save hook

    await user.save();
    res.json({ success: true, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
};
