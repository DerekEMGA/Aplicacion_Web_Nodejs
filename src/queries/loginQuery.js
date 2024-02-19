const mssql = require('mssql');
const db = require('../db');

function loginQuery(usuario, contrasena, tipo, callback) {
    const query = 'SELECT matricula, contrasena, tipo FROM usuarios WHERE matricula = ? AND contrasena = ? AND tipo = ?';
    db.query(query, [usuario, contrasena, tipo], (error, results) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, results);
      }
    });
  }
  


module.exports = loginQuery;
