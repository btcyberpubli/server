/**
 * LÓGICA PRINCIPAL DEL DASHBOARD
 */

// Variables globales
let ventaActual = null;
let clienteSeleccionado = null;
let productosVenta = [];
let procesandoVenta = false; // Flag para evitar doble click
let tipoPagoSeleccionado = null;
let montoPagado = 0;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  if (!estaAutenticado()) {
    window.location.href = 'index.html';
    return;
  }

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  document.getElementById('usuarioNombre').textContent = usuario.nombre;

  cargarProductos();
  cargarClientes();
  cargarResumenRapido();

  // Actualizar resumen cada 30 segundos
  setInterval(cargarResumenRapido, 30000);
});

// ===== UTILIDADES DE MODALES =====
function abrirModal(idModal) {
  document.getElementById(idModal).classList.add('activo');
}

function cerrarModal(idModal) {
  document.getElementById(idModal).classList.remove('activo');
  
  // Restaurar el estado del botón de confirmación de venta si se cierra ese modal
  if (idModal === 'modalGenerarVenta') {
    const btnConfirmar = document.querySelector('#pasoPago .btn-primary');
    if (btnConfirmar) {
      btnConfirmar.disabled = false;
      btnConfirmar.textContent = 'CONFIRMAR VENTA';
    }
    // Resetear todas las variables de venta
    procesandoVenta = false;
    ventaActual = null;
    clienteSeleccionado = null;
    productosVenta = [];
    tipoPagoSeleccionado = null;
    montoPagado = 0;
  }
}

function cerrarModalAlHacerClick(evento, idModal) {
  if (evento.target.id === idModal) {
    cerrarModal(idModal);
  }
}

