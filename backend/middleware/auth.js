const jwt = require('jsonwebtoken');

// JWT Secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'healthlink360-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware to check if user has active subscription (for premium features)
const requireSubscription = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.subscription_status !== 'active') {
    return res.status(403).json({ 
      message: 'Premium subscription required',
      error: 'SUBSCRIPTION_REQUIRED'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireSubscription,
  JWT_SECRET
}; 