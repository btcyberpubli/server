const { leerJSON, escribirJSON, generarId, esNumeroPositivo } = require('../utils/helpers');
const productoService = require('./productoService');
const clienteService = require('./clienteService');

/**
 * SERVICIO DE VENTAS
 */

function obtenerVentas(filtros = {}) {
  const datos = leerJSON('ventas');
  if (!datos) return { ventas: [], detalles: [] };

  let ventas = datos.ventas || [];

  if (filtros.estado) {
    ventas = ventas.filter(v => v.estado === filtros.estado);
  }

  if (filtros.mes) {
    ventas = ventas.filter(v => {
      const fecha = new Date(v.fecha);
      return fecha.getMonth() === filtros.mes - 1 && fecha.getFullYear() === (filtros.anio || new Date().getFullYear());
    });
  }

  return {
    ventas,
    detalles: datos.detalles_ventas || [],
    total_ventas: ventas.length
  };
}

function obtenerVentaPorId(idVenta) {
  const datos = leerJSON('ventas');
  if (!datos) return null;

  const venta = (datos.ventas || []).find(v => v.id_venta === idVenta);
  if (!venta) return null;

  const detalles = (datos.detalles_ventas || []).filter(d => d.id_venta === idVenta);

  return { venta, detalles };
}

function crearVenta(idCliente, referencia = '', tipoPago = 'deuda', montoPagado = 0, deuda = 0) {
  const datos = leerJSON('ventas');
  if (!datos) return { error: 'Error al leer datos' };

  // Validar que el cliente existe
  const cliente = clienteService.obtenerClientePorId(idCliente);
  if (!cliente) {
    return { error: 'Cliente no encontrado' };
  }

  const nuevaVenta = {
    id_venta: generarId('vta'),
    cliente: idCliente,
    cliente_nombre: cliente.nombre,
    fecha: new Date().toISOString(),
    subtotal: 0,
    descuento: 0,
    total: 0,
    estado: 'pendiente',
    referencia: referencia || '',
    items_cantidad: 0,
    ganancia_total: 0,
    tipo_pago: tipoPago, // 'efectivo', 'deuda', 'parcial'
    monto_pagado: montoPagado,
    deuda_generada: deuda
  };

  if (!datos.ventas) datos.ventas = [];
  if (!datos.detalles_ventas) datos.detalles_ventas = [];

  datos.ventas.push(nuevaVenta);
  escribirJSON('ventas', datos);

  return { exito: true, venta: nuevaVenta };
}

function agregarItemVenta(idVenta, idProducto, cantidad, precioUnitario = null, descuentoItem = 0) {
  // Validaciones
  if (!esNumeroPositivo(cantidad)) {
    return { error: 'La cantidad debe ser un número positivo' };
  }

  if (descuentoItem < 0 || descuentoItem > 100) {
    return { error: 'El descuento debe estar entre 0 y 100' };
  }

  const datos = leerJSON('ventas');
  if (!datos) return { error: 'Error al leer datos' };

  const venta = (datos.ventas || []).find(v => v.id_venta === idVenta);
  if (!venta) {
    return { error: 'Venta no encontrada' };
  }

  if (venta.estado !== 'pendiente') {
    return { error: 'No se pueden agregar items a una venta que no está pendiente' };
  }

  const producto = productoService.obtenerProductoPorId(idProducto);
  if (!producto) {
    return { error: 'Producto no encontrado' };
  }

  // Verificar stock
  if (producto.stock_actual < cantidad) {
    return { error: `Stock insuficiente. Stock disponible: ${producto.stock_actual}` };
  }

  // Usar precio del producto si no se proporciona
  const precio = precioUnitario || producto.precio_venta;

  if (!esNumeroPositivo(precio)) {
    return { error: 'El precio unitario debe ser un número positivo' };
  }

  const costo = producto.costo;
  const subtotal = cantidad * precio;
  const descuentoMonto = (subtotal * descuentoItem) / 100;
  const subtotalConDescuento = subtotal - descuentoMonto;
  const ganancia = (precio - costo) * cantidad - descuentoMonto;

  const detalle = {
    id_detalle: generarId('det'),
    id_venta: idVenta,
    id_producto: idProducto,
    producto_nombre: producto.nombre,
    cantidad: parseInt(cantidad),
    precio_unitario: parseFloat(precio),
    costo_unitario: parseFloat(costo),
    subtotal: parseFloat(subtotal),
    descuento_porcentaje: descuentoItem,
    descuento_monto: parseFloat(descuentoMonto),
    subtotal_con_descuento: parseFloat(subtotalConDescuento),
    ganancia: parseFloat(ganancia),
    fecha_registro: new Date().toISOString()
  };

  if (!datos.detalles_ventas) datos.detalles_ventas = [];
  datos.detalles_ventas.push(detalle);

  // Actualizar total de la venta
  const detallesVenta = datos.detalles_ventas.filter(d => d.id_venta === idVenta);
  venta.subtotal = detallesVenta.reduce((sum, d) => sum + d.subtotal, 0);
  venta.descuento = detallesVenta.reduce((sum, d) => sum + d.descuento_monto, 0);
  venta.total = detallesVenta.reduce((sum, d) => sum + d.subtotal_con_descuento, 0);
  venta.ganancia_total = detallesVenta.reduce((sum, d) => sum + d.ganancia, 0);
  venta.items_cantidad = detallesVenta.length;

  escribirJSON('ventas', datos);

  return { exito: true, detalle, venta };
}

