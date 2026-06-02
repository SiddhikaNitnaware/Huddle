const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'huddle_jwt_secret_key_2024_change_this_in_production_abc123xyz789';

// Middleware to verify JWT token (required authentication)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer TOKEN"

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

// Middleware to optionally verify JWT token (token not required)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null; // If token is invalid, just proceed as unauthenticated
    } else {
      req.user = user;
    }
    next();
  });
};

module.exports = { authenticateToken, optionalAuth, JWT_SECRET };
