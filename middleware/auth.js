import jwt from 'jsonwebtoken';
import db from '../database/db.js';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth middleware - Authorization header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      console.log('Auth middleware - No token found in header');
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('Auth middleware - Token format:', token.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Auth middleware - Token verified for userId:', decoded.userId);
    
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware - Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid token', details: error.message });
  }
};

export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.userId = decoded.userId;
      req.user = decoded;
    }
    next();
  } catch (error) {
    next();
  }
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User tidak terautentikasi' });
      }
      
      const user = db.data.users.find(u => u.id === req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User tidak ditemukan' });
      }

      // Default role is customer if not specified
      const userRole = user.role || 'customer';

      if (!roles.includes(userRole)) {
        return res.status(403).json({ error: 'Akses ditolak: Role tidak diizinkan' });
      }

      next();
    } catch (error) {
      console.error('Authorize middleware error:', error);
      res.status(500).json({ error: 'Server error saat memeriksa role' });
    }
  };
};