function calcularPrecioConDescuento(precioOriginal, porcentajeDescuento) {
  if (porcentajeDescuento < 0 || porcentajeDescuento > 100) {
    return { error: 'El porcentaje debe estar entre 0 y 100' };
  }

  const descuento = (precioOriginal * porcentajeDescuento) / 100;
  const precioFinal = precioOriginal - descuento;

  return {
    precio_original: precioOriginal,
    porcentaje_descuento: porcentajeDescuento,
    monto_descuento: parseFloat(descuento.toFixed(2)),
    precio_final: parseFloat(precioFinal.toFixed(2))
  };
}

function confirmarVenta(idVenta) {
  const datos = leerJSON('ventas');
  if (!datos) return { error: 'Error al leer datos' };

  const venta = (datos.ventas || []).find(v => v.id_venta === idVenta);
  if (!venta) {
    return { error: 'Venta no encontrada' };
  }

  if (venta.estado !== 'pendiente') {
    return { error: 'La venta no está en estado pendiente' };
  }

  const detalles = (datos.detalles_ventas || []).filter(d => d.id_venta === idVenta);
  if (detalles.length === 0) {
    return { error: 'No hay items en la venta' };
  }

  // Descontar del stock
  for (const detalle of detalles) {
    const resultStock = productoService.actualizarStock(detalle.id_producto, detalle.cantidad, 'salida');
    if (resultStock.error) {
      return { error: `Error al descontar stock de ${detalle.producto_nombre}: ${resultStock.error}` };
    }
  }

  // Actualizar estado y procesar pago según tipo
  venta.estado = 'confirmada';
  venta.fecha_confirmacion = new Date().toISOString();

  // Obtener cliente actual
  const cliente = clienteService.obtenerClientePorId(venta.cliente);
  if (!cliente) {
    return { error: 'Cliente no encontrado al confirmar venta' };
  }

  // Procesar según tipo de pago
  if (venta.tipo_pago === 'efectivo') {
    // Pago en efectivo: se registra monto pagado, sin deuda
    venta.deuda_generada = 0;
    venta.monto_pagado = venta.total;
    cliente.total_pagado = (cliente.total_pagado || 0) + venta.total;
  } else if (venta.tipo_pago === 'deuda') {
    // Compra a crédito: todo el monto es deuda
    venta.deuda_generada = venta.total;
    venta.monto_pagado = 0;
    cliente.deuda_total = (cliente.deuda_total || 0) + venta.total;
  } else if (venta.tipo_pago === 'parcial') {
    // Pago parcial: monto_pagado es registrado, el resto es deuda
    const montoPagado = venta.monto_pagado || 0;
    const deudaGenerada = venta.total - montoPagado;
    venta.deuda_generada = deudaGenerada;
    cliente.total_pagado = (cliente.total_pagado || 0) + montoPagado;
    cliente.deuda_total = (cliente.deuda_total || 0) + deudaGenerada;
  }

  // Actualizar cliente en base de datos
  const resultUpdate = clienteService.actualizarCliente(cliente.id, cliente);
  if (resultUpdate.error) {
    return { error: `Error al actualizar cliente: ${resultUpdate.error}` };
  }

  escribirJSON('ventas', datos);

  return {
    exito: true,
    venta,
    detalles,
    cliente: cliente,
    mensaje: `Venta ${idVenta} confirmada. Pago tipo: ${venta.tipo_pago}.`
  };
}

