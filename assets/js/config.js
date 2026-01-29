/**
 * CONFIGURACIÓN GLOBAL
 * Cambiar API_URL según donde despliegues
 */

// DESARROLLO (localhost)
// const API_URL = 'http://localhost:3000/api';

// PRODUCCIÓN (Railway)
const API_URL = 'https://server-production-6fa6.up.railway.app/api';

// Obtener token del localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Verificar si hay sesión activa
function estaAutenticado() {
  return !!getToken();
}

// Hacer petición con autenticación
async function fetchAPI(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const token = getToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error en la petición');
    }

    return result;
  } catch (error) {
    throw error;
  }
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'success') {
  const notif = document.createElement('div');
  notif.className = `notificacion notificacion-${tipo}`;
  notif.textContent = mensaje;
  document.body.appendChild(notif);

  setTimeout(() => notif.remove(), 3000);
}

// Formatear moneda
function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(valor);
}

// Formatear fecha
function formatoFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-AR');
}

// Formatear fecha y hora
function formatoFechaHora(fecha) {
  return new Date(fecha).toLocaleString('es-AR');
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}
