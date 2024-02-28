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
app.use("/docente", docenteRoutes)
app.use("/alumno", alumnoRoutes)

//Static files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), () => {
    console.log('server on port 3000');
});


app.post("/validar", function(req, res){
    const datosPersonal = req.body;

    let nombre = datosPersonal.nombre;
    let apellidoPaterno = datosPersonal.apellidoPaterno;
    let apellidoMaterno = datosPersonal.apellidoMaterno;
    let antiguedad = datosPersonal.antiguedad;
    let clave = datosPersonal.clave;

    // Comprobar si ya existe un registro con la misma clave
    let buscar = "SELECT * FROM personal WHERE clave = " + connection.escape(clave);

    connection.query(buscar, function(error, rows){
        if(error){
            throw error;
        } else {
            if(rows.length > 0){
                console.log("No se puede registrar un personal con la misma clave");
                // Redirigir con un mensaje de error
                res.redirect('/administrador/agregarPersonal?mensaje=No%20se%20puede%20registrar,%20ya%20existe%20una%20clave%20similar');
            } else {
                // Si no existe, proceder con la inserción
                let registrar = "INSERT INTO personal(nombre, apellido_paterno, apellido_materno, ocupacion, antiguedad, clave) VALUES ('"+ nombre +"', '"+ apellidoPaterno +"', '"+ apellidoMaterno +"', 'personal', '"+ antiguedad +"', '"+ clave +"')";

                connection.query(registrar, function(error){
                    if(error){
                        throw error;
                    } else {
                        connection.query(registrar, function(error){
                            if(error){
                                throw error;
                            } else {
                                console.log("Datos almacenados correctamente");
                                // Redirigir con un mensaje de éxito
                                res.redirect('/administrador/agregarPersonal?mensaje=Datos%20almacenados%20correctamente');
                            }
                        });
                    }
                });
            }
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
