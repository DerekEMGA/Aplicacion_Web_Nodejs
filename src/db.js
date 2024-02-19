// db.js

const mysql = require('mysql2');

const config = {
  host:'127.0.0.1',
    user:'root',
    password:'',
    port:3306,
    database:'dbacademico',
};
const connection = mysql.createConnection(config);

connection.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
});

module.exports = connection;
