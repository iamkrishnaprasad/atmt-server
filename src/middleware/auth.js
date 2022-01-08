require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token)
    return res.status(401).json({
      message: 'Access denied. No token provided.',
    });
  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    req.user = decodedPayload;
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Invalid token.',
    });
  }
};
