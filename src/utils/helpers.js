const fs = require('fs');
const path = require('path');

/**
 * Lee archivo JSON y retorna objeto
 */
function leerJSON(archivo) {
  const ruta = path.join(__dirname, '../..', `data/${archivo}.json`);
  try {
    return JSON.parse(fs.readFileSync(ruta, 'utf8'));
  } catch (error) {
    console.error(`Error al leer ${archivo}.json:`, error.message);
    return null;
  }
}

/**
 * Escribe objeto a archivo JSON
 */
function escribirJSON(archivo, datos) {
  const ruta = path.join(__dirname, '../..', `data/${archivo}.json`);
  try {
    fs.writeFileSync(ruta, JSON.stringify(datos, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error al escribir ${archivo}.json:`, error.message);
    return false;
  }
}

/**
 * Genera ID único
 */
function generarId(prefijo) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefijo}-${timestamp}-${random}`;
}

/**
 * Valida campos requeridos
 */
function validarCampos(obj, campos) {
  const faltantes = campos.filter(campo => !(campo in obj) || obj[campo] === undefined);
  if (faltantes.length > 0) {
    return { valido: false, error: `Campos requeridos faltantes: ${faltantes.join(', ')}` };
  }
  return { valido: true };
}

/**
 * Valida que un número sea positivo
 */
function esNumeroPositivo(valor) {
  return typeof valor === 'number' && valor > 0;
}

/**
 * Valida email básico
 */
function esEmailValido(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

module.exports = {
  leerJSON,
  escribirJSON,
  generarId,
  validarCampos,
  esNumeroPositivo,
  esEmailValido
};
