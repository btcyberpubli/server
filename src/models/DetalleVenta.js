const mongoose = require('mongoose');

const detalleVentaSchema = new mongoose.Schema({
  venta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venta',
    required: true
  },
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  producto_nombre: {
    type: String,
    required: true
  },
  cantidad: {
    type: Number,
    required: [true, 'La cantidad es requerida'],
    min: [1, 'La cantidad debe ser mayor a 0']
  },
  precio_unitario: {
    type: Number,
    required: [true, 'El precio unitario es requerido'],
    min: [0, 'El precio unitario no puede ser negativo']
  },
  costo_unitario: {
    type: Number,
    required: [true, 'El costo unitario es requerido'],
    min: [0, 'El costo unitario no puede ser negativo']
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  descuento_porcentaje: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  descuento_monto: {
    type: Number,
    default: 0,
    min: 0
  },
  subtotal_con_descuento: {
    type: Number,
    required: true,
    min: 0
  },
  ganancia: {
    type: Number,
    default: 0
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Índices para optimizar búsquedas
detalleVentaSchema.index({ venta: 1 });
detalleVentaSchema.index({ producto: 1 });

module.exports = mongoose.model('DetalleVenta', detalleVentaSchema);
