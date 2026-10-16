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

/**
 * optionalAuth — like protect, but never rejects: attaches req.user when a valid
 * token is present, otherwise continues anonymously. For public routes whose
 * response depends on who is asking (e.g. owners previewing pending listings).
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && !user.isBlocked) req.user = user;
    }
  } catch {
    // invalid/expired token → treat as anonymous
  }
  next();
};

/** True when the entity is publicly visible, or the requester owns it / is admin. */
export const canView = (req, entity, ownerField = 'owner') => {
  if (entity.status === 'approved') return true;
  if (!req.user) return false;
  if (req.user.role === 'admin') return true;
  const owner = entity[ownerField];
  return String(owner?._id || owner) === String(req.user._id);
};
