const express = require('express');
const router = express.Router();
const ventaService = require('../services/ventaService');

// GET /api/ventas
router.get('/', async (req, res) => {
  try {
    const filtros = {
      estado: req.query.estado,
      mes: req.query.mes ? parseInt(req.query.mes) : null,
      anio: req.query.anio ? parseInt(req.query.anio) : null
    };

    const resultado = await ventaService.obtenerVentas(filtros);
    res.json({
      exito: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

// GET /api/ventas/:id
router.get('/:id', async (req, res) => {
  try {
    const resultado = await ventaService.obtenerVentaPorId(req.params.id);

    if (!resultado) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json({
      exito: true,
      ...resultado
    });
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({ error: 'Error al obtener venta' });
  }
});

// POST /api/ventas
router.post('/', async (req, res) => {
  try {
    const { id_cliente, referencia, tipo_pago, monto_pagado } = req.body;

    if (!id_cliente) {
      return res.status(400).json({ error: 'ID de cliente es requerido' });
    }

    // Validar tipo_pago
    const tiposPagoValidos = ['efectivo', 'deuda', 'parcial'];
    const tipoPago = tipo_pago || 'deuda';
    
    if (!tiposPagoValidos.includes(tipoPago)) {
      return res.status(400).json({ error: 'Tipo de pago inválido. Debe ser: efectivo, deuda o parcial' });
    }

    // Para pago parcial, monto_pagado es requerido
    if (tipoPago === 'parcial' && (!monto_pagado || monto_pagado <= 0)) {
      return res.status(400).json({ error: 'Para pago parcial, monto_pagado es requerido y debe ser mayor a 0' });
    }

    const resultado = await ventaService.crearVenta(id_cliente, referencia || '', tipoPago, monto_pagado || 0, 0);

    if (resultado.error) {
      return res.status(400).json({ error: resultado.error });
    }

  res.status(201).json(resultado);
  } catch (error) {
    console.error('Error al crear venta:', error);
    res.status(500).json({ error: 'Error al crear venta' });
  }
});

// POST /api/ventas/:id/items
router.post('/:id/items', async (req, res) => {
  try {
    const { id_producto, cantidad, precio_unitario, descuento } = req.body;

    if (!id_producto || !cantidad) {
      return res.status(400).json({ error: 'ID de producto y cantidad son requeridos' });
    }

    const resultado = await ventaService.agregarItemVenta(
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
  } catch (error) {
    console.error('Error al agregar item a venta:', error);
    res.status(500).json({ error: 'Error al agregar item a venta' });
  }
});

// POST /api/ventas/:id/confirmar
router.post('/:id/confirmar', async (req, res) => {
  try {
    const resultado = await ventaService.confirmarVenta(req.params.id);

    if (resultado.error) {
      return res.status(400).json({ error: resultado.error });
    }

    res.json(resultado);
  } catch (error) {
    console.error('Error al confirmar venta:', error);
    res.status(500).json({ error: 'Error al confirmar venta' });
  }
});

// POST /api/ventas/:id/anular
router.post('/:id/anular', async (req, res) => {
  try {
    const resultado = await ventaService.anularVenta(req.params.id);

    if (resultado.error) {
      return res.status(400).json({ error: resultado.error });
    }

    res.json(resultado);
  } catch (error) {
    console.error('Error al anular venta:', error);
    res.status(500).json({ error: 'Error al anular venta' });
  }
});

// POST /api/ventas/detalle/:id/devolver
router.post('/detalle/:id/devolver', async (req, res) => {
  try {
    const resultado = await ventaService.devolverProductoVenta(req.params.id);

    if (resultado.error) {
      return res.status(400).json({ error: resultado.error });
    }

    res.json(resultado);
  } catch (error) {
    console.error('Error al devolver producto:', error);
    res.status(500).json({ error: 'Error al devolver producto' });
  }
});

// POST /api/ventas/calcular-descuento
router.post('/calcular-descuento', async (req, res) => {
  try {
    const { precio, porcentaje } = req.body;

    if (!precio || porcentaje === undefined) {
      return res.status(400).json({ error: 'Precio y porcentaje son requeridos' });
    }

    const resultado = ventaService.calcularPrecioConDescuento(precio, porcentaje);

    if (resultado.error) {
      return res.status(400).json({ error: resultado.error });
    }

    res.json(resultado);
  } catch (error) {
    console.error('Error al calcular descuento:', error);
    res.status(500).json({ error: 'Error al calcular descuento' });
  }
});

module.exports = router;
