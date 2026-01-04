/**
 * CONFIGURACIÓN DE CORS
 * Edita según tu ambiente
 */

// Dominios permitidos
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8000',
  'https://inventario-sistema-front.vercel.app', // Vercel frontend
  'http://148.230.72.182', // VPS local
  'http://localhost', // Desarrollo
];

// Middleware CORS personalizado
function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;

  // Si está en la lista blanca, permitir
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // Permitir todos (comentar si quieres restrictivo)
    res.header('Access-Control-Allow-Origin', '*');
  }

  // Headers permitidos
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
  
  // Permitir credenciales
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Cache de preflight (1 hora)
  res.header('Access-Control-Max-Age', '3600');

  // Manejar preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
}

module.exports = corsMiddleware;