function anularVenta(idVenta) {
  const datos = leerJSON('ventas');
  if (!datos) return { error: 'Error al leer datos' };

  const venta = (datos.ventas || []).find(v => v.id_venta === idVenta);
  if (!venta) {
    return { error: 'Venta no encontrada' };
  }

  if (venta.estado === 'anulada') {
    return { error: 'La venta ya está anulada' };
  }

  const detalles = (datos.detalles_ventas || []).filter(d => d.id_venta === idVenta);

  // Devolver stock si fue confirmada
  if (venta.estado === 'confirmada') {
    for (const detalle of detalles) {
      productoService.devolverStock(detalle.id_producto, detalle.cantidad);
    }

    // Descontar deuda del cliente
    clienteService.actualizarDeuda(venta.cliente, venta.total, 'pagar');
  }

  venta.estado = 'anulada';
  venta.fecha_anulacion = new Date().toISOString();

  escribirJSON('ventas', datos);

  return {
    exito: true,
    venta,
    mensaje: `Venta ${idVenta} anulada. Stock y deudas revertidas.`
  };
}

function devolverProductoVenta(idDetalle) {
  const datos = leerJSON('ventas');
  if (!datos) return { error: 'Error al leer datos' };

  const detalle = (datos.detalles_ventas || []).find(d => d.id_detalle === idDetalle);
  if (!detalle) {
    return { error: 'Detalle de venta no encontrado' };
  }

  const venta = (datos.ventas || []).find(v => v.id_venta === detalle.id_venta);
  if (!venta || venta.estado !== 'confirmada') {
    return { error: 'No se puede devolver items de una venta no confirmada' };
  }

  // Devolver stock
  const resultStock = productoService.devolverStock(detalle.id_producto, detalle.cantidad);
  if (resultStock.error) {
    return { error: resultStock.error };
  }

  // Actualizar deuda
  clienteService.actualizarDeuda(venta.cliente, detalle.subtotal_con_descuento, 'pagar');

  // Remover detalle
  datos.detalles_ventas = datos.detalles_ventas.filter(d => d.id_detalle !== idDetalle);

  // Actualizar total de la venta
  const detallesRestantes = datos.detalles_ventas.filter(d => d.id_venta === detalle.id_venta);
  venta.subtotal = detallesRestantes.reduce((sum, d) => sum + d.subtotal, 0);
  venta.descuento = detallesRestantes.reduce((sum, d) => sum + d.descuento_monto, 0);
  venta.total = detallesRestantes.reduce((sum, d) => sum + d.subtotal_con_descuento, 0);
  venta.ganancia_total = detallesRestantes.reduce((sum, d) => sum + d.ganancia, 0);
  venta.items_cantidad = detallesRestantes.length;

  escribirJSON('ventas', datos);

  return {
    exito: true,
    mensaje: `Producto devuelto. Stock y deuda actualizados.`
  };
}

module.exports = {
  obtenerVentas,
  obtenerVentaPorId,
  crearVenta,
  agregarItemVenta,
  calcularPrecioConDescuento,
  confirmarVenta,
  anularVenta,
  devolverProductoVenta
};
