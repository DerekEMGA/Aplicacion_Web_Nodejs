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

//CRUD routes
app.get("/administrador/modificarPersonal", function(req, res){res.redirect('/administrador/agregarPersonal');});
app.get("/administrador/eliminarPersonal", function(req, res){res.redirect('/administrador/agregarPersonal');});

//Static files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), () => {
    console.log('server on port 3000');
});

// Aquí se insertan los registros en la tabla personal y usuario
app.post("/insertar", function(req, res) {
    const datosPersonal = req.body;

    let nombre = datosPersonal.nombre;
    let apellidoPaterno = datosPersonal.apellidoPaterno;
    let apellidoMaterno = datosPersonal.apellidoMaterno;
    let antiguedad = datosPersonal.antiguedad;
    let clave = datosPersonal.clave;
    let contrasena = datosPersonal.contrasena;

    // Verificar si el usuario ya existe
    connection.query("SELECT * FROM usuario WHERE matricula_clave = ?", [clave], function(error, results, fields) {
        if (error) {
            throw error;
        }

        // Si hay resultados, significa que el usuario ya existe
        if (results.length > 0) {
            console.log('Usuario ya existe');
            res.redirect('/administrador/agregarPersonal?mensaje=El%20Personal%20ya%20existe');
        } else {
            // Comenzar una transacción
            connection.beginTransaction(function(err) {
                if (err) {
                    throw err;
                }

                // Insertar en la tabla personal
                connection.query("INSERT INTO personal(nombre, apellido_paterno, apellido_materno, ocupacion, antiguedad, clave) VALUES (?, ?, ?, ?, ?, ?)",
                    [nombre, apellidoPaterno, apellidoMaterno, 'personal', antiguedad, clave],
                    function(error, results, fields) {
                        if (error) {
                            return connection.rollback(function() {
                                throw error;
                            });
                        }

                        // Insertar en la tabla usuario
                        connection.query("INSERT INTO usuario(matricula_clave, contrasena, tipo) VALUES (?, ?, 'personal')",
                            [clave, contrasena],
                            function(error, results, fields) {
                                if (error) {
                                    return connection.rollback(function() {
                                        throw error;
                                    });
                                }

                                // Commit si todo está bien
                                connection.commit(function(err) {
                                    if (err) {
                                        return connection.rollback(function() {
                                            throw err;
                                        });
                                    }
                                    console.log('Datos almacenados correctamente');
                                    res.redirect('/administrador/agregarPersonal?mensaje=Datos%20almacenados%20correctamente');
                                });
                            });
                    });
            });
        }
    });
});

// Aqui se modifica un registro de personal y usuario
app.post("/modificar", function(req, res){
    console.log(req.body);
    const datosPersonal = req.body;

    let nombre = datosPersonal.nombre;
    let apellidoPaterno = datosPersonal.apellidoPaterno;
    let apellidoMaterno = datosPersonal.apellidoMaterno;
    let antiguedad = datosPersonal.antiguedad;
    let clave = datosPersonal.clave; // Usamos la clave como referencia
    let contrasena = datosPersonal.contrasena;

    // Comenzar una transacción
    connection.beginTransaction(function(err) {
        if (err) { throw err; }

        // Modificar el registro en la tabla personal
        connection.query("UPDATE personal SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, antiguedad = ? WHERE clave = ?",
            [nombre, apellidoPaterno, apellidoMaterno, antiguedad, clave],
            function(error, results, fields) {
                if (error) {
                    return connection.rollback(function() {
                        throw error;
                    });
                }

                // Modificar el registro en la tabla usuario
                connection.query("UPDATE usuario SET contrasena = ? WHERE matricula_clave = ?",
                    [contrasena, clave], // Utilizamos la clave como referencia
                    function(error, results, fields) {
                        if (error) {
                            return connection.rollback(function() {
                                throw error;
                            });
                        }

                        // Commit si todo está bien
                        connection.commit(function(err) {
                            if (err) {
                                return connection.rollback(function() {
                                    throw err;
                                });
                            }
                            console.log('Registro de personal modificado correctamente');
                            res.redirect('/administrador/modificarPersonal?mensaje=Registro%20modificado%20correctamente');
                        });
                    });
            });
    });
});


    // Aquí se elimina un registro de personal y usuario
app.post("/eliminar", function(req, res){
    const clave = req.body.clave;
    console.log(`Recibiendo solicitud para eliminar el usuario con clave: ${clave}`);

    // Comenzar una transacción
    connection.beginTransaction(function(err) {
        if (err) { throw err; }

        // Eliminar el registro de la tabla usuario (si existe)
        connection.query("DELETE FROM usuario WHERE matricula_clave = ?",
            [clave],
            function(error, results, fields) {
                if (error) {
                    return connection.rollback(function() {
                        throw error;
                    });
                }

                if (results.affectedRows === 0) {
                    // El usuario no existe, enviar una alerta
                    res.redirect('/administrador/agregarPersonal?mensaje=Usuario%20no%20encontrado');
                    return;
                }

                // Eliminar el registro de la tabla personal
                connection.query("DELETE FROM personal WHERE clave = ?",
                    [clave],
                    function(error, results, fields) {
                        if (error) {
                            return connection.rollback(function() {
                                throw error;
                            });
                        }

                        // Commit si todo está bien
                        connection.commit(function(err) {
                            if (err) {
                                return connection.rollback(function() {
                                    throw err;
                                });
                            }
                            console.log('Registro de personal eliminado correctamente');
                            res.redirect('/administrador/agregarPersonal?mensaje=Usuario%20eliminado%20correctamente');
                        });
                    });
            });
    });
});


