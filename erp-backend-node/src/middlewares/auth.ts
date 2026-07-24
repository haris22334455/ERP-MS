import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenBlacklist } from '../utils/TokenBlacklist';

const JWT_SECRET = process.env.JWT_SECRET || 'ErpMS@Secure#2026$RandomKey!XyZ789';

// Add user property to Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Check if token is blacklisted (e.g. logged out)
  if (TokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Session expired or logged out. Please log in again.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains id, role, etc.
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};
