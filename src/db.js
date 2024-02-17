// db.js

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host:'127.0.0.1',
    user:'root',
    password:'',
    port:3306,
    database:'dbacademico'
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err);
  } else {
    console.log('Conexión exitosa con la base de datos');
  }
});

function realizarConsulta(query, params, callback) {
  connection.query(query, params, callback);
}

module.exports = {
  realizarConsulta
};
