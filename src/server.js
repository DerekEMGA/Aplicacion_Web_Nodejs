const db = require('./db');

function autenticarUsuario(usuario, contrasena, tipoUsuario, callback) {
  const query = 'SELECT * FROM usuarios WHERE matricula = ? AND contrasena = ? AND tipo = ?';
  db.realizarConsulta(query, [usuario, contrasena, tipoUsuario], callback);
}

module.exports = {
  autenticarUsuario
};
