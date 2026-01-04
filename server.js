const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const saleRoutes = require('./src/routes/sales');
const clientRoutes = require('./src/routes/clients');
const reportRoutes = require('./src/routes/reports');
const corsMiddleware = require('./src/utils/cors');
const { authMiddleware } = require('./src/utils/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());

// CORS Configuration (personalizado)
app.use(corsMiddleware);

// Rutas públicas
app.use('/api/auth', authRoutes);

// Rutas protegidas
app.use('/api/productos', authMiddleware, productRoutes);
app.use('/api/ventas', authMiddleware, saleRoutes);
app.use('/api/clientes', authMiddleware, clientRoutes);
app.use('/api/reportes', authMiddleware, reportRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'Backend de Inventario y Ventas activo',
    version: '1.0.0',
    endpoints: {
      auth: 'POST /api/auth/login',
      productos: 'GET /api/productos, POST /api/productos',
      ventas: 'GET /api/ventas, POST /api/ventas',
      clientes: 'GET /api/clientes, POST /api/clientes',
      reportes: 'GET /api/reportes/...'
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor iniciado en puerto ${PORT}`);
  console.log(`📊 Accede a http://localhost:${PORT}\n`);
});
