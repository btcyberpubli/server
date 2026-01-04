# 📊 SISTEMA DE GESTIÓN DE INVENTARIO Y VENTAS

Backend completo basado en Node.js + Express + JSON

## 🚀 INICIO RÁPIDO

### Instalación
```bash
cd back
npm install
```

### Ejecutar servidor
```bash
npm start           # Producción
npm run dev         # Desarrollo (con watch)
```

El servidor se ejecutará en **http://localhost:3000**

---

## 🔐 AUTENTICACIÓN

### Credenciales de inicio
```
Usuario: admin
Contraseña: admin123
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "usuario": "admin",
  "contraseña": "admin123"
}
```

**Respuesta:**
```json
{
  "exito": true,
  "usuario": {
    "id": "admin-001",
    "usuario": "admin",
    "nombre": "Administrador",
    "rol": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Usar token en todas las peticiones:**
```bash
Authorization: Bearer <token>
```

---

## 📦 PRODUCTOS

### Listar productos
```bash
GET /api/productos
GET /api/productos?activo=true
GET /api/productos?stock_bajo=true
```

### Obtener producto por ID
```bash
GET /api/productos/prod-001
```

### Crear producto
```bash
POST /api/productos
Content-Type: application/json
Authorization: Bearer <token>

{
  "nombre": "Teclado Mecánico RGB",
  "costo": 25.00,
  "precio_venta": 59.99,
  "stock_minimo": 3,
  "unidad": "unidad"
}
```

### Actualizar stock
```bash
POST /api/productos/prod-001/stock
Content-Type: application/json
Authorization: Bearer <token>

{
  "cantidad": 20,
  "tipo": "entrada"    // O "salida"
}
```

### Aplicar descuento a producto
```bash
POST /api/productos/prod-001/descuento
Content-Type: application/json
Authorization: Bearer <token>

{
  "porcentaje": 10
}
```

---

## 👥 CLIENTES

### Listar clientes
```bash
GET /api/clientes
GET /api/clientes?con_deuda=true
```

### Obtener cliente
```bash
GET /api/clientes/cli-001
```

### Crear cliente
```bash
POST /api/clientes
Content-Type: application/json
Authorization: Bearer <token>

{
  "nombre": "Carlos López",
  "email": "carlos@email.com",
  "telefono": "1234567890",
  "direccion": "Calle Principal 123",
  "ciudad": "Buenos Aires"
}
```

### Pagar deuda
```bash
POST /api/clientes/cli-001/pagar-deuda
Content-Type: application/json
Authorization: Bearer <token>

{
  "monto": 150.50
}
```

---

## 🛒 VENTAS

### Listar ventas
```bash
GET /api/ventas
GET /api/ventas?estado=confirmada
GET /api/ventas?mes=12&anio=2025
```

**Estados:** pendiente | confirmada | anulada

### Obtener venta completa
```bash
GET /api/ventas/vta-123456-789
```

### Crear venta (nueva)
```bash
POST /api/ventas
Content-Type: application/json
Authorization: Bearer <token>

{
  "id_cliente": "cli-001",
  "referencia": "Venta mostrador"
}
```

### Agregar item a venta
```bash
POST /api/ventas/vta-123456-789/items
Content-Type: application/json
Authorization: Bearer <token>

{
  "id_producto": "prod-001",
  "cantidad": 2,
  "precio_unitario": 59.99,    // Opcional, usa precio del producto
  "descuento": 10               // Porcentaje de descuento (0-100)
}
```

### Calcular precio con descuento
```bash
POST /api/ventas/calcular-descuento
Content-Type: application/json
Authorization: Bearer <token>

