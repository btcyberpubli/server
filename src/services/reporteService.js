const { leerJSON } = require('../utils/helpers');
const ventaService = require('./ventaService');
const productoService = require('./productoService');

/**
 * SERVICIO DE REPORTES
 */

function gananciasMensuales(mes, anio = new Date().getFullYear()) {
  const datos = leerJSON('ventas');
  if (!datos) return null;

  const ventasDelMes = (datos.ventas || []).filter(v => {
    const fecha = new Date(v.fecha);
    return v.estado === 'confirmada' && 
           fecha.getMonth() === mes - 1 && 
           fecha.getFullYear() === anio;
  });

  const gananciaTotalMes = ventasDelMes.reduce((sum, v) => sum + (v.ganancia_total || 0), 0);
  const ventasTotalMes = ventasDelMes.reduce((sum, v) => sum + v.total, 0);
  const costoTotalMes = ventasDelMes.reduce((sum, v) => sum + (v.subtotal - v.ganancia_total), 0);

  return {
    mes,
    anio,
    cantidad_ventas: ventasDelMes.length,
    venta_total: parseFloat(ventasTotalMes.toFixed(2)),
    costo_total: parseFloat(costoTotalMes.toFixed(2)),
    ganancia_total: parseFloat(gananciaTotalMes.toFixed(2)),
    ganancia_promedio_venta: ventasDelMes.length > 0 ? parseFloat((gananciaTotalMes / ventasDelMes.length).toFixed(2)) : 0,
    ventas_detalle: ventasDelMes.map(v => ({
      id_venta: v.id_venta,
      fecha: v.fecha,
      cliente: v.cliente_nombre,
      total: v.total,
      ganancia: v.ganancia_total
    }))
  };
}

function topProductosVendidos(limit = 10, mes = null, anio = null) {
  const datos = leerJSON('ventas');
  if (!datos) return [];

  let detalles = (datos.detalles_ventas || []);

  // Filtrar por mes si se proporciona
  if (mes && anio) {
    const ventasDelMes = (datos.ventas || []).filter(v => {
      const fecha = new Date(v.fecha);
      return fecha.getMonth() === mes - 1 && fecha.getFullYear() === anio && v.estado === 'confirmada';
    }).map(v => v.id_venta);

    detalles = detalles.filter(d => ventasDelMes.includes(d.id_venta));
  } else {
    // Filtrar solo confirmadas
    const ventasConfirmadas = (datos.ventas || [])
      .filter(v => v.estado === 'confirmada')
      .map(v => v.id_venta);
    detalles = detalles.filter(d => ventasConfirmadas.includes(d.id_venta));
  }

  // Agrupar por producto
  const productosCantidad = {};
  detalles.forEach(d => {
    if (!productosCantidad[d.id_producto]) {
      productosCantidad[d.id_producto] = {
        id_producto: d.id_producto,
        nombre: d.producto_nombre,
        total_cantidad_vendida: 0,
        total_ingresos: 0,
        total_ganancia: 0,
        cantidad_transacciones: 0
      };
    }
    productosCantidad[d.id_producto].total_cantidad_vendida += d.cantidad;
    productosCantidad[d.id_producto].total_ingresos += d.subtotal_con_descuento;
    productosCantidad[d.id_producto].total_ganancia += d.ganancia;
    productosCantidad[d.id_producto].cantidad_transacciones += 1;
  });

  // Convertir a array y ordenar
  const top = Object.values(productosCantidad)
    .sort((a, b) => b.total_cantidad_vendida - a.total_cantidad_vendida)
    .slice(0, limit)
    .map(p => ({
      ...p,
      total_ingresos: parseFloat(p.total_ingresos.toFixed(2)),
      total_ganancia: parseFloat(p.total_ganancia.toFixed(2))
    }));

  return top;
}

function productosBajoStock() {
  const productos = productoService.obtenerProductos({ stock_bajo: true });
  
  return productos.map(p => ({
    id: p.id,
    nombre: p.nombre,
    stock_actual: p.stock_actual,
    stock_minimo: p.stock_minimo,
    stock_faltante: p.stock_minimo - p.stock_actual,
    costo: p.costo,
    precio_venta: p.precio_venta
  }));
}

function resumenGeneral() {
  const productos = productoService.obtenerProductos();
  const datos = leerJSON('ventas');
  const clientes = leerJSON('clientes');

  if (!datos || !clientes) return null;

  const ventasConfirmadas = (datos.ventas || []).filter(v => v.estado === 'confirmada');
  const ventasPendientes = (datos.ventas || []).filter(v => v.estado === 'pendiente');
  const ventasAnuladas = (datos.ventas || []).filter(v => v.estado === 'anulada');

  const deudaTotal = (clientes.clientes || []).reduce((sum, c) => sum + c.deuda_total, 0);
  const gananciaTotalHistorico = ventasConfirmadas.reduce((sum, v) => sum + (v.ganancia_total || 0), 0);
  const ventaTotalHistorico = ventasConfirmadas.reduce((sum, v) => sum + v.total, 0);

  const productosBajo = productos.filter(p => p.stock_actual <= p.stock_minimo);

  return {
    fecha_reporte: new Date().toISOString(),
    productos: {
      total: productos.length,
      activos: productos.filter(p => p.activo).length,
      bajo_stock: productosBajo.length,
      valor_inventario: parseFloat(productos.reduce((sum, p) => sum + (p.stock_actual * p.costo), 0).toFixed(2))
    },
    ventas: {
      total_confirmadas: ventasConfirmadas.length,
      total_pendientes: ventasPendientes.length,
      total_anuladas: ventasAnuladas.length,
      venta_total_historico: parseFloat(ventaTotalHistorico.toFixed(2)),
      ganancia_total_historico: parseFloat(gananciaTotalHistorico.toFixed(2))
    },
    clientes: {
      total: (clientes.clientes || []).length,
      con_deuda: (clientes.clientes || []).filter(c => c.deuda_total > 0).length,
      deuda_total: parseFloat(deudaTotal.toFixed(2))
    }
  };
}

module.exports = {
  gananciasMensuales,
  topProductosVendidos,
  productosBajoStock,
  resumenGeneral
};
