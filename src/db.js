// db.js

const mysql = require('mysql2');

const config = {
  host:'127.0.0.1',
    user:'root',
    password:'',
    port:3306,
    database:'dbacademico',
    multipleStatements: true // Habilitar múltiples declaraciones
};

const connection = mysql.createConnection(config);

connection.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
}); 

// Consulta para reiniciar el autoincremento en personal y usuario
const resetAutoIncrementQuery = "ALTER TABLE personal AUTO_INCREMENT = 1; ALTER TABLE usuario AUTO_INCREMENT = 1;";

connection.query(resetAutoIncrementQuery, (error, results, fields) => {
    if (error) {
      console.error('Error al reiniciar el autoincremento:', error);
    } else {
      console.log('Autoincremento reiniciado correctamente');
    }
  });

module.exports = connection;
