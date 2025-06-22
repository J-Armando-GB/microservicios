// Importa dependencias principales
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

console.log('[Gateway] Iniciando API Gateway...');

// Middleware de logging para registrar todas las peticiones que pasan por el gateway
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.originalUrl}`);
  next();
});

// Configuración de opciones comunes para los proxies, incluyendo logging y manejo de errores
const proxyOptions = {
  onProxyReq: (proxyReq, req) => {
    // Log de la petición redirigida
    console.log(`[Gateway] Redirigiendo ${req.method} ${req.originalUrl} → ${proxyReq.path}`);
  },
  onProxyRes: (proxyRes) => {
    // Log de la respuesta recibida del servicio destino
    console.log(`[Gateway] Respuesta recibida con status ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    // Manejo de errores en el proxy
    console.error(`[Gateway] Error en proxy: ${err.message}`);
    res.status(500).send('Error en el gateway');
  }
};

// Proxy para el servicio catálogo
app.use('/catalogo', createProxyMiddleware({
  target: 'http://localhost:3000',
  pathRewrite: { '^/catalogo': '' }, // Elimina el prefijo /catalogo
  ...proxyOptions
}));

// Proxy para el servicio de usuarios
app.use('/usuarios', createProxyMiddleware({
  target: 'http://localhost:3001',
  pathRewrite: { '^/usuarios': '' }, // Elimina el prefijo /usuarios
  ...proxyOptions
}));

// Proxy para el servicio de recomendaciones
app.use('/recomendar', createProxyMiddleware({
    target: 'http://localhost:3002',
    pathRewrite: { '^/recomendar': '/recomendar' }, // Mantiene el prefijo /recomendar
    ...proxyOptions
  }));

// Inicia el gateway en el puerto 8080
app.listen(8080, () => {
  console.log('[Gateway] Gateway escuchando en puerto 8080 🌐');
  console.log('[Gateway] Rutas configuradas:');
  console.log('[Gateway]   /catalogo    → http://localhost:3000');
  console.log('[Gateway]   /usuarios    → http://localhost:3001');
  console.log('[Gateway]   /recomendar  → http://localhost:3002');
});