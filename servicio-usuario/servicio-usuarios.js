const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

console.log('[Usuarios] Iniciando servicio de usuarios...');

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[Usuarios] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.json());
const SECRET_KEY = 'mi_secreto_super_seguro';
const usuarios = [];

// POST /registro
app.post('/registro', (req, res) => {
  console.log('[Usuarios] Registro de usuario:', req.body.email);
  try {
    const { email, password } = req.body;
    usuarios.push({ email, password });
    console.log('[Usuarios] Usuario registrado:', email);
    res.status(201).send({ message: 'Usuario registrado' });
  } catch (error) {
    console.error('[Usuarios] Error en registro:', error);
    res.status(500).send('Error al registrar usuario');
  }
});

// POST /login
app.post('/login', (req, res) => {
  console.log('[Usuarios] Intento de login:', req.body.email);
  try {
    const { email, password } = req.body;
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    
    if (!usuario) {
      console.log('[Usuarios] Login fallido: credenciales incorrectas');
      return res.status(401).send('Credenciales inválidas');
    }

    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
    console.log('[Usuarios] Login exitoso:', email);
    res.send({ token });
  } catch (error) {
    console.error('[Usuarios] Error en login:', error);
    res.status(500).send('Error en el login');
  }
});

app.listen(3001, () => {
  console.log('[Usuarios] Servicio escuchando en puerto 3001 👤');
  console.log('[Usuarios] Endpoints:');
  console.log('[Usuarios]   POST   http://localhost:3001/registro');
  console.log('[Usuarios]   POST   http://localhost:3001/login');
});