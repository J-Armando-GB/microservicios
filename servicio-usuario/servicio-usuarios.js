// Importa dependencias principales
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

console.log('[Usuarios] Iniciando servicio de usuarios...');

// Middleware de logging para registrar cada petición
app.use((req, res, next) => {
  console.log(`[Usuarios] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json()); // Permite recibir JSON en las peticiones

const SECRET_KEY = 'mi_secreto_super_seguro'; // Clave secreta para JWT
const usuarios = []; // Almacenamiento en memoria de usuarios (solo para demo)

// Endpoint para registrar un nuevo usuario
app.post('/registro', (req, res) => {
  console.log('[Usuarios] Registro de usuario:', req.body.email);
  try {
    const { email, password } = req.body;
    // Agrega el usuario al arreglo (no persistente)
    usuarios.push({ email, password });
    console.log('[Usuarios] Usuario registrado:', email);
    res.status(201).send({ message: 'Usuario registrado' });
  } catch (error) {
    // Manejo de errores en el registro
    console.error('[Usuarios] Error en registro:', error);
    res.status(500).send('Error al registrar usuario');
  }
});

// Endpoint para login de usuario y generación de token JWT
app.post('/login', (req, res) => {
  console.log('[Usuarios] Intento de login:', req.body.email);
  try {
    const { email, password } = req.body;
    // Busca el usuario en el arreglo
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    
    if (!usuario) {
      // Si no existe, retorna error de autenticación
      console.log('[Usuarios] Login fallido: credenciales incorrectas');
      return res.status(401).send('Credenciales inválidas');
    }

    // Genera un token JWT válido por 1 hora
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
    console.log('[Usuarios] Login exitoso:', email);
    res.send({ token });
  } catch (error) {
    // Manejo de errores en el login
    console.error('[Usuarios] Error en login:', error);
    res.status(500).send('Error en el login');
  }
});

// Inicia el servidor en el puerto 3001
app.listen(3001, () => {
  console.log('[Usuarios] Servicio escuchando en puerto 3001 👤');
  console.log('[Usuarios] Endpoints:');
  console.log('[Usuarios]   POST   http://localhost:3001/registro');
  console.log('[Usuarios]   POST   http://localhost:3001/login');
});