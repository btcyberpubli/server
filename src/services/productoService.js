const { leerJSON, escribirJSON, generarId, esNumeroPositivo } = require('../utils/helpers');

/**
 * SERVICIO DE PRODUCTOS
 */

function obtenerProductos(filtros = {}) {
  const datos = leerJSON('productos');
  if (!datos) return [];

  let productos = datos.productos || [];

  if (filtros.activo !== undefined) {
    productos = productos.filter(p => p.activo === filtros.activo);
  }

  if (filtros.stock_bajo) {
    productos = productos.filter(p => p.stock_actual <= p.stock_minimo);
  }

  return productos;
}

function obtenerProductoPorId(id) {
  const datos = leerJSON('productos');
  if (!datos) return null;

  return (datos.productos || []).find(p => p.id === id);
}

function crearProducto(nombre, costo, precio_venta, stock_minimo, unidad = 'unidad') {
  // Validaciones
  if (!nombre || nombre.trim() === '') {
    return { error: 'El nombre del producto es requerido' };
  }

  if (!esNumeroPositivo(costo) || !esNumeroPositivo(precio_venta)) {
    return { error: 'El costo y precio de venta deben ser números positivos' };
  }

  if (precio_venta < costo) {
    return { error: 'El precio de venta no puede ser menor que el costo' };
  }

  if (!esNumeroPositivo(stock_minimo)) {
    return { error: 'El stock mínimo debe ser un número positivo' };
  }

  const datos = leerJSON('productos');
  if (!datos) return { error: 'Error al leer datos' };

  const nuevoProducto = {
    id: generarId('prod'),
    nombre: nombre.trim(),
    costo: parseFloat(costo),
    precio_venta: parseFloat(precio_venta),
    fecha_ingreso: new Date().toISOString(),
    stock_actual: 0,
    stock_minimo: parseInt(stock_minimo),
    unidad: unidad,
    activo: true,
    descuento_aplicado: 0
  };

  datos.productos.push(nuevoProducto);
  escribirJSON('productos', datos);

  return { exito: true, producto: nuevoProducto };
}

function actualizarStock(idProducto, cantidad, tipo = 'entrada') {
  const datos = leerJSON('productos');
  if (!datos) return { error: 'Error al leer datos' };

  const producto = datos.productos.find(p => p.id === idProducto);
  if (!producto) {
    return { error: 'Producto no encontrado' };
  }

  if (tipo === 'salida') {
    if (producto.stock_actual < cantidad) {
      return { error: `Stock insuficiente. Stock actual: ${producto.stock_actual}` };
    }
    producto.stock_actual -= cantidad;
  } else if (tipo === 'entrada') {
    producto.stock_actual += cantidad;
  } else {
    return { error: 'Tipo de movimiento inválido' };
  }

  escribirJSON('productos', datos);

  return { 
    exito: true, 
    stock_anterior: tipo === 'salida' ? producto.stock_actual + cantidad : producto.stock_actual - cantidad,
    stock_actual: producto.stock_actual,
    producto: producto
  };
}

function devolverStock(idProducto, cantidad) {
  return actualizarStock(idProducto, cantidad, 'entrada');
}

function aplicarDescuentoProducto(idProducto, porcentaje) {
  if (porcentaje < 0 || porcentaje > 100) {
    return { error: 'El porcentaje de descuento debe estar entre 0 y 100' };
  }

  const datos = leerJSON('productos');
  if (!datos) return { error: 'Error al leer datos' };

  const producto = datos.productos.find(p => p.id === idProducto);
  if (!producto) {
    return { error: 'Producto no encontrado' };
  }

  producto.descuento_aplicado = porcentaje;
  escribirJSON('productos', datos);

  return { exito: true, producto: producto };
}

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarStock,
  devolverStock,
  aplicarDescuentoProducto
};
