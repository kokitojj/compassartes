const { protect: authenticateToken } = require('./authMiddleware');

// Este middleware combina la autenticación y la verificación del rol de administrador
const adminAuthMiddleware = (req, res, next) => {
  // Primero, usa el middleware de autenticación normal
  authenticateToken(req, res, () => {
    // Después, verifica si el usuario tiene el rol de ADMIN
    if (req.user && req.user.role === 'admin') {
      next(); // El usuario es un admin, permite continuar
    } else {
      // Si no es un admin, devuelve un error de "Prohibido"
      res
        .status(403)
        .json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
  });
};

module.exports = adminAuthMiddleware;
