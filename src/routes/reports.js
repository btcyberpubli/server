const express = require('express');
const router = express.Router();
const reporteService = require('../services/reporteService');
const historicoService = require('../services/historicoService');

// GET /api/reportes/ganancias-mensuales
router.get('/ganancias-mensuales', (req, res) => {
  const mes = parseInt(req.query.mes) || new Date().getMonth() + 1;
  const anio = parseInt(req.query.anio) || new Date().getFullYear();

  const reporte = reporteService.gananciasMensuales(mes, anio);

  if (!reporte) {
    return res.status(400).json({ error: 'Error al generar reporte' });
  }

  res.json({
    exito: true,
    reporte
  });
});

// GET /api/reportes/top-productos
router.get('/top-productos', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const mes = req.query.mes ? parseInt(req.query.mes) : null;
  const anio = req.query.anio ? parseInt(req.query.anio) : null;

  const top = reporteService.topProductosVendidos(limit, mes, anio);

  res.json({
    exito: true,
    cantidad: top.length,
    productos: top
  });
});

// GET /api/reportes/stock-bajo
router.get('/stock-bajo', (req, res) => {
  const productos = reporteService.productosBajoStock();

  res.json({
    exito: true,
    cantidad: productos.length,
    productos
  });
});

// GET /api/reportes/resumen-general
router.get('/resumen-general', (req, res) => {
  const resumen = reporteService.resumenGeneral();

  if (!resumen) {
    return res.status(400).json({ error: 'Error al generar resumen' });
  }

  res.json({
    exito: true,
    resumen
  });
});

// GET /api/reportes/historico
router.get('/historico', (req, res) => {
  const historicos = historicoService.listarHistoricos();

  res.json({
    exito: true,
    cantidad: historicos.length,
    historicos
  });
});

// GET /api/reportes/historico/:año/:mes
router.get('/historico/:año/:mes', (req, res) => {
  const año = parseInt(req.params.año);
  const mes = parseInt(req.params.mes);

  if (isNaN(año) || isNaN(mes) || mes < 1 || mes > 12) {
    return res.status(400).json({ error: 'Año o mes inválido' });
  }

  const historico = historicoService.obtenerHistoricoMensual(año, mes);

  if (!historico) {
    return res.status(404).json({ error: 'No hay datos históricos para este período' });
  }

  res.json({
    exito: true,
    historico
  });
});

module.exports = router;
