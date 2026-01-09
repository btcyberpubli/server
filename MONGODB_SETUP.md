# MongoDB Migration - Setup Instructions

El backend ha sido migrado de JSON a MongoDB. Sigue estos pasos para configurar la base de datos en Railway:

## Paso 1: Agregar MongoDB a tu proyecto Railway

1. Entra a tu dashboard de Railway: https://railway.app/dashboard
2. Selecciona tu proyecto
3. Haz clic en "+ New" (o botón de agregar servicio)
4. Busca "MongoDB" y selecciónalo
5. Click en "Deploy"

Railway creará automáticamente una instancia de MongoDB con:
- Nombre de base de datos: `railway`
- Usuario automático con credenciales

## Paso 2: Obtener la URL de conexión

1. Después de que MongoDB esté deployado, haz clic en el servicio "MongoDB"
2. Ve a la pestaña "Connect"
3. Copia la cadena de conexión (Mongo URL) - debería verse así:
   ```
   mongodb+srv://admin:password@cluster.mongodb.net/railway?retryWrites=true&w=majority
   ```

## Paso 3: Configurar la variable de entorno

1. En tu servicio Node.js en Railway, ve a "Variables"
2. Agrega una nueva variable:
   - **Key**: `MONGO_URL`
   - **Value**: Pega la URL de MongoDB que copiaste

## Paso 4: Deploy automático

Railway detectará automáticamente los cambios. Tu servidor se reiniciará con:
- ✅ Conexión a MongoDB
- ✅ Mongoose ODM configurado
- ✅ Modelos: Cliente, Producto, Venta, DetalleVenta

## Verificar la conexión

Cuando el servidor inicie, deberías ver en los logs:
```
✅ Conectado a MongoDB
```

Si ves un error:
```
❌ Error al conectar MongoDB: ...
```

Verifica que la variable `MONGO_URL` esté correctamente configurada.

## Migracion de datos

Si tienes datos anteriores en JSON, puedes:

**Opción 1: Empezar desde cero (Recomendado)**
- Los datos previos en JSON se pierden al migrar a MongoDB
- Crea nuevos clientes, productos y ventas directamente en la aplicación

**Opción 2: Script de migración (Avanzado)**
- Si necesitas migrar datos, contacta al equipo de desarrollo

## Cambios en el backend

### Servicios actualizados:
- ✅ `clienteService.js` - Ahora usa modelos de Mongoose
- ✅ `productoService.js` - Ahora usa modelos de Mongoose
- ✅ `ventaService.js` - Ahora usa Venta y DetalleVenta

### Rutas actualizadas:
- ✅ Todas las rutas ahora son `async/await` compatible
- ✅ Mejor manejo de errores

### Modelos MongoDB:
- **Cliente**: nombre (único), email (único), deuda_total, total_pagado, etc.
- **Producto**: nombre (único), costo, precio_venta, stock_actual, stock_minimo
- **Venta**: cliente (ref), fecha, total, estado (pendiente/confirmada/anulada)
- **DetalleVenta**: venta (ref), producto (ref), cantidad, precios, descuentos

## Frontend - Cambios

El frontend en `gestion-main` no requiere cambios. Continúa funcionando igual:
- Las APIs devuelven el mismo formato JSON
- Los endpoints son los mismos
- Solo cambia el almacenamiento backend (JSON → MongoDB)

## Testing

Después de configurar MongoDB:

1. **Crear cliente**: Ve a "Clientes" → "+ NUEVO CLIENTE"
2. **Crear producto**: Ve a "Stock" → "+ AGREGAR NUEVO"
3. **Hacer venta**: Ve a "Generar Venta" → Selecciona cliente y producto
4. **Verificar persistencia**: Reinicia el servidor (en Railway, redeploy)
   - Los datos deben permanecer (no se pierden como con JSON)

## Troubleshooting

### "Conectado a MongoDB pero luego errores de autenticación"
- Verifica que la URL esté correctamente copiada (sin espacios)
- Asegúrate que el usuario/contraseña sean correctos

### "Productos/clientes no aparecen después de crear"
- Espera 2-3 segundos (conexión a MongoDB es más lenta que JSON)
- Revisa que no haya errores en la consola del navegador (Dev Tools)

### "Error: Cannot find module Mongoose"
- El `npm install` en Railway debería instalar dependencias automáticamente
- Si no: verifica que `package.json` tenga `"mongoose": "^7.0.0"`

## Próximos pasos

Después de verificar que todo funciona:

1. ✅ Datos persisten (revisa después de reiniciar)
2. ✅ Todas las operaciones CRUD funcionan
3. ✅ No hay errores de conexión en logs

Ahora tu sistema es completamente funcional y listo para producción en Railway!
