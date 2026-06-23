import jwt from 'jsonwebtoken';

/**
 * Sign a JWT for a user id.
 */
export const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

export default generateToken;
