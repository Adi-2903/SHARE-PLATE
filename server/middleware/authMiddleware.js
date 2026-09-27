import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect route — verifies JWT
export const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ error: 'User not found' });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Role-based access control
export const authorize = (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: `Access denied for role: ${req.user.role}` });
    next();
  };
