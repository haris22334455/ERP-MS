import { Request, Response, NextFunction } from 'express';

// Ensure user has admin role
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Requires admin role.' });
  }
};

// Ensure user has either admin or staff role
export const requireStaff = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Requires staff or admin role.' });
  }
};

// Any authenticated user can pass (just a placeholder if needed, though authenticateToken does this)
export const requireAnyAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Authentication required.' });
  }
};
