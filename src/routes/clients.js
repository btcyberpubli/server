const express = require('express');
const router = express.Router();
const clienteService = require('../services/clienteService');

// GET /api/clientes
router.get('/', (req, res) => {
  const filtros = {
    activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined,
    con_deuda: req.query.con_deuda === 'true'
  };

  const clientes = clienteService.obtenerClientes(filtros);
  res.json({
    exito: true,
    total: clientes.length,
    clientes
  });
});

// GET /api/clientes/:id
router.get('/:id', (req, res) => {
  const cliente = clienteService.obtenerClientePorId(req.params.id);

  if (!cliente) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  res.json({
    exito: true,
    cliente
  });
});

// POST /api/clientes
router.post('/', (req, res) => {
  const { nombre, email, telefono, direccion, ciudad } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'Nombre es requerido' });
  }

  const resultado = clienteService.crearCliente(nombre, email, telefono, direccion, ciudad);

  if (resultado.error) {
    return res.status(400).json({ error: resultado.error });
  }

  res.status(201).json(resultado);
});

// POST /api/clientes/:id/pagar-deuda
router.post('/:id/pagar-deuda', (req, res) => {
  const { monto } = req.body;

  if (!monto) {
    return res.status(400).json({ error: 'Monto a pagar es requerido' });
  }

  const resultado = clienteService.pagarDeuda(req.params.id, monto);

  if (resultado.error) {
    return res.status(400).json({ error: resultado.error });
  }

  res.json(resultado);
});

module.exports = router;