{
  "precio": 100.00,
  "porcentaje": 15
}
```

**Respuesta:**
```json
{
  "precio_original": 100,
  "porcentaje_descuento": 15,
  "monto_descuento": 15.00,
  "precio_final": 85.00
}
```

### Confirmar venta
```bash
POST /api/ventas/vta-123456-789/confirmar
Authorization: Bearer <token>
```

⚠️ Al confirmar:
- Se descuenta el stock
- Se registra la deuda del cliente
- El estado cambia a "confirmada"

### Anular venta
```bash
POST /api/ventas/vta-123456-789/anular
Authorization: Bearer <token>
```

⚠️ Al anular:
- Se devuelve el stock (si fue confirmada)
- Se cancela la deuda del cliente
- El estado cambia a "anulada"

### Devolver producto de venta
```bash
POST /api/ventas/detalle/det-123456-789/devolver
Authorization: Bearer <token>
```

---

## 📊 REPORTES

### Ganancias mensuales
```bash
GET /api/reportes/ganancias-mensuales
GET /api/reportes/ganancias-mensuales?mes=12&anio=2025
```

**Respuesta:**
```json
{
  "exito": true,
  "reporte": {
    "mes": 12,
    "anio": 2025,
    "cantidad_ventas": 5,
    "venta_total": 1250.50,
    "costo_total": 625.25,
    "ganancia_total": 625.25,
    "ganancia_promedio_venta": 125.05,
    "ventas_detalle": [...]
  }
}
```

### Top productos vendidos
```bash
GET /api/reportes/top-productos
GET /api/reportes/top-productos?limit=5&mes=12&anio=2025
```

### Stock bajo
```bash
GET /api/reportes/stock-bajo
```

### Resumen general
```bash
GET /api/reportes/resumen-general
```

**Respuesta:**
```json
{
  "exito": true,
  "resumen": {
    "fecha_reporte": "2025-12-15T10:30:00.000Z",
    "productos": {
      "total": 25,
      "activos": 24,
      "bajo_stock": 3,
      "valor_inventario": 15450.75
    },
    "ventas": {
      "total_confirmadas": 45,
      "total_pendientes": 2,
      "total_anuladas": 1,
      "venta_total_historico": 12500.00,
      "ganancia_total_historico": 5500.00
    },
    "clientes": {
      "total": 18,
      "con_deuda": 5,
      "deuda_total": 2300.50
    }
  }
}
```

---

## 📁 ESTRUCTURA DE DATOS

### Producto
```json
{
  "id": "prod-001",
  "nombre": "Laptop HP",
  "costo": 450.00,
  "precio_venta": 750.00,
  "fecha_ingreso": "2025-12-01T10:00:00Z",
  "stock_actual": 15,
  "stock_minimo": 5,
  "unidad": "unidad",
  "activo": true,
  "descuento_aplicado": 0
}
```

### Cliente
```json
{
  "id": "cli-001",
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "telefono": "1234567890",
  "direccion": "Calle 1, Apto 101",
  "ciudad": "Buenos Aires",
  "deuda_total": 0.00,
  "activo": true,
  "fecha_registro": "2025-12-01T00:00:00Z"
}
```

### Venta (Cabecera)
```json
{
  "id_venta": "vta-123456-789",
  "cliente": "cli-001",
  "cliente_nombre": "Juan Pérez",
  "fecha": "2025-12-15T10:30:00Z",
  "subtotal": 150.00,
  "descuento": 15.00,
  "total": 135.00,
  "estado": "confirmada",
  "items_cantidad": 2,
  "ganancia_total": 50.00,
  "referencia": "Venta mostrador"
}
```

### Detalle de Venta
```json
{
  "id_detalle": "det-123456-789",
  "id_venta": "vta-123456-789",
  "id_producto": "prod-001",
  "producto_nombre": "Mouse inalámbrico",
  "cantidad": 2,
  "precio_unitario": 12.99,
  "costo_unitario": 5.00,
  "subtotal": 25.98,
  "descuento_porcentaje": 10,
  "descuento_monto": 2.60,
  "subtotal_con_descuento": 23.38,
  "ganancia": 15.98,
  "fecha_registro": "2025-12-15T10:30:00Z"
}
```

---

## ⚙️ REGLAS DE NEGOCIO

✅ **Validaciones implementadas:**
- ❌ No permitir vender si stock < cantidad
- ❌ No permitir precios negativos
- ❌ No permitir crear venta sin detalles
- ❌ Bloquear descuentos inválidos (< 0 o > 100)
- ❌ Precio venta >= precio costo
- ❌ No permitir pagar deuda mayor que la adeudada

✅ **Automatizaciones:**
- Cálculo automático de subtotales y totales
- Cálculo automático de ganancias
- Actualización automática de stock al confirmar
- Registro automático de deudas de clientes
- Rollback de stock si se anula venta confirmada

---

## 🗂️ ESTRUCTURA DE CARPETAS

```
back/
├── src/
│   ├── routes/
│   │   ├── auth.js          (autenticación)
│   │   ├── products.js      (CRUD productos)
│   │   ├── sales.js         (CRUD ventas)
│   │   ├── clients.js       (CRUD clientes)
│   │   └── reports.js       (reportes)
│   ├── services/
│   │   ├── productoService.js
│   │   ├── ventaService.js
│   │   ├── clienteService.js
│   │   └── reporteService.js
│   └── utils/
│       ├── auth.js          (JWT y autenticación)
│       └── helpers.js       (utilitarios)
├── data/
│   ├── usuarios.json        (almacén de usuarios)
│   ├── productos.json       (almacén de productos)
│   ├── clientes.json        (almacén de clientes)
│   └── ventas.json          (almacén de ventas)
├── server.js                (entrada principal)
├── package.json
└── README.md
```

---

## 🔄 FLUJO COMPLETO DE UNA VENTA

### 1. Crear venta
```bash
POST /api/ventas
{
  "id_cliente": "cli-001"
}
# Respuesta: venta en estado "pendiente"
```

### 2. Agregar items
```bash
POST /api/ventas/vta-123/items
{
  "id_producto": "prod-001",
  "cantidad": 2,
  "descuento": 5
}
# Total se actualiza automáticamente
```

### 3. Agregar más items (opcional)
```bash
POST /api/ventas/vta-123/items
{
  "id_producto": "prod-002",
  "cantidad": 1,
  "descuento": 0
}
```

### 4. Ver venta completa
```bash
GET /api/ventas/vta-123
# Muestra: venta + todos los detalles
```

### 5. Confirmar venta
```bash
POST /api/ventas/vta-123/confirmar
# Descuenta stock, registra deuda del cliente
```

### 6. Ver ganancias del mes
```bash
GET /api/reportes/ganancias-mensuales?mes=12&anio=2025
```

---

## 🚨 CÓDIGOS DE ERROR

| Código | Mensaje | Solución |
|--------|---------|----------|
| 400 | Campos requeridos faltantes | Verifica JSON |
| 400 | Stock insuficiente | Revisa cantidad |
| 401 | Token no proporcionado | Incluye Authorization header |
| 401 | Token inválido o expirado | Haz login nuevamente |
| 404 | Recurso no encontrado | Verifica el ID |

---

## 📝 NOTAS

- Los datos se almacenan en archivos JSON (sin base de datos)
- Los tokens expiran en **24 horas**
- Los descuentos se aplican **por item** en la venta
- La deuda se registra al **confirmar** la venta
- Se puede devolver productos de ventas confirmadas

---

Hecho para ejecutarse en VPS. ¡Listo para producción! 🚀
