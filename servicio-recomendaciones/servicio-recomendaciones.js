const express = require('express');
const axios = require('axios');
const app = express();

console.log('[Recomendaciones] Iniciando servicio...\n');

// Configuración
const CATALOGO_URL = 'http://localhost:3000/peliculas';
const TIMEOUT = 5000; // 5 segundos

// Middlewares
app.use((req, res, next) => {
  console.log(`[Recomendaciones] ${req.method} ${req.originalUrl}`);
  next();
});

// Endpoint principal
app.get('/recomendar/:genero', async (req, res) => {
  const genero = decodeURIComponent(req.params.genero);
  console.log(`[Recomendaciones] 🎯 Género solicitado: "${genero}"`);

  try {
    // 1. Obtener películas del catálogo
    const url = `${CATALOGO_URL}/${encodeURIComponent(genero)}`;
    console.log(`[Recomendaciones] 🔗 Llamando a catálogo: ${url}`);
    
    const response = await axios.get(url, { timeout: TIMEOUT });
    const peliculas = response.data;

    // 2. Validar respuesta
    if (!Array.isArray(peliculas)) {
      throw new Error('Formato de datos inválido del catálogo');
    }

    // 3. Seleccionar recomendación
    if (peliculas.length === 0) {
      console.log('[Recomendaciones] ⚠️ No hay películas para este género');
      return res.status(404).json({
        error: 'No hay películas disponibles',
        genero
      });
    }

    const recomendacion = peliculas[Math.floor(Math.random() * peliculas.length)];
    console.log(`[Recomendaciones] 🎬 Recomendación: "${recomendacion.titulo}"`);

    // 4. Responder
    res.json({
      genero,
      recomendacion,
      total_peliculas: peliculas.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Recomendaciones] ❌ Error:', {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status
    });

    // Manejo de errores detallado
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

// Iniciar servidor
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`\n[Recomendaciones] 🚀 Servicio listo en http://localhost:${PORT}`);
  console.log('[Recomendaciones] Endpoint:');
  console.log(`[Recomendaciones] GET    /recomendar/:genero\n`);
});