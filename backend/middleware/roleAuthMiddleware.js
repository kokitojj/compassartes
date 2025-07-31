const jwt = require('jsonwebtoken');

const roleAuthMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (allowedRoles.includes(decoded.role)) {
        req.user = decoded;
        next();
      } else {
        res.status(403).json({ message: 'Require specific role' });
      }
    } catch (error) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};

module.exports = roleAuthMiddleware;
