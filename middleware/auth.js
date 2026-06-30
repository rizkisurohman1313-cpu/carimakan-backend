import jwt from 'jsonwebtoken';

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
