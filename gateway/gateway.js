const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

console.log('[Gateway] Iniciando API Gateway...');

// Middleware de logging para todas las peticiones
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.originalUrl}`);
  next();
});

// Configuración de proxies con logging
const proxyOptions = {
  onProxyReq: (proxyReq, req) => {
    console.log(`[Gateway] Redirigiendo ${req.method} ${req.originalUrl} → ${proxyReq.path}`);
  },
  onProxyRes: (proxyRes) => {
    console.log(`[Gateway] Respuesta recibida con status ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error(`[Gateway] Error en proxy: ${err.message}`);
    res.status(500).send('Error en el gateway');
  }
};

// Configuración de rutas
app.use('/catalogo', createProxyMiddleware({
  target: 'http://localhost:3000',
  pathRewrite: { '^/catalogo': '' },
  ...proxyOptions
}));

app.use('/usuarios', createProxyMiddleware({
  target: 'http://localhost:3001',
  pathRewrite: { '^/usuarios': '' },
  ...proxyOptions
}));

app.use('/recomendar', createProxyMiddleware({
    target: 'http://localhost:3002',
    pathRewrite: { '^/recomendar': '/recomendar' }, // Cambio clave aquí
    ...proxyOptions
  }));

app.listen(8080, () => {
  console.log('[Gateway] Gateway escuchando en puerto 8080 🌐');
  console.log('[Gateway] Rutas configuradas:');
  console.log('[Gateway]   /catalogo    → http://localhost:3000');
  console.log('[Gateway]   /usuarios    → http://localhost:3001');
  console.log('[Gateway]   /recomendar  → http://localhost:3002');
});