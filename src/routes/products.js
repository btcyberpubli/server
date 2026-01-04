const express = require('express');
const router = express.Router();
const productoService = require('../services/productoService');

// GET /api/productos
router.get('/', (req, res) => {
  const filtros = {
    activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined,
    stock_bajo: req.query.stock_bajo === 'true'
  };

  const productos = productoService.obtenerProductos(filtros);
  res.json({
    exito: true,
    total: productos.length,
    productos
  });
});

// GET /api/productos/:id
router.get('/:id', (req, res) => {
  const producto = productoService.obtenerProductoPorId(req.params.id);
  
  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  res.json({
    exito: true,
    producto
  });
});

// POST /api/productos
router.post('/', (req, res) => {
  const { nombre, costo, precio_venta, stock_minimo, unidad } = req.body;

  const resultado = productoService.crearProducto(
    nombre,
    costo,
    precio_venta,
    stock_minimo || 5,
    unidad
  );

  if (resultado.error) {
    return res.status(400).json({ error: resultado.error });
  }

  res.status(201).json(resultado);
});

// POST /api/productos/:id/stock
router.post('/:id/stock', (req, res) => {
  const { cantidad, tipo } = req.body;

  if (!cantidad || !tipo) {
    return res.status(400).json({ error: 'Cantidad y tipo son requeridos' });
  }

  const resultado = productoService.actualizarStock(req.params.id, cantidad, tipo);

  if (resultado.error) {
    return res.status(400).json({ error: resultado.error });
  }

  res.json(resultado);
});

// POST /api/productos/:id/descuento
router.post('/:id/descuento', (req, res) => {
  const { porcentaje } = req.body;

  if (porcentaje === undefined) {
    return res.status(400).json({ error: 'Porcentaje de descuento es requerido' });
  }

  const resultado = productoService.aplicarDescuentoProducto(req.params.id, porcentaje);

  if (resultado.error) {
    return res.status(400).json({ error: resultado.error });
  }

  res.json(resultado);
});

module.exports = router;
