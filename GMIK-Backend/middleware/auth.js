import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.error('Auth error: No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  console.log('Auth: Verifying token with JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Auth error: JWT verification failed', err.message);
      return res.status(403).json({ error: 'Invalid or expired token', details: err.message });
    }
    console.log('Auth: Token verified for user:', user.userId);
    req.user = user;
    next();
  });
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
