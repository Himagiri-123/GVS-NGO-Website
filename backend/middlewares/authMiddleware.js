const jwt = require('jsonwebtoken');
const User = require('../models/User');
// Also importing the Staff table here
const Staff = require('../models/Staff'); 

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 1. Decode the token (JWT_SECRET must be set in .env)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 2. First look in the admin (User table)
      let currentUser = await User.findById(decoded.id).select('-password');

      // 3. If not found as admin, also look in the Staff table!
      if (!currentUser) {
        currentUser = await Staff.findById(decoded.id).select('-password');
      }

      // Only throw an error if not found in either table
      if (!currentUser) {
        return res.status(401).json({ message: "User not found in database!" });
      }

      // 4. Password-changed-after-token-issued check (fixed a millisecond rounding bug) - runs for admin only
      if (currentUser.passwordChangedAt) {
        const tokenIssuedAt = decoded.iat; 
        const changedAt = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);

        if (changedAt > tokenIssuedAt) {
          return res.status(401).json({ message: "Password changed. Please login again!" });
        }
      }

      req.user = currentUser;
      next(); 
    } catch (error) {
      console.error("Auth Error:", error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Your login session has expired. Please login again!" });
      }
      res.status(401).json({ message: "Token failed, please login again!" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "No token found, you don't have permission!" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); 
  } else {
    res.status(401).json({ message: "You don't have admin permission!" });
  }
};

module.exports = { protect, admin };