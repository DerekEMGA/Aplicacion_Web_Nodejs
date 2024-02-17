const db = require('./db');

async function autenticarUsuario(usuario, contrasena, tipoUsuario) {
  try {
    const query = 'SELECT * FROM usuarios WHERE matricula = ? AND contrasena = ? AND tipo = ?';
    const results = await db.realizarConsulta(query, [usuario, contrasena, tipoUsuario]);
    return results && results.length > 0;  // Asegurar que 'results' no es undefined
  } catch (error) {
    throw error;
  }
}

module.exports = {
  autenticarUsuario
};