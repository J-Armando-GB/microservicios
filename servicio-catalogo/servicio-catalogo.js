// Importa dependencias principales
const express = require('express');
const mongoose = require('mongoose');
const app = express();

console.log('[Catalogo] Iniciando servicio...\n');

// Configuración de conexión a la base de datos MongoDB
const MONGO_URI = 'mongodb+srv://microservicios_user:12345@cluster0.scoabgo.mongodb.net/catalogo?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('[Catalogo] ✅ Conectado a MongoDB'))
  .catch(err => console.error('[Catalogo] ❌ Error de MongoDB:', err.message));

// Definición del modelo de Película usando Mongoose
const Pelicula = mongoose.model('Pelicula', {
  titulo: { type: String, required: true }, // Título de la película
  genero: { type: String, required: true }, // Género de la película
  año: { type: Number, min: 1895 } // Año de estreno (mínimo 1895)
});

// Middlewares
app.use(express.json()); // Permite recibir JSON en las peticiones
app.use((req, res, next) => {
  // Logging de cada petición recibida
  console.log(`[Catalogo] ${req.method} ${req.originalUrl}`);
  next();
});

// Endpoint para crear una nueva película
app.post('/peliculas', async (req, res) => {
  try {
    console.log('[Catalogo] 📝 Datos recibidos:', req.body);
    
    // Crea y guarda una nueva película en la base de datos
    const pelicula = new Pelicula(req.body);
    await pelicula.save();
    
    console.log(`[Catalogo] 🎥 Película creada ID: ${pelicula._id}`);
    res.status(201).json(pelicula);
    
  } catch (error) {
    // Manejo de errores de validación o guardado
    console.error('[Catalogo] ❌ Error:', error.message);
    res.status(400).json({ 
      error: 'Datos inválidos',
      details: error.message 
    });
  }
});

// Endpoint para obtener películas por género
app.get('/peliculas/:genero', async (req, res) => {
  try {
    const genero = decodeURIComponent(req.params.genero);
    console.log(`[Catalogo] 🔍 Buscando género: "${genero}"`);
    
    // Busca todas las películas que coincidan con el género solicitado
    const peliculas = await Pelicula.find({ genero });
    
    console.log(`[Catalogo] 📊 Encontradas: ${peliculas.length} películas`);
    res.json(peliculas);
    
  } catch (error) {
    // Manejo de errores en la búsqueda
    console.error('[Catalogo] ❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Error en la búsqueda',
      details: error.message 
    });
  }
});

// Iniciar el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n[Catalogo] 🚀 Servicio listo en http://localhost:${PORT}`);
  console.log('[Catalogo] Endpoints:');
  console.log(`[Catalogo] POST   /peliculas`);
  console.log(`[Catalogo] GET    /peliculas/:genero\n`);
});