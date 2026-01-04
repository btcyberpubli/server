const express = require('express');
const router = express.Router();
const { loginUsuario } = require('../utils/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { usuario, contraseña } = req.body;

  if (!usuario || !contraseña) {
    return res.status(400).json({ 
      error: 'Usuario y contraseña son requeridos' 
    });
  }

  const resultado = loginUsuario(usuario, contraseña);
  
  if (!resultado) {
    return res.status(401).json({ 
      error: 'Usuario o contraseña incorrectos' 
    });
  }

  res.json({
    exito: true,
    usuario: {
      id: resultado.usuario.id,
      usuario: resultado.usuario.usuario,
      nombre: resultado.usuario.nombre,
      rol: resultado.usuario.rol
    },
    token: resultado.token
  });
});

module.exports = router;
