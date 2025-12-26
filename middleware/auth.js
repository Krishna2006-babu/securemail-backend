/**
 * auth.js
 * JWT authentication middleware with proper error handling
 */

const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // Token missing
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token required"
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

    // Token expired
    if (err && err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again."
      });
    }

    // Invalid token
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid token"
      });
    }

    // Token valid
    req.user = decoded;
    next();
  });
};

module.exports = authenticateToken;

