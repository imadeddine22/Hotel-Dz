import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * protect — verify JWT (from Authorization: Bearer or cookie) and attach req.user.
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      token = header.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * authorize(...roles) — allow only the given roles.
 * Usage: authorize('admin') or authorize('owner', 'admin')
 */
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
