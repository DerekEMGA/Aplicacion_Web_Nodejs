
const db = require('../db');



function loginQueryAdministrador(usuario, contrasena, callback) {
    const query = 'SELECT tipo FROM usuario WHERE matricula_clave = ? AND contrasena = ?';
    db.query(query, [usuario, contrasena], (error, results) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, results);
      }
    });
  }
  
module.exports = loginQueryAdministrador;