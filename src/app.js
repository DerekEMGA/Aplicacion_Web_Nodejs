const express = require('express');
const path = require('path');
const morgan = require('morgan');
const app = express();
const bodyParser = require('body-parser');

//rutas
const loginRoutes = require('../src/routes/loginRoutes.js')
const personalRoutes = require('../src/routes/personalRoutes.js')
const docenteRoutes = require('../src/routes/docenteRoutes.js')
const administradorRoutes = require('../src/routes/administradorRoutes.js')
const alumnoRoutes = require('../src/routes/alumnoRoutes.js');
const connection = require('./db.js');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//settings
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'));

//middlewares
app.use(morgan('dev'));

//conexion sql 
app.use(morgan('dev'));

//routes
app.use("/", loginRoutes)
app.use("/personal", personalRoutes)
app.use("/administrador", administradorRoutes)
app.use("administrador/agregarPersonal",administradorRoutes)
app.use("administrador/agregarPersonal",administradorRoutes)
app.use("/docente", docenteRoutes)
app.use("/alumno", alumnoRoutes)

//Static files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), () => {
    console.log('server on port 3000');
});


//aqui se insertan los registros en la tabla personal 
app.post("/validar", function(req,res){
    const datosPersonal = req.body;

    let nombre = datosPersonal.nombre;
    let apellidoPaterno = datosPersonal.apellidoPaterno;
    let apellidoMaterno = datosPersonal.apellidoMaterno;
    let antiguedad = datosPersonal.antiguedad;
    let clave = datosPersonal.clave;

/* por si no s epueden repetir claves xD
    let buscar = "SELECT * FROM personal WHERE clave = "+ clave +" ";

    connection.query(buscar, function(error, row){
        if(error){
            throw error;
        }else{
            if(row.length>0){
                console.log("No se puede registrar un personal con la misma clave");
            }else{

            }
        }
    });*/

    let registrar = "INSERT INTO personal(nombre, apellido_paterno, apellido_materno, ocupacion, antiguedad, clave) VALUES ('"+ nombre +"', '"+ apellidoPaterno +"', '"+ apellidoMaterno +"', 'personal', '"+ antiguedad +"', '"+ clave +"')";

    connection.query(registrar, function(error){
        if(error){
            throw error;
        }else{
            console.log("Datos alamcenados correctamente");
            res.send('Registro insertado correctamente');
        }
        
    });
});

// Consulta para reiniciar el autoincremento
const resetAutoIncrementQuery = "ALTER TABLE personal AUTO_INCREMENT = 1";

// Ejecutar la consulta
connection.query(resetAutoIncrementQuery, (error, results, fields) => {
  if (error) {
    console.error('Error al reiniciar el autoincremento:', error);
  } else {
    console.log('Autoincremento reiniciado correctamente');
  }
});

