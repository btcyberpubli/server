const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: [true, 'El cliente es requerido']
  },
  cliente_nombre: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  descuento: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    default: 0,
    min: 0
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'anulada'],
    default: 'pendiente'
  },
  referencia: {
    type: String,
    default: ''
  },
  items_cantidad: {
    type: Number,
    default: 0,
    min: 0
  },
  ganancia_total: {
    type: Number,
    default: 0
  },
  tipo_pago: {
    type: String,
    enum: ['efectivo', 'deuda', 'parcial'],
    default: 'deuda'
  },
  monto_pagado: {
    type: Number,
    default: 0,
    min: 0
  },
  deuda_generada: {
    type: Number,
    default: 0,
    min: 0
  },
  fecha_confirmacion: {
    type: Date
  },
  fecha_anulacion: {
    type: Date
  }
}, { timestamps: true });

// Índices para optimizar búsquedas
ventaSchema.index({ cliente: 1 });
ventaSchema.index({ estado: 1 });
ventaSchema.index({ fecha: 1 });

module.exports = mongoose.model('Venta', ventaSchema);
