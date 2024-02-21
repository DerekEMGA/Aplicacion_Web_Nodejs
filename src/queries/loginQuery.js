const mssql = require('mssql');
const db = require('../db');

function loginQuery(usuario, contrasena,callback) {
    const query = 'SELECT matricula, contrasena, tipo FROM usuarios WHERE matricula = ? AND contrasena = ? ';
    db.query(query, [usuario, contrasena], (error, results) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, results);
      }
    });
  }

  function loginQueryAdministrador(usuario, contrasena, callback) {
    const query = 'SELECT tipo, tipoQuery FROM usuarios WHERE matricula = ? AND contrasena = ?';
    db.query(query, [usuario, contrasena], (error, results) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, results);
      }
    });
  }
  
    
  
  



module.exports = loginQuery;
