const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Handle MSAL simulated token or standard JWT
      if (token.startsWith('msal_mock_token_') || token.startsWith('entra_id_')) {
        req.user = {
          _id: 'msal_user_id_101',
          name: 'Microsoft Entra ID User',
          email: 'entra.user@enterprise.com',
          role: 'ADMIN',
          authProvider: 'MSAL_ENTRA_ID',
        };
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_inventory_pro_2026');
      
      // Fetch user from DB or use decoded fallback
      if (User && User.findById) {
        req.user = await User.findById(decoded.id).select('-password');
      }
      
      if (!req.user) {
        req.user = {
          _id: decoded.id || 'usr_default_admin',
          name: decoded.name || 'Admin User',
          email: decoded.email || 'admin@inventorypro.com',
          role: decoded.role || 'ADMIN',
        };
      }

      return next();
    } catch (error) {
      logger.warn(`Auth Middleware Error: ${error.message}`);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no bearer token provided' });
  }
};

module.exports = { protect };
