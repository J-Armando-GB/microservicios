// Importa dependencias principales
const express = require('express');
const axios = require('axios');
const app = express();

console.log('[Recomendaciones] Iniciando servicio...\n');

// Configuración de URLs y timeout
const CATALOGO_URL = 'http://localhost:3000/peliculas';
const TIMEOUT = 5000; // 5 segundos

// Middleware de logging para registrar cada petición
app.use((req, res, next) => {
  console.log(`[Recomendaciones] ${req.method} ${req.originalUrl}`);
  next();
});

// Endpoint principal para recomendar una película por género
app.get('/recomendar/:genero', async (req, res) => {
  const genero = decodeURIComponent(req.params.genero);
  console.log(`[Recomendaciones] 🎯 Género solicitado: "${genero}"`);

  try {
    // 1. Llama al servicio catálogo para obtener películas del género solicitado
    const url = `${CATALOGO_URL}/${encodeURIComponent(genero)}`;
    console.log(`[Recomendaciones] 🔗 Llamando a catálogo: ${url}`);
    
    const response = await axios.get(url, { timeout: TIMEOUT });
    const peliculas = response.data;

    // 2. Valida que la respuesta sea un arreglo
    if (!Array.isArray(peliculas)) {
      throw new Error('Formato de datos inválido del catálogo');
    }

    // 3. Si no hay películas, responde con error 404
    if (peliculas.length === 0) {
      console.log('[Recomendaciones] ⚠️ No hay películas para este género');
      return res.status(404).json({
        error: 'No hay películas disponibles',
        genero
      });
    }

    // 4. Selecciona una película aleatoria para recomendar
    const recomendacion = peliculas[Math.floor(Math.random() * peliculas.length)];
    console.log(`[Recomendaciones] 🎬 Recomendación: "${recomendacion.titulo}"`);

    // 5. Responde con la recomendación y metadatos
    res.json({
      genero,
      recomendacion,
      total_peliculas: peliculas.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Manejo de errores de comunicación o internos
    console.error('[Recomendaciones] ❌ Error:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status
    });

    // Responde según el tipo de error
    if (error.response) {
      res.status(502).json({
        error: 'Error en el servicio catálogo',
        status: error.response.status,
        details: error.response.data
      });
    } else if (error.request) {
      res.status(504).json({
        error: 'El catálogo no respondió',
        timeout: TIMEOUT
      });
    } else {
      res.status(500).json({
        error: 'Error interno',
        details: error.message
      });
    }
  }
});

// Inicia el servidor en el puerto 3002
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`\n[Recomendaciones] 🚀 Servicio listo en http://localhost:${PORT}`);
  console.log('[Recomendaciones] Endpoint:');
  console.log(`[Recomendaciones] GET    /recomendar/:genero\n`);
});