const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    console.log('No token provided.');
    return res.sendStatus(401);
  }

  console.log('Token received:', token);
  console.log('JWT_SECRET:', process.env.JWT_SECRET);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT verification failed:', err);
      return res.sendStatus(403);
    }
    console.log('JWT verification successful. User:', user);
    req.user = user;
    next();
  });
}

module.exports = { protect: authenticateToken };
