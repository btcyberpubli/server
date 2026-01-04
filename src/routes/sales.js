const express = require('express');
const router = express.Router();
const ventaService = require('../services/ventaService');

// GET /api/ventas
router.get('/', (req, res) => {
  const filtros = {
    estado: req.query.estado,
    mes: req.query.mes ? parseInt(req.query.mes) : null,
    anio: req.query.anio ? parseInt(req.query.anio) : null
  };

  const resultado = ventaService.obtenerVentas(filtros);
  res.json({
    exito: true,
    ...resultado
  });
});

// GET /api/ventas/:id
router.get('/:id', (req, res) => {
  const resultado = ventaService.obtenerVentaPorId(req.params.id);

  if (!resultado) {
    return res.status(404).json({ error: 'Venta no encontrada' });
  }

  res.json({
    exito: true,
    ...resultado
  });
});

// POST /api/ventas
router.post('/', (req, res) => {
  const { id_cliente, referencia } = req.body;

  if (!id_cliente) {
    return res.status(400).json({ error: 'ID de cliente es requerido' });
  }

  const resultado = ventaService.crearVenta(id_cliente, referencia);

  if (resultado.error) {
    return res.status(400).json({ error: resultado.error });
  }

  res.status(201).json(resultado);
});

// POST /api/ventas/:id/items
router.post('/:id/items', (req, res) => {
  const { id_producto, cantidad, precio_unitario, descuento } = req.body;

  if (!id_producto || !cantidad) {
    return res.status(400).json({ error: 'ID de producto y cantidad son requeridos' });
  }

  const resultado = ventaService.agregarItemVenta(
    req.params.id,
    id_producto,
    cantidad,
    precio_unitario,
    descuento || 0
  );

  if (resultado.error) {
    return res.status(400).json({ error: resultado.error });
  }

  res.json(resultado);
});

// POST /api/ventas/:id/confirmar
router.post('/:id/confirmar', (req, res) => {
  const resultado = ventaService.confirmarVenta(req.params.id);

  if (resultado.error) {
    return res.status(400).json({ error: resultado.error });
  }

  res.json(resultado);
});

// POST /api/ventas/:id/anular
router.post('/:id/anular', (req, res) => {
  const resultado = ventaService.anularVenta(req.params.id);

  if (resultado.error) {
    return res.status(400).json({ error: resultado.error });
  }

  res.json(resultado);
});

// POST /api/ventas/detalle/:id/devolver
router.post('/detalle/:id/devolver', (req, res) => {
  const resultado = ventaService.devolverProductoVenta(req.params.id);

  if (resultado.error) {
    return res.status(400).json({ error: resultado.error });
  }

  res.json(resultado);
});

// POST /api/ventas/calcular-descuento
router.post('/calcular-descuento', (req, res) => {
  const { precio, porcentaje } = req.body;

  if (!precio || porcentaje === undefined) {
    return res.status(400).json({ error: 'Precio y porcentaje son requeridos' });
  }

  const resultado = ventaService.calcularPrecioConDescuento(precio, porcentaje);

  if (resultado.error) {
    return res.status(400).json({ error: resultado.error });
  }

  res.json(resultado);
});

module.exports = router;
