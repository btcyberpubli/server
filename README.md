# 🎨 FRONTEND - Sistema de Inventario y Ventas

Frontend HTML5 + CSS3 + Vanilla JavaScript puro (sin dependencias)

## ✨ Características

✅ **Autenticación con JWT**
- Login seguro con usuario y contraseña
- Tokens almacenados en localStorage
- Logout automático

✅ **Dashboard Intuitivo**
- 4 botones grandes y claros
- Resumen rápido de métricas
- Responsive (mobile-friendly)

✅ **Funcionalidades**
1. **Agregar Stock** - Incrementar inventario de productos
2. **Ver Stock** - Visualizar inventario completo
3. **Generar Venta** - Crear ventas con múltiples productos y descuentos
4. **Reportes** - Ganancias mensuales, top productos, stock bajo

✅ **Diseño Moderno**
- Interfaz limpia y profesional
- Colores personalizados
- Animaciones suaves
- Notificaciones emergentes

## 📁 Estructura

```
front/
├── index.html              (Página de login)
├── dashboard.html          (Panel principal)
├── assets/
│   ├── css/
│   │   └── styles.css      (Estilos globales)
│   └── js/
│       ├── config.js       (Configuración y utilidades)
│       └── app.js          (Lógica principal)
└── README.md
```

## 🚀 INICIO RÁPIDO

### Opción 1: Servidor Local (Python)

```bash
cd front
python -m http.server 8000
# Accede a http://localhost:8000
```

### Opción 2: Servidor Local (Node.js)

```bash
cd front
npx http-server
# Accede a http://localhost:8080
```

### Opción 3: Servidor Local (PHP)

```bash
cd front
php -S localhost:8000
# Accede a http://localhost:8000
```

### Opción 4: Directamente en el navegador

Simplemente abre `index.html` en tu navegador (funciona pero con limitaciones CORS en localhost).

## ⚙️ Configuración de API

Edita `assets/js/config.js`:

**Desarrollo (localhost):**
```javascript
const API_URL = 'http://localhost:3000/api';
```

**Producción (VPS):**
```javascript
const API_URL = 'http://148.230.72.182/api';
```

## 🔐 Credenciales de Demo

```
Usuario: admin
Contraseña: admin123
```

## 📱 Uso

### 1. Login
- Ingresa las credenciales
- Se genera un token JWT válido por 24 horas

### 2. Dashboard
Ve el resumen de:
- Productos activos y bajo stock
- Valor total del inventario
- Ventas confirmadas
- Ganancia total histórica
- Deuda total de clientes

### 3. Agregar Stock
1. Selecciona un producto
2. Ingresa cantidad a agregar
3. El stock se actualiza automáticamente

### 4. Ver Stock
- Tabla completa de inventario
- Muestra stock actual, mínimo y estado
- Indicador visual de stock bajo

### 5. Generar Venta
**Paso 1:** Selecciona cliente
**Paso 2:** Agrega productos
- Selecciona producto
- Ingresa cantidad
- Aplica descuento (%)
- Botón "Agregar Producto"
- Puedes agregar múltiples productos
- Ver resumen en tiempo real
**Paso 3:** Confirmar
- Se descuenta stock
- Se registra deuda del cliente
- Se genera fecha automáticamente

### 6. Reportes
- **Ganancias Mensuales:** Selecciona mes, ve ganancia, costo, ingresos
- **Top Productos:** Los 10 más vendidos
- **Stock Bajo:** Productos bajo stock mínimo

## 🎨 Personalización

### Cambiar colores

Edita `:root` en `assets/css/styles.css`:

```css
:root {
  --color-primary: #2563eb;      /* Azul */
  --color-success: #10b981;      /* Verde */
  --color-danger: #ef4444;       /* Rojo */
  --color-warning: #f59e0b;      /* Naranja */
}
```

### Cambiar logos/textos

Busca `📦` o `💰` en `dashboard.html` y reemplaza.

## 🔗 Integración con Backend

El frontend hace peticiones HTTP/JSON al backend:

```javascript
// Ejemplo: Crear venta
await fetchAPI('/ventas', 'POST', {
  id_cliente: 'cli-001',
  referencia: 'Venta mostrador'
});
```

Todas las peticiones incluyen automáticamente el token JWT en el header `Authorization`.

## 📱 Responsive Design

✅ Desktop (1200px+)
✅ Tablet (768px - 1199px)
✅ Mobile (<768px)

Botones se adaptan al tamaño de pantalla.

## 🐛 Troubleshooting

### "CORS error"
- Asegúrate que el backend está ejecutándose
- Verifica la URL en `config.js`
- El backend debe permitir CORS (ya viene configurado)

### "Token inválido"
- Hace login nuevamente
- Limpia localStorage: `localStorage.clear()`
- Verifica que el backend esté corriendo

### "No carga productos"
- Backend debe tener productos en `/data/productos.json`
- Ejecuta primero el script de prueba

## 🚀 Despliegue en Producción

### Con Nginx

```bash
# En el VPS
sudo cp -r front /var/www/
sudo nano /etc/nginx/sites-available/inventario-front
```

```nginx
server {
    listen 80;
    server_name 148.230.72.182;

    location / {
        root /var/www/front;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo systemctl restart nginx
```

### Con Apache

```bash
sudo cp -r front /var/www/html/
sudo nano /var/www/html/front/.htaccess
```

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /front/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /front/index.html [L]
</IfModule>
```

## 📊 Flujo Completo

```
1. Usuario abre http://148.230.72.182
2. Ve login (index.html)
3. Ingresa credenciales
4. Backend valida JWT
5. Frontend redirige a dashboard.html
6. Dashboard carga productos, clientes y reportes
7. Usuario interactúa con 4 botones principales
8. Cada acción consume API del backend
9. Cambios se reflejan en tiempo real
```

## 🔒 Seguridad

✅ Tokens JWT con expiración 24h
✅ Contraseñas hasheadas en backend
✅ Validación de campos en frontend y backend
✅ CORS configurado
✅ Sin datos sensibles en localStorage (solo token)

## 📝 Notas

- El frontend es completamente independiente del backend
- Puedes cambiar la URL del API sin modificar la lógica
- Funciona en cualquier navegador moderno
- No requiere build tool ni compilación
- Compatible con HTTP y HTTPS

---

¡Listo para usar! 🎉
