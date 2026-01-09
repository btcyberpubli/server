const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    unique: true,
    lowercase: true,
    trim: true
  },
  costo: {
    type: Number,
    required: [true, 'El costo es requerido'],
    min: [0, 'El costo no puede ser negativo']
  },
  precio_venta: {
    type: Number,
    required: [true, 'El precio de venta es requerido'],
    min: [0, 'El precio de venta no puede ser negativo']
  },
  stock_actual: {
    type: Number,
    default: 0,
    min: [0, 'El stock actual no puede ser negativo']
  },
  stock_minimo: {
    type: Number,
    required: [true, 'El stock mínimo es requerido'],
    min: [0, 'El stock mínimo no puede ser negativo']
  },
  unidad: {
    type: String,
    default: 'unidad'
  },
  activo: {
    type: Boolean,
    default: true
  },
  descuento_aplicado: {
    type: Number,
    default: 0,
    min: [0, 'El descuento no puede ser negativo'],
    max: [100, 'El descuento no puede ser mayor a 100']
  },
  fecha_ingreso: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Validación: precio_venta >= costo
productoSchema.pre('save', function(next) {
  if (this.precio_venta < this.costo) {
    next(new Error('El precio de venta no puede ser menor que el costo'));
  } else {
    next();
  }
});

// Índices para optimizar búsquedas
productoSchema.index({ nombre: 1 });
productoSchema.index({ activo: 1 });
productoSchema.index({ stock_actual: 1 });

module.exports = mongoose.model('Producto', productoSchema);
