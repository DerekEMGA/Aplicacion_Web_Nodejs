const db = require('../db');

function loginQuery(usuario, contrasena,tipo,callback) {
    const query = 'SELECT matricula_clave, contrasena, tipo FROM usuario WHERE matricula_clave = ? AND contrasena = ? AND tipo= ?';
    db.query(query, [usuario, contrasena,tipo], (error, results) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, results);
      }
    });
  }


module.exports = loginQuery;
