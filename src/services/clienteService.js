const { leerJSON, escribirJSON, generarId, esNumeroPositivo } = require('../utils/helpers');
const productoService = require('./productoService');

/**
 * SERVICIO DE CLIENTES
 */

function obtenerClientes(filtros = {}) {
  const datos = leerJSON('clientes');
  if (!datos) return [];

  let clientes = datos.clientes || [];

  if (filtros.activo !== undefined) {
    clientes = clientes.filter(c => c.activo === filtros.activo);
  }

  if (filtros.con_deuda) {
    clientes = clientes.filter(c => c.deuda_total > 0);
  }

  return clientes;
}

function obtenerClientePorId(id) {
  const datos = leerJSON('clientes');
  if (!datos) return null;

  return (datos.clientes || []).find(c => c.id === id);
}

function crearCliente(nombre, email, telefono, direccion, ciudad) {
  // Validaciones
  if (!nombre || nombre.trim() === '') {
    return { error: 'El nombre es requerido' };
  }

  if (!email || email.trim() === '') {
    return { error: 'El email es requerido' };
  }

  const datos = leerJSON('clientes');
  if (!datos) return { error: 'Error al leer datos' };

  const clienteExistente = datos.clientes.find(c => c.email === email);
  if (clienteExistente) {
    return { error: 'Este email ya está registrado' };
  }

  const nuevoCliente = {
    id: generarId('cli'),
    nombre: nombre.trim(),
    email: email.trim(),
    telefono: telefono || '',
    direccion: direccion || '',
    ciudad: ciudad || '',
    deuda_total: 0,
    activo: true,
    fecha_registro: new Date().toISOString()
  };

  datos.clientes.push(nuevoCliente);
  escribirJSON('clientes', datos);

  return { exito: true, cliente: nuevoCliente };
}

function actualizarDeuda(idCliente, monto, tipo = 'agregar') {
  const datos = leerJSON('clientes');
  if (!datos) return { error: 'Error al leer datos' };

  const cliente = datos.clientes.find(c => c.id === idCliente);
  if (!cliente) {
    return { error: 'Cliente no encontrado' };
  }

  const deuda_anterior = cliente.deuda_total;

  if (tipo === 'agregar') {
    cliente.deuda_total += monto;
  } else if (tipo === 'pagar') {
    if (cliente.deuda_total < monto) {
      return { error: `Deuda insuficiente. Deuda actual: ${cliente.deuda_total}` };
    }
    cliente.deuda_total -= monto;
  } else {
    return { error: 'Tipo de movimiento inválido' };
  }

  // Asegurar que la deuda no sea negativa
  cliente.deuda_total = Math.max(0, cliente.deuda_total);

  escribirJSON('clientes', datos);

  return {
    exito: true,
    deuda_anterior,
    deuda_actual: cliente.deuda_total,
    cliente: cliente
  };
}

function pagarDeuda(idCliente, monto) {
  if (!esNumeroPositivo(monto)) {
    return { error: 'El monto a pagar debe ser un número positivo' };
  }

  return actualizarDeuda(idCliente, monto, 'pagar');
}

module.exports = {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarDeuda,
  pagarDeuda
};
