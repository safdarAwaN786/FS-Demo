const jwt = require('jsonwebtoken');
const User = require('../models/AccountCreation/UserModel');
require('dotenv').config();

// Middleware function for user authentication
const authMiddleware = async (req, res, next) => {
  try {
    // Skip authentication for the login route
    if (req.path === '/user/login') {
      return next();
    } else if (req.path === '/get-user') {
      console.log('in token');
      const token = req.header('Authorization');
      if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
      }
      if (!token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Invalid token format' });
      }
      const tokenWithoutBearer = token.replace('Bearer ', '');
      // Verify the token
      const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_CODE);
      const user = await User.findById(decoded.id).populate('Company');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      // Set the user in the request object for further use
      req.user = user;
      // Call the next middleware
      next();

    } else {
      // Get the user Id from the request headers
      const userId = req.header('Authorization');
      console.log(userId);
      const user = await User.findById(userId).populate('Company');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      // Set the user in the request object for further use
      req.user = user;
      // Call the next middleware
      next();
    }
  } catch (error) {
    console.error('Token verification error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    // Handle other errors
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = authMiddleware;






