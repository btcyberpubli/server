const { leerJSON, escribirJSON } = require('../utils/helpers');
const reporteService = require('./reporteService');
const fs = require('fs');
const path = require('path');

/**
 * SERVICIO DE HISTÓRICO
 * Guarda copias mensuales de ganancias en JSON
 */

const DIR_HISTORIAL = path.join(__dirname, '../../data/historial');

// Crear directorio si no existe
if (!fs.existsSync(DIR_HISTORIAL)) {
  fs.mkdirSync(DIR_HISTORIAL, { recursive: true });
}

function obtenerNombreArchivoHistorico(año, mes) {
  const mesStr = String(mes).padStart(2, '0');
  return `ganancias-${año}-${mesStr}.json`;
}

function guardarHistoricoMensual(año, mes) {
  try {
    // Obtener ganancias del mes
    const ganancias = reporteService.obtenerGananciasMensuales(año, mes);
    
    if (!ganancias || ganancias.ventas.length === 0) {
      return null; // No hay datos para guardar
    }

    const nombreArchivo = obtenerNombreArchivoHistorico(año, mes);
    const rutaArchivo = path.join(DIR_HISTORIAL, nombreArchivo);

    const datosHistorico = {
      fecha_guardado: new Date().toISOString(),
      año,
      mes,
      resumen: {
        total_ventas: ganancias.total_ventas,
        costo_total: ganancias.costo_total,
        ganancia_total: ganancias.ganancia_total,
        ganancia_promedio: ganancias.ganancia_promedio,
        cantidad_ventas: ganancias.ventas.length
      },
      ventas: ganancias.ventas
    };

    fs.writeFileSync(rutaArchivo, JSON.stringify(datosHistorico, null, 2), 'utf8');
    
    console.log(`✅ Histórico guardado: ${nombreArchivo}`);
    return datosHistorico;
  } catch (error) {
    console.error('Error al guardar histórico:', error);
    return null;
  }
}

function obtenerHistoricoMensual(año, mes) {
  try {
    const nombreArchivo = obtenerNombreArchivoHistorico(año, mes);
    const rutaArchivo = path.join(DIR_HISTORIAL, nombreArchivo);

    if (!fs.existsSync(rutaArchivo)) {
      return null;
    }

    const contenido = fs.readFileSync(rutaArchivo, 'utf8');
    return JSON.parse(contenido);
  } catch (error) {
    console.error('Error al obtener histórico:', error);
    return null;
  }
}

function listarHistoricos() {
  try {
    if (!fs.existsSync(DIR_HISTORIAL)) {
      return [];
    }

    const archivos = fs.readdirSync(DIR_HISTORIAL);
    const historicos = archivos
      .filter(f => f.startsWith('ganancias-') && f.endsWith('.json'))
      .sort()
      .reverse() // Más recientes primero
      .map(f => {
        const rutaArchivo = path.join(DIR_HISTORIAL, f);
        const contenido = JSON.parse(fs.readFileSync(rutaArchivo, 'utf8'));
        return {
          archivo: f,
          año: contenido.año,
          mes: contenido.mes,
          fecha_guardado: contenido.fecha_guardado,
          resumen: contenido.resumen
        };
      });

    return historicos;
  } catch (error) {
    console.error('Error al listar históricos:', error);
    return [];
  }
}

module.exports = {
  guardarHistoricoMensual,
  obtenerHistoricoMensual,
  listarHistoricos
};