// ===== CARGAR PRODUCTOS =====
async function cargarProductos() {
  try {
    const response = await fetchAPI('/productos?activo=true');
    const selectAStock = document.getElementById('productoAStock');
    const selectVenta = document.getElementById('productoVenta');

    // Limpiar opciones
    selectAStock.innerHTML = '<option value="">Seleccionar producto...</option>';
    selectVenta.innerHTML = '<option value="">Seleccionar producto...</option>';

    response.productos.forEach(p => {
      const optionAStock = document.createElement('option');
      optionAStock.value = p.id;
      optionAStock.textContent = `${p.nombre} (Stock: ${p.stock_actual})`;
      selectAStock.appendChild(optionAStock);

      const optionVenta = document.createElement('option');
      optionVenta.value = p.id;
      optionVenta.textContent = `${p.nombre} (Disponible: ${p.stock_actual})`;
      selectVenta.appendChild(optionVenta);
    });
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

// ===== CARGAR CLIENTES =====
async function cargarClientes() {
  try {
    const response = await fetchAPI('/clientes?activo=true');
    const selectCliente = document.getElementById('clienteVenta');

    selectCliente.innerHTML = '<option value="">Seleccionar cliente...</option>';

    response.clientes.forEach(c => {
      const option = document.createElement('option');
      option.value = c.id;
      option.textContent = `${c.nombre} (Deuda: ${formatoMoneda(c.deuda_total)})`;
      selectCliente.appendChild(option);
    });
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

// ===== ABRIR MODAL DE CLIENTES =====
async function abrirModalClientes() {
  try {
    const response = await fetchAPI('/clientes?activo=true');
    const tbody = document.querySelector('#tablaClientes tbody');
    tbody.innerHTML = '';

    response.clientes.forEach(c => {
      const fila = document.createElement('tr');
      const totalPagado = c.total_pagado || 0;
      
      const botonesHTML = `
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-sm btn-success" onclick="abrirModalPagarDeuda('${c.id}', '${c.nombre}', ${c.deuda_total})" style="flex: 1; min-width: 80px; font-size: 12px; padding: 8px;">PAGAR</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarClienteConfirm('${c.id}', '${c.nombre}')" style="flex: 1; min-width: 80px; font-size: 12px; padding: 8px;">ELIMINAR</button>
        </div>
      `;
      
      fila.innerHTML = `
        <td>${c.nombre}</td>
        <td>${c.email}</td>
        <td style="color: ${c.deuda_total > 0 ? '#cc0000' : '#004466'}; font-weight: bold;">
          ${formatoMoneda(c.deuda_total)}
        </td>
        <td style="color: #004466; font-weight: bold;">
          ${formatoMoneda(totalPagado)}
        </td>
        <td style="min-width: 200px;">
          ${botonesHTML}
        </td>
      `;
      tbody.appendChild(fila);
    });

    abrirModal('modalClientes');
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

// ===== PAGAR DEUDA =====
async function abrirModalPagarDeuda(clienteId, clienteNombre, deudaTotal) {
  const monto = prompt(`Pagar deuda de ${clienteNombre}\nDeuda actual: ${formatoMoneda(deudaTotal)}\n\nIngresa el monto a pagar:`, formatoMoneda(deudaTotal).replace('$', ''));
  
  if (!monto || isNaN(parseFloat(monto))) {
    return;
  }

  try {
    await fetchAPI(`/clientes/${clienteId}/pagar-deuda`, 'POST', {
      monto: parseFloat(monto)
    });

    mostrarNotificacion(`✅ Deuda pagada exitosamente`, 'success');
    abrirModalClientes(); // Recargar modal
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

// ===== ELIMINAR CLIENTE =====
function eliminarClienteConfirm(clienteId, clienteNombre) {
  const confirmEliminar = confirm(`¿Estás seguro de que deseas eliminar a "${clienteNombre}"?\n\nEsta acción no se puede deshacer.`);
  
  if (!confirmEliminar) {
    return;
  }

  eliminarCliente(clienteId);
}

async function eliminarCliente(clienteId) {
  try {
    const response = await fetchAPI(`/clientes/${clienteId}`, 'DELETE');
    
    mostrarNotificacion(`✅ ${response.mensaje}`, 'success');
    abrirModalClientes(); // Recargar modal
    cargarClientes(); // Recargar dropdown de ventas
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

// ===== AGREGAR STOCK =====
function abrirModalAgregarStock() {
  document.getElementById('formAgregarStock').reset();
  abrirModal('modalAgregarStock');
}

document.getElementById('formAgregarStock')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const idProducto = document.getElementById('productoAStock').value;
  const cantidad = parseInt(document.getElementById('cantidadStock').value);

  try {
    const response = await fetchAPI(`/productos/${idProducto}/stock`, 'POST', {
      cantidad,
      tipo: 'entrada'
    });

    mostrarNotificacion(`Stock agregado: ${response.producto.nombre}`, 'success');
    cerrarModal('modalAgregarStock');
    cargarProductos();
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
});

// ===== NUEVO PRODUCTO =====
function abrirModalNuevoProducto() {
  document.getElementById('formNuevoProducto').reset();
  document.getElementById('stockMinimo').value = '10';
  abrirModal('modalNuevoProducto');
}

document.getElementById('formNuevoProducto')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombreProducto').value;
  const precio_compra = parseFloat(document.getElementById('precioCosto').value);
  const precio_venta = parseFloat(document.getElementById('precioVenta').value);
  const stock_minimo = parseInt(document.getElementById('stockMinimo').value);

  if (precio_venta <= precio_compra) {
    mostrarNotificacion('El precio de venta debe ser mayor que el costo', 'warning');
    return;
  }

  try {
    const response = await fetchAPI('/productos', 'POST', {
      nombre,
      costo: precio_compra,
      precio_venta,
      stock_minimo
    });

    mostrarNotificacion(`✅ Producto creado: ${response.producto.nombre}`, 'success');
    cerrarModal('modalNuevoProducto');
    cargarProductos();
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
});

// ===== NUEVO CLIENTE =====
function abrirModalNuevoCliente() {
  document.getElementById('formNuevoCliente').reset();
  abrirModal('modalNuevoCliente');
}

document.getElementById('formNuevoCliente')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombreCliente').value;

  try {
    const response = await fetchAPI('/clientes', 'POST', {
      nombre,
      email: `cliente.${Date.now()}@temporal.com`
    });

    mostrarNotificacion(`✅ Cliente creado: ${response.cliente.nombre}`, 'success');
    cerrarModal('modalNuevoCliente');
    cargarClientes();
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
});

// ===== NUEVO CLIENTE DESDE VENTA =====
function abrirModalNuevoClienteVenta() {
  const nombreCliente = prompt('Ingresa el nombre del cliente:');
  
  if (!nombreCliente || nombreCliente.trim() === '') {
    return;
  }

  crearClienteRapido(nombreCliente);
}

async function crearClienteRapido(nombre) {
  try {
    const response = await fetchAPI('/clientes', 'POST', {
      nombre,
      email: `cliente.${Date.now()}@temporal.com`
    });

    mostrarNotificacion(`✅ Cliente creado: ${response.cliente.nombre}`, 'success');
    cargarClientes();
    
    // Auto-seleccionar el nuevo cliente
    setTimeout(() => {
      document.getElementById('clienteVenta').value = response.cliente.id;
    }, 300);
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

// ===== VER STOCK =====
async function abrirModalVerStock() {
  try {
    const response = await fetchAPI('/productos?activo=true');
    const tbody = document.querySelector('#tablaStock tbody');
    tbody.innerHTML = '';

    response.productos.forEach(p => {
      const fila = document.createElement('tr');
      const stockEstado = p.stock_actual <= p.stock_minimo
        ? '<span class="stock-bajo">BAJO</span>'
        : '<span class="stock-ok">OK</span>';

      const botonesHTML = `
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-sm btn-success" onclick="agregarStockProducto('${p.id}', '${p.nombre}')" style="flex: 1; min-width: 60px; font-size: 11px; padding: 6px;">+ Stock</button>
          <button class="btn btn-sm btn-danger" onclick="restarStockProducto('${p.id}', '${p.nombre}')" style="flex: 1; min-width: 60px; font-size: 11px; padding: 6px;">- Stock</button>
        </div>
      `;

      fila.innerHTML = `
        <td>${p.nombre}</td>
        <td><strong>${p.stock_actual}</strong></td>
        <td>${p.stock_minimo}</td>
        <td>${formatoMoneda(p.costo)}</td>
        <td>${formatoMoneda(p.precio_venta)}</td>
        <td>${stockEstado}</td>
        <td style="min-width: 150px;">${botonesHTML}</td>
      `;
      tbody.appendChild(fila);
    });

    abrirModal('modalVerStock');
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

// ===== AGREGAR STOCK DESDE MODAL INVENTARIO =====
async function agregarStockProducto(idProducto, nombreProducto) {
  const cantidad = prompt(`Agregar stock a: ${nombreProducto}\n\n¿Cuántas unidades?`, '1');
  
  if (!cantidad || isNaN(parseInt(cantidad)) || parseInt(cantidad) <= 0) {
    return;
  }

  try {
    const response = await fetchAPI(`/productos/${idProducto}/stock`, 'POST', {
      cantidad: parseInt(cantidad),
      tipo: 'entrada'
    });

    mostrarNotificacion(`✅ Stock agregado: ${response.producto.nombre}`, 'success');
    abrirModalVerStock(); // Recargar modal
    cargarProductos();
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

// ===== RESTAR STOCK DESDE MODAL INVENTARIO =====
async function restarStockProducto(idProducto, nombreProducto) {
  const cantidad = prompt(`Restar stock a: ${nombreProducto}\n\n¿Cuántas unidades?`, '1');
  
  if (!cantidad || isNaN(parseInt(cantidad)) || parseInt(cantidad) <= 0) {
    return;
  }

  try {
    const response = await fetchAPI(`/productos/${idProducto}/stock`, 'POST', {
      cantidad: parseInt(cantidad),
      tipo: 'salida'
    });

    mostrarNotificacion(`✅ Stock restado: ${response.producto.nombre}`, 'success');
    abrirModalVerStock(); // Recargar modal
    cargarProductos();
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

// ===== GENERAR VENTA: PASO 1 =====
function abrirModalGenerarVenta() {
  // Resetear
  ventaActual = null;
  clienteSeleccionado = null;
  productosVenta = [];
  tipoPagoSeleccionado = null;
  montoPagado = 0;

  document.getElementById('pasoCliente').style.display = 'block';
  document.getElementById('pasoProductos').style.display = 'none';
  document.getElementById('pasoPago').style.display = 'none';
  document.getElementById('clienteVenta').value = '';

  abrirModal('modalGenerarVenta');
}

function continuarPasoProductos() {
  const idCliente = document.getElementById('clienteVenta').value;

  if (!idCliente) {
    mostrarNotificacion('Selecciona un cliente', 'warning');
    return;
  }

  clienteSeleccionado = idCliente;

  document.getElementById('pasoCliente').style.display = 'none';
  document.getElementById('pasoProductos').style.display = 'block';
  document.getElementById('productoVenta').value = '';
  document.getElementById('cantidadProducto').value = '';
  document.getElementById('descuentoProducto').value = '0';
  document.getElementById('itemsVenta').innerHTML = '';
  productosVenta = [];
}

function volverPasoCliente() {
  document.getElementById('pasoCliente').style.display = 'block';
  document.getElementById('pasoProductos').style.display = 'none';
}

function continuarPagoPaso() {
  if (productosVenta.length === 0) {
    mostrarNotificacion('Agrega al menos un producto', 'warning');
    return;
  }

  // Calcular total
  const totalVenta = document.getElementById('totalVenta').textContent;
  
  document.getElementById('pasoProductos').style.display = 'none';
  document.getElementById('pasoPago').style.display = 'block';
  document.getElementById('totalPagoFinal').textContent = totalVenta;
  document.getElementById('montoParcial').value = '';
  document.getElementById('montoParcialdiv').style.display = 'none';

  // Agregar listener para radio buttons
  document.querySelectorAll('input[name="tipoPago"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      tipoPagoSeleccionado = e.target.value;
      
      if (tipoPagoSeleccionado === 'parcial') {
        document.getElementById('montoParcialdiv').style.display = 'block';
        document.getElementById('montoParcial').focus();
      } else {
        document.getElementById('montoParcialdiv').style.display = 'none';
        montoPagado = tipoPagoSeleccionado === 'efectivo' ? parseFloat(document.getElementById('totalVenta').textContent.replace('$', '').replace(',', '')) : 0;
      }
    });
  });
}

function volverPasoProductos() {
  document.getElementById('pasoPago').style.display = 'none';
  document.getElementById('pasoProductos').style.display = 'block';
  tipoPagoSeleccionado = null;
  montoPagado = 0;
}

// ===== AGREGAR PRODUCTO A VENTA =====
async function agregarProductoVenta() {
  const idProducto = document.getElementById('productoVenta').value;
  const cantidad = parseInt(document.getElementById('cantidadProducto').value);
  const descuento = parseInt(document.getElementById('descuentoProducto').value);

  if (!idProducto || !cantidad) {
    mostrarNotificacion('Completa todos los campos', 'warning');
    return;
  }

  try {
    const prodResponse = await fetchAPI(`/productos/${idProducto}`);
    const producto = prodResponse.producto;

    if (producto.stock_actual < cantidad) {
      mostrarNotificacion(`Stock insuficiente. Disponible: ${producto.stock_actual}`, 'error');
      return;
    }

    const subtotal = producto.precio_venta * cantidad;
    const descuentoMonto = (subtotal * descuento) / 100;
    const total = subtotal - descuentoMonto;

    const item = {
      id_producto: idProducto,
      nombre: producto.nombre,
      cantidad,
      precio_unitario: producto.precio_venta,
      costo_unitario: producto.costo,
      descuento,
      subtotal,
      descuentoMonto,
      total
    };

    productosVenta.push(item);
    mostrarNotificacion('Producto agregado', 'success');

    // Resetear formulario
    document.getElementById('productoVenta').value = '';
    document.getElementById('cantidadProducto').value = '';
    document.getElementById('descuentoProducto').value = '0';

    actualizarItemsVenta();
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

// ===== ACTUALIZAR ITEMS VENTA =====
function actualizarItemsVenta() {
  const container = document.getElementById('itemsVenta');
  container.innerHTML = '';

  let subtotalTotal = 0;
  let descuentoTotal = 0;

  productosVenta.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-venta';
    itemDiv.innerHTML = `
      <div class="item-venta-header">
        <span class="item-venta-nombre">${item.nombre}</span>
        <span class="item-venta-total">${formatoMoneda(item.total)}</span>
      </div>
      <div class="item-venta-detalles">
        <div>
          <span>Cantidad:</span>
          <span>${item.cantidad}</span>
        </div>
        <div>
          <span>Precio Unitario:</span>
          <span>${formatoMoneda(item.precio_unitario)}</span>
        </div>
        <div>
          <span>Descuento:</span>
          <span>${item.descuento}% (${formatoMoneda(item.descuentoMonto)})</span>
        </div>
        <div>
          <button class="btn btn-danger btn-small" onclick="eliminarProductoVenta(${index})">Eliminar</button>
        </div>
      </div>
    `;
    container.appendChild(itemDiv);

    subtotalTotal += item.subtotal;
    descuentoTotal += item.descuentoMonto;
  });

  const totalFinal = subtotalTotal - descuentoTotal;

  if (productosVenta.length > 0) {
    document.getElementById('resumenVentaDiv').style.display = 'block';
    document.getElementById('subtotalVenta').textContent = formatoMoneda(subtotalTotal);
    document.getElementById('descuentoVenta').textContent = formatoMoneda(descuentoTotal);
    document.getElementById('totalVenta').textContent = formatoMoneda(totalFinal);
  } else {
    document.getElementById('resumenVentaDiv').style.display = 'none';
  }
}

function eliminarProductoVenta(index) {
  productosVenta.splice(index, 1);
  actualizarItemsVenta();
}

// ===== CONFIRMAR VENTA =====
async function confirmarVenta() {
  // Validar forma de pago
  if (!tipoPagoSeleccionado) {
    mostrarNotificacion('Selecciona forma de pago', 'warning');
    return;
  }

  // Obtener total primero
  const totalText = document.getElementById('totalVenta').textContent;
  const total = parseFloat(totalText.replace('$', '').replace(',', ''));

  if (tipoPagoSeleccionado === 'parcial') {
    const monto = parseFloat(document.getElementById('montoParcial').value);
    if (!monto || monto <= 0) {
      mostrarNotificacion('Ingresa monto a pagar', 'warning');
      return;
    }
    if (monto > total) {
      mostrarNotificacion('El monto no puede superar el total', 'warning');
      return;
    }
    montoPagado = monto;
  } else if (tipoPagoSeleccionado === 'efectivo') {
    // Para efectivo, el monto pagado es el total
    montoPagado = total;
  } else {
    // Para deuda, no hay monto pagado inicial
    montoPagado = 0;
  }

  // Evitar doble click
  if (procesandoVenta) {
    mostrarNotificacion('Procesando venta... espera un momento', 'warning');
    return;
  }

  if (productosVenta.length === 0) {
    mostrarNotificacion('Agrega al menos un producto', 'warning');
    return;
  }

  procesandoVenta = true;
  const btnConfirmar = document.querySelector('#pasoPago .btn-primary');
  if (btnConfirmar) {
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = 'Procesando...';
  }

  try {
    // 1. Crear venta CON tipo de pago y monto pagado
    const ventaResponse = await fetchAPI('/ventas', 'POST', {
      id_cliente: clienteSeleccionado,
      tipo_pago: tipoPagoSeleccionado,
      monto_pagado: montoPagado
    });
    ventaActual = ventaResponse.venta;

    // 2. Agregar items
    for (const item of productosVenta) {
      await fetchAPI(`/ventas/${ventaActual.id_venta}/items`, 'POST', {
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        descuento: item.descuento
      });
    }

    // 3. Confirmar venta
    const confirmResponse = await fetchAPI(`/ventas/${ventaActual.id_venta}/confirmar`, 'POST');

    const mensaje = tipoPagoSeleccionado === 'efectivo' 
      ? '✅ Venta pagada en efectivo' 
      : tipoPagoSeleccionado === 'parcial'
      ? `✅ Venta con pago parcial (${formatoMoneda(montoPagado)})`
      : '✅ Venta registrada - Cliente en deuda';

    mostrarNotificacion(mensaje, 'success');
    
    // Esperar y luego cerrar modal
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    cerrarModal('modalGenerarVenta');
    cargarProductos();
    cargarClientes();
    cargarResumenRapido();
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
    // Restaurar el botón en caso de error
    if (btnConfirmar) {
      btnConfirmar.disabled = false;
      btnConfirmar.textContent = 'CONFIRMAR VENTA';
    }
  } finally {
    // Asegurar que procesandoVenta se reinicia siempre
    procesandoVenta = false;
  }
}

// ===== REPORTES =====
function abrirModalReportes() {
  const today = new Date();
  const mesActual = String(today.getMonth() + 1).padStart(2, '0');
  const anioActual = today.getFullYear();
  document.getElementById('mesReporte').value = `${anioActual}-${mesActual}`;

  abrirModal('modalReportes');
}

async function cargarGananciasMensuales() {
  const mesAnio = document.getElementById('mesReporte').value;
  if (!mesAnio) {
    mostrarNotificacion('Selecciona un mes', 'warning');
    return;
  }

  const [anio, mes] = mesAnio.split('-');

  try {
    const response = await fetchAPI(`/reportes/ganancias-mensuales?mes=${mes}&anio=${anio}`);
    const reporte = response.reporte;

    const reporteDiv = document.getElementById('reporteGanancias');
    reporteDiv.innerHTML = `
      <div class="card">
        <h3>Mes ${mes}/${anio}</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Ventas Confirmadas</div>
            <div class="stat-value">${reporte.cantidad_ventas}</div>
          </div>
          <div class="stat-card success">
            <div class="stat-label">Venta Total</div>
            <div class="stat-value">${formatoMoneda(reporte.venta_total)}</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-label">Costo Total</div>
            <div class="stat-value">${formatoMoneda(reporte.costo_total)}</div>
          </div>
          <div class="stat-card success" style="border-left-color: #10b981;">
            <div class="stat-label">Ganancia Total</div>
            <div class="stat-value">${formatoMoneda(reporte.ganancia_total)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Ganancia Promedio/Venta</div>
            <div class="stat-value">${formatoMoneda(reporte.ganancia_promedio_venta)}</div>
          </div>
        </div>

        <h4 style="margin-top: 30px; margin-bottom: 15px;">Detalle de Ventas</h4>
        <table style="width: 100%;">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total Venta</th>
              <th>Ganancia</th>
            </tr>
          </thead>
          <tbody>
            ${reporte.ventas_detalle.map(v => `
              <tr>
                <td>${formatoFechaHora(v.fecha)}</td>
                <td>${v.cliente}</td>
                <td>${formatoMoneda(v.total)}</td>
                <td><strong>${formatoMoneda(v.ganancia)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

async function cargarTopProductos() {
  try {
    const response = await fetchAPI('/reportes/top-productos?limit=10');
    const tabla = document.getElementById('tablaTopProductos');
    const tbody = tabla.querySelector('tbody');

    tbody.innerHTML = response.productos.map(p => `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.total_cantidad_vendida}</td>
        <td>${formatoMoneda(p.total_ingresos)}</td>
        <td><strong>${formatoMoneda(p.total_ganancia)}</strong></td>
      </tr>
    `).join('');

    tabla.style.display = 'table';
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

async function cargarStockBajo() {
  try {
    const response = await fetchAPI('/reportes/stock-bajo');
    const tabla = document.getElementById('tablaStockBajo');
    const tbody = tabla.querySelector('tbody');

    tbody.innerHTML = response.productos.map(p => `
      <tr>
        <td>${p.nombre}</td>
        <td>${p.stock_actual}</td>
        <td>${p.stock_minimo}</td>
        <td><span class="stock-bajo">${p.stock_faltante}</span></td>
      </tr>
    `).join('');

    tabla.style.display = 'table';
  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
}

// ===== RESUMEN RÁPIDO =====
async function cargarResumenRapido() {
  try {
    const response = await fetchAPI('/reportes/resumen-general');
    const resumen = response.resumen;

    const html = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Productos Activos</div>
          <div class="stat-value">${resumen.productos.total}</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">Bajo Stock</div>
          <div class="stat-value">${resumen.productos.bajo_stock}</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">Valor Inventario</div>
          <div class="stat-value">${formatoMoneda(resumen.productos.valor_inventario)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Ventas Confirmadas</div>
          <div class="stat-value">${resumen.ventas.total_confirmadas}</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">Ganancia Total</div>
          <div class="stat-value">${formatoMoneda(resumen.ventas.ganancia_total_historico)}</div>
        </div>
        <div class="stat-card danger">
          <div class="stat-label">Deuda Total de Clientes</div>
          <div class="stat-value">${formatoMoneda(resumen.clientes.deuda_total)}</div>
        </div>
      </div>
    `;

    document.getElementById('resumenRapido').innerHTML = html;
  } catch (error) {
    console.error('Error al cargar resumen:', error);
  }
}

// Cerrar modal al hacer click fuera
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('activo');
  }
});
