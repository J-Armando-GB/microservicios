const express = require('express');
const mongoose = require('mongoose');
const app = express();

console.log('[Catalogo] Iniciando servicio...\n');

// Configuración de MongoDB
const MONGO_URI = 'mongodb://localhost:27017/catalogo';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('[Catalogo] ✅ Conectado a MongoDB'))
  .catch(err => console.error('[Catalogo] ❌ Error de MongoDB:', err.message));

// Modelo de Película
const Pelicula = mongoose.model('Pelicula', {
  titulo: { type: String, required: true },
  genero: { type: String, required: true },
  año: { type: Number, min: 1895 }
});

// Middlewares
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[Catalogo] ${req.method} ${req.originalUrl}`);
  next();
});

// Endpoints
app.post('/peliculas', async (req, res) => {
  try {
    console.log('[Catalogo] 📝 Datos recibidos:', req.body);
    
    const pelicula = new Pelicula(req.body);
    await pelicula.save();
    
    console.log(`[Catalogo] 🎥 Película creada ID: ${pelicula._id}`);
    res.status(201).json(pelicula);
    
  } catch (error) {
    console.error('[Catalogo] ❌ Error:', error.message);
    res.status(400).json({ 
      error: 'Datos inválidos',
      details: error.message 
    });
  }
});

app.get('/peliculas/:genero', async (req, res) => {
  try {
    const genero = decodeURIComponent(req.params.genero);
    console.log(`[Catalogo] 🔍 Buscando género: "${genero}"`);
    
    const peliculas = await Pelicula.find({ genero });
    
    console.log(`[Catalogo] 📊 Encontradas: ${peliculas.length} películas`);
    res.json(peliculas);
    
  } catch (error) {
    console.error('[Catalogo] ❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Error en la búsqueda',
      details: error.message 
    });
  }
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n[Catalogo] 🚀 Servicio listo en http://localhost:${PORT}`);
  console.log('[Catalogo] Endpoints:');
  console.log(`[Catalogo] POST   /peliculas`);
  console.log(`[Catalogo] GET    /peliculas/:genero\n`);
});