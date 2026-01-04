const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const SECRET_KEY = 'tu_clave_secreta_muy_segura_2026';

/**
 * Genera token JWT
 */
function generateToken(usuario) {
  return jwt.sign(
    { id: usuario.id, usuario: usuario.usuario, rol: usuario.rol },
    SECRET_KEY,
    { expiresIn: '24h' }
  );
}

/**
 * Verifica token JWT
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware de autenticación
 */
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  req.usuario = decoded;
  next();
}

/**
 * Login de usuario
 */
function loginUsuario(usuario, contraseña) {
  const usuariosPath = path.join(__dirname, '../..', 'data/usuarios.json');
  const datos = JSON.parse(fs.readFileSync(usuariosPath, 'utf8'));
  
  const usuarioEncontrado = datos.usuarios.find(u => 
    u.usuario === usuario && u.contraseña === contraseña && u.activo
  );

  if (!usuarioEncontrado) {
    return null;
  }

  return {
    usuario: usuarioEncontrado,
    token: generateToken(usuarioEncontrado)
  };
}

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
  loginUsuario
};
