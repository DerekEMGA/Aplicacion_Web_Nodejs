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
app.use("/personal/agregarDocente",personalRoutes)
app.use("/personal/agregarMateria",personalRoutes)

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

    // Verificar si el usuario ya existe en la tabla usuario
    connection.query("SELECT * FROM usuario WHERE matricula_clave = ?", [clave], function(error, usuarioResults, fields) {
        if (error) {
            throw error;
        }

        // Si hay resultados, significa que el usuario ya existe en la tabla usuario
        if (usuarioResults.length > 0) {
            console.log('Usuario ya existe');
            res.redirect('/administrador/agregarPersonal?mensaje=Numero%20de%20empleado%20y/o%20nombres%20duplicados');
        } else {
            // Verificar si el usuario ya existe en la tabla personal
            connection.query("SELECT * FROM personal WHERE nombre = ? AND apellido_paterno = ? AND apellido_materno = ?", [nombre, apellidoPaterno, apellidoMaterno], function(error, personalResults, fields) {
                if (error) {
                    throw error;
                }

                // Si hay resultados, significa que el usuario ya existe en la tabla personal
                if (personalResults.length > 0) {
                    console.log('Nombre y apellidos duplicados');
                    res.redirect('/administrador/agregarPersonal?mensaje=Numero%20de%20empleado%20y/o%20nombres%20duplicados');
                } else {
                    // Comenzar una transacción
                    connection.beginTransaction(function(err) {
                        if (err) {
                            throw err;
                        }

                        // Insertar en la tabla personal
                        connection.query("INSERT INTO personal(nombre, apellido_paterno, apellido_materno, ocupacion, antiguedad, clave) VALUES (?, ?, ?, ?, ?, ?)",
                            [nombre, apellidoPaterno, apellidoMaterno, 'personal', antiguedad, clave],
                            function(error, personalInsertResult, fields) {
                                if (error) {
                                    return connection.rollback(function() {
                                        throw error;
                                    });
                                }

                                // Insertar en la tabla usuario
                                connection.query("INSERT INTO usuario(matricula_clave, contrasena, tipo) VALUES (?, ?, 'personal')",
                                    [clave, contrasena],
                                    function(error, usuarioInsertResult, fields) {
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
        }
    });
});



app.post("/modificar", function(req, res) {
    console.log(req.body);
    const datosPersonal = req.body;

    let nombre = datosPersonal.nombre;
    let apellidoPaterno = datosPersonal.apellidoPaterno;
    let apellidoMaterno = datosPersonal.apellidoMaterno;
    let antiguedad = datosPersonal.antiguedad;
    const clave = datosPersonal.clave; // Usamos la clave como referencia
    let nuevaClave = datosPersonal.clave; // Nueva clave a modificar (puede ser igual a clave)
    let contrasena = datosPersonal.contrasena;



    // Check if any field is empty
    if (!nombre || !apellidoPaterno || !apellidoMaterno || !antiguedad || !clave  || !contrasena) {
        return res.redirect('/administrador/agregarPersonal?mensaje=Por%20favor,%20complete%20todos%20los%20campos%20antes%20de%20enviar%20el%20formulario.');
    }

    // Check if the user with the given clave already exists
    connection.query("SELECT * FROM personal WHERE clave = ?", [clave], function(error, results, fields) {
        if (error) {
            console.error('Error en la consulta a la base de datos:', error);
            return res.redirect('/administrador/agregarPersonal?mensaje=Error%20en%20la%20consulta%20a%20la%20base%20de%20datos');
        }

        // Check for a collision (two records having the same employee number)
        if (results.length > 1) {
            return res.redirect('/administrador/agregarPersonal?mensaje=Colisión:%20El%20número%20de%20empleado%20ya%20existe%20para%20otro%20registro');
        }

        // Continue with the update code
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
                        [ contrasena, clave], // Utilizamos la clave como referencia
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
                                res.redirect('/administrador/agregarPersonal?mensaje=Personal%20modificado%20correctamente');
                            });
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

app.post("/buscar", function(req, res){
    const clave = req.body.clave;
    console.log('Recibiendo solicitud para buscar el usuario con clave:');
    console.log(clave);

    // Realizar la consulta para obtener los datos del usuario
    connection.query(`
        SELECT personal.*, usuario.contrasena
        FROM personal
        LEFT JOIN usuario ON personal.clave = usuario.matricula_clave
        WHERE personal.clave = ?
    `,
    [clave],
    function(error, results, fields) {
        if (error) {
            console.error('Error en la consulta a la base de datos:', error);
            return res.redirect('/administrador/agregarPersonal?mensaje=Error%20en%20la%20consulta%20a%20la%20base%20de%20datos');
        }

        // Comprobar si se encontraron resultados
        if (results.length === 0) {
            return res.redirect('/administrador/agregarPersonal?mensaje=Usuario%20no%20encontrado');
        }

        // Obtener datos del usuario y construir la URL de redireccionamiento
        const usuario = results[0];
        const redirectURL = `/administrador/agregarPersonal?nombre=${usuario.nombre}&apellidoPaterno=${usuario.apellido_paterno}&apellidoMaterno=${usuario.apellido_materno}&antiguedad=${usuario.antiguedad}&contrasena=${usuario.contrasena}&clave=${usuario.clave}`;

        // Redirigir al usuario con los datos en la URL
        res.redirect(redirectURL);
    });
});


function buildTableHtml(results) {
    // Construye la tabla HTML aquí
    let tableHtml = '<table name="tabla" style="max-height: 300px; overflow-y: auto; position: fixed; bottom: 0%; left: 60%; transform: translateX(-50%); width: 80%; height: 60px; border: 1px solid #395B95; border-collapse: collapse;" cellpadding="8">';
    
    // Construye la fila de encabezados utilizando los nombres de los campos
    tableHtml += '<tr>';
    for (const field in results[0]) {
        tableHtml += `<th>${field}</th>`;
    }
    tableHtml += '</tr>';

    // Construye las filas de datos
    for (const result of results) {
        tableHtml += '<tr>';
        for (const field in result) {
            tableHtml += `<td>${result[field]}</td>`;
        }
        tableHtml += '</tr>';
    }

    tableHtml += '</table>';
    return tableHtml;
}

app.get('/administrador/agregarPersonal/tabla', function(req, res) {
    // Realiza la consulta para obtener los últimos 5 registros
    connection.query('SELECT nombre,apellido_paterno,apellido_materno,ocupacion,antiguedad,clave FROM personal ORDER BY id DESC LIMIT 5', function(error, results, fields) {
        if (error) {
            console.error('Error en la consulta a la base de datos:', error);
            return res.status(500).send('Error en la consulta a la base de datos');
        }

        // Construye la tabla HTML
        const tableHtml = buildTableHtml(results);

        // Envía la tabla HTML como respuesta al cliente
        res.status(200).send(tableHtml);
    });
});

//Seccion de agregarDocente

app.post("/insertarProfesor", function(req, res) {
    const datosProfesor = req.body;

    let nombre = datosProfesor.nombre;
    let apellidoPaterno = datosProfesor.apellidoPaterno;
    let apellidoMaterno = datosProfesor.apellidoMaterno;
    let profesion = datosProfesor.profesion;
    let clave = datosProfesor.clave;
    let contrasena = datosProfesor.contrasena;

    // Verificar si el profesor ya existe en la tabla usuario
    connection.query("SELECT * FROM usuario WHERE matricula_clave = ?", [clave], function(error, usuarioResults, fields) {
        if (error) {
            throw error;
        }

        // Si hay resultados, significa que el profesor ya existe en la tabla usuario
        if (usuarioResults.length > 0) {
            console.log('Numero de empleado ya esta en uso');
            res.redirect('/personal/agregarDocente?mensaje=Este%20numero%20de%20empleado%20ya%20esta%20en%20uso');
        } else {
            // Verificar si el profesor ya existe en la tabla profesor
            connection.query("SELECT * FROM profesor WHERE nombre = ? AND apellido_paterno = ? AND apellido_materno = ?", [nombre, apellidoPaterno, apellidoMaterno], function(error, profesorResults, fields) {
                if (error) {
                    throw error;
                }

                // Si hay resultados, significa que el profesor ya existe en la tabla profesor
                if (profesorResults.length > 0) {
                    console.log('Este docente ya existe ');
                    res.redirect('/personal/agregarDocente?mensaje=El%20docente%20ya%20existe');
                } else {
                    // Comenzar una transacción
                    connection.beginTransaction(function(err) {
                        if (err) {
                            throw err;
                        }

                        // Insertar en la tabla profesor
                        connection.query("INSERT INTO profesor(nombre, apellido_paterno, apellido_materno, profesion, clave) VALUES (?, ?, ?, ?, ?)",
                            [nombre, apellidoPaterno, apellidoMaterno, profesion, clave],
                            function(error, profesorInsertResult, fields) {
                                if (error) {
                                    return connection.rollback(function() {
                                        throw error;
                                    });
                                }

                                // Insertar en la tabla usuario
                                connection.query("INSERT INTO usuario(matricula_clave, contrasena, tipo) VALUES (?, ?, 'profesor')",
                                    [clave, contrasena],
                                    function(error, usuarioInsertResult, fields) {
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
                                            console.log('Datos del profesor almacenados correctamente');
                                            res.redirect('/personal/agregarDocente?mensaje=Datos%20almacenados%20correctamente');
                                        });
                                    });
                            });
                    });
                }
            });
        }
    });
});


// Modificar un registro de profesor
app.post("/modificarProfesor", function(req, res) {
    const datosProfesor = req.body;

    let nombre = datosProfesor.nombre;
    let apellidoPaterno = datosProfesor.apellidoPaterno;
    let apellidoMaterno = datosProfesor.apellidoMaterno;
    let profesion = datosProfesor.profesion;
    let antiguedad = datosProfesor.antiguedad;
    const clave = datosProfesor.clave; // Usamos la clave como referencia
    let contrasena = datosProfesor.contrasena;

    // Check if any field is empty
    if (!nombre || !apellidoPaterno || !apellidoMaterno || !profesion || !clave || !contrasena) {
        return res.redirect('/personal/agregarDocente?mensaje=Por%20favor,%20complete%20todos%20los%20campos%20antes%20de%20enviar%20el%20formulario.');
    }

    // Check if the professor with the given clave exists
    connection.query("SELECT * FROM profesor WHERE clave = ?", [clave], function(error, results, fields) {
        if (error) {
            console.error('Error en la consulta a la base de datos:', error);
            return res.redirect('/personal/agregarDocente?mensaje=Error%20en%20la%20consulta%20a%20la%20base%20de%20datos');
        }

        // Check if there's a professor with the provided clave
        if (results.length === 0) {
            return res.redirect('/personal/agregarDocente?mensaje=Profesor%20no%20encontrado');
        }

        // Continue with the update code
        connection.beginTransaction(function(err) {
            if (err) { throw err; }

            // Modificar el registro en la tabla profesor
            connection.query("UPDATE profesor SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, profesion = ? WHERE clave = ?",
                [nombre, apellidoPaterno, apellidoMaterno, profesion, clave],
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
                                console.log('Registro de profesor modificado correctamente');
                                res.redirect('/personal/agregarDocente?mensaje=Docente%20modificado%20correctamente');
                            });
                        });
                });
        });
    });
});

// Eliminar un registro de profesor si tiene materias lanzar alerta para confirmar que elimine materias 
app.post("/eliminarProfesor", function(req, res){
    const clave = req.body.clave;
    console.log(`Recibiendo solicitud para eliminar el profesor con clave: ${clave}`);

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
                    // El profesor no existe, enviar una alerta
                    res.redirect('/personal/agregarDocente?mensaje=Profesor%20no%20encontrado');
                    return;
                }

                // Eliminar el registro de la tabla profesor
                connection.query("DELETE FROM profesor WHERE clave = ?",
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
                            console.log('Registro de profesor eliminado correctamente');
                            res.redirect('/personal/agregarDocente?mensaje=Docente%20eliminado%20correctamente');
                        });
                    });
            });
    });
});

// Buscar un profesor por su clave
app.post("/buscarProfesor", function(req, res){
    const clave = req.body.clave;
    const hora = req.body.hora;
    console.log('Recibiendo solicitud para buscar el profesor con clave:');
    console.log(clave);

    // Realizar la consulta para obtener los datos del profesor
    connection.query(`
    SELECT profesor.*, usuario.contrasena
    FROM profesor
    LEFT JOIN usuario ON profesor.clave = usuario.matricula_clave
    WHERE profesor.clave = ? 
`,
    [clave],
    function(error, results, fields) {
        if (error) {
            console.error('Error en la consulta a la base de datos:', error);
            return res.redirect('/personal/agregarDocente?mensaje=Error%20en%20la%20consulta%20a%20la%20base%20de%20datos');
        }

        // Comprobar si se encontraron resultados
        if (results.length === 0) {
            return res.redirect('/personal/agregarDocente?mensaje=Docente%20no%20encontrado');
        }

        // Obtener datos del profesor y construir la URL de redireccionamiento
        const profesor = results[0];
        const redirectURL = `/personal/agregarDocente?nombre=${profesor.nombre}&apellidoPaterno=${profesor.apellido_paterno}&apellidoMaterno=${profesor.apellido_materno}&profesion=${profesor.profesion}&clave=${profesor.clave}&contrasena=${profesor.contrasena}`;

        // Redirigir al usuario con los datos en la URL
        res.redirect(redirectURL);
    });
});


app.get('/personal/agregarDocente/tabla', function(req, res) {
    // Realiza la consulta para obtener los últimos 5 registros
    connection.query('SELECT nombre,apellido_paterno,apellido_materno,profesion,clave FROM profesor ORDER BY id DESC LIMIT 5', function(error, results, fields) {
        if (error) {
            console.error('Error en la consulta a la base de datos:', error);
            return res.status(500).send('Error en la consulta a la base de datos');
        }

        // Construye la tabla HTML
        const tableHtml = buildTableHtml(results);

        // Envía la tabla HTML como respuesta al cliente
        res.status(200).send(tableHtml);
    });
});


//Seccion para agregar Materia

// Sección de agregar Materia
app.post("/insertarMateria", function(req, res) {
    const datosMateria = req.body;
    console.log(req.body);

    let nombre = datosMateria.nombre;
    let docente = datosMateria.docente;
    let hora = datosMateria.hora;
    let diaSemana = datosMateria.dias;
    let semestre = datosMateria.semestre;

   

    // Verificar si ya existe una materia con los mismos datos
    connection.query("SELECT * FROM materias WHERE NOMBRE = ? AND ID_MAESTRO = ? AND HORA = ? AND DIA_SEMANA = ?",
        [nombre, docente, hora, diaSemana],
        function(error, results, fields) {
            if (error) {
                throw error;
            }

            if (results.length > 0) {
                // Si ya existe una materia con los mismos datos, enviar mensaje de error
                console.log('Ya existe una materia con los mismos datos.');
                res.redirect('/personal/agregarMateria?mensaje=Error:%20Ya%20existe%20una%20materia%20con%20los%20mismos%20datos');
            } else {
                // Verificar si el docente tiene otro registro a la misma hora
                connection.query("SELECT * FROM materias WHERE ID_MAESTRO = ? AND HORA = ?",
                    [docente, hora],
                    function(error, results, fields) {
                        if (error) {
                            throw error;
                        }

                        if (results.length > 0) {
                            // Si el docente ya tiene otro registro a la misma hora, enviar mensaje de error
                            console.log('El docente ya tiene otro registro a la misma hora.');
                            res.redirect('/personal/agregarMateria?mensaje=Error:%20El%20docente%20ya%20tiene%20otro%20registro%20a%20la%20misma%20hora');
                        } else {
                            // Comenzar una transacción
                            connection.beginTransaction(function(err) {
                                if (err) {
                                    throw err;
                                }

                                // Insertar en la tabla Materias
                                connection.query("INSERT INTO materias (NOMBRE, ID_MAESTRO, HORA, DIA_SEMANA, SEMESTRE) VALUES (?, ?, ?, ?, ?)",
                                    [nombre, docente, hora, diaSemana, semestre],
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
                                            console.log('Datos de la materia almacenados correctamente');
                                            res.redirect('/personal/agregarMateria?mensaje=Datos%20almacenados%20correctamente');
                                        });
                                    });
                            });
                        }
                    });
            }
        });
});



// Modificar Materia

app.post("/modificarMateria", function(req, res) {
    const datosMateria = req.body;
    console.log(req.body);

    let nombre = datosMateria.nombre;
    let idMaestro = datosMateria.docente;
    let hora = datosMateria.hora;
    let diaSemana = datosMateria.dias;
    let semestre = datosMateria.semestre;

    // Check if any field is empty
    if (!nombre || !idMaestro || !hora || !diaSemana || !semestre) {
        return res.redirect('/personal/agregarMateria?mensaje=Por%20favor,%20complete%20todos%20los%20campos%20antes%20de%20enviar%20el%20formulario.');
    }

    // Continuar con el código de verificación
    connection.beginTransaction(function(err) {
        if (err) { throw err; }

        // Verificar si el docente tiene otro registro a la misma hora excluyendo la materia que se está modificando
        connection.query("SELECT * FROM materias WHERE ID_MAESTRO = ? AND HORA = ? AND NOT (NOMBRE = ? AND HORA = ? AND ID_MAESTRO = ? AND DIA_SEMANA = ?)",
            [idMaestro, hora, nombre, hora, idMaestro, diaSemana],
            function(error, results, fields) {
                if (error) {
                    return connection.rollback(function() {
                        throw error;
                    });
                }

                if (results.length > 0) {
                    // Si el docente ya tiene otro registro a la misma hora, enviar mensaje de error
                    console.log('El docente ya tiene otro registro a la misma hora.');
                    return res.redirect('/personal/agregarMateria?mensaje=Error:%20El%20docente%20ya%20tiene%20otro%20registro%20a%20la%20misma%20hora');
                } else {
                    // Continuar con el código de actualización
                    connection.query("UPDATE materias SET NOMBRE = ?, ID_MAESTRO = ?, HORA = ?, DIA_SEMANA = ?, SEMESTRE = ? WHERE NOMBRE = ? AND ID_MAESTRO = ? AND HORA = ? AND DIA_SEMANA = ?",
                        [nombre, idMaestro, hora, diaSemana, semestre, nombre, idMaestro, hora, diaSemana],
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
                                console.log('Registro de materia modificado correctamente');
                                res.redirect('/personal/agregarMateria?mensaje=Materia%20modificada%20correctamente');
                            });
                        });
                }
            });
    });
});



// Eliminar Materia
app.post("/eliminarMateria", function(req, res){
    const docente = req.body.docente;
    const hora = req.body.hora;
    console.log(`Recibiendo solicitud para eliminar la materia con docente: ${docente} y hora: ${hora}`);

    // Verificar si se proporcionaron los datos necesarios
    if (!docente || !hora) {
        return res.redirect('/personal/agregarMateria?mensaje=Error:%20Se%20requieren%20el%20docente%20y%20la%20hora%20para%20eliminar%20una%20materia');
    }

    // Comenzar una transacción
    connection.beginTransaction(function(err) {
        if (err) { throw err; }

        // Verificar si la materia con el docente y la hora proporcionados existe
        connection.query("SELECT * FROM materias WHERE ID_MAESTRO = ? AND HORA = ?",
            [docente, hora],
            function(error, results, fields) {
                if (error) {
                    return connection.rollback(function() {
                        throw error;
                    });
                }

                if (results.length === 0) {
                    // La materia no existe, enviar una alerta
                    res.redirect('/personal/agregarMateria?mensaje=Materia%20no%20encontrada');
                    return;
                }

                // Eliminar el registro de la tabla Materias
                connection.query("DELETE FROM materias WHERE ID_MAESTRO = ? AND HORA = ?",
                    [docente, hora],
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
                            console.log('Registro de materia eliminado correctamente');
                            res.redirect('/personal/agregarMateria?mensaje=Materia%20eliminada%20correctamente');
                        });
                    });
            });
    });
});



// Buscar Materia
app.post("/buscarMateria", function(req, res){
    const docente = req.body.docente;
    const hora = req.body.hora;
    const semestre = req.body.semestre;
    console.log('Recibiendo solicitud para buscar la materia con docente:');
    console.log(docente);
    console.log('y hora:');
    console.log(hora);

    // Realizar la consulta para obtener los datos de la materia
    connection.query("SELECT * FROM materias WHERE ID_MAESTRO = ? AND HORA = ?",
        [docente, hora],
        function(error, results, fields) {
            if (error) {
                console.error('Error en la consulta a la base de datos:', error);
                return res.redirect('/personal/agregarMateria?mensaje=Error%20en%20la%20consulta%20a%20la%20base%20de%20datos');
            }

            // Comprobar si se encontraron resultados
            if (results.length === 0) {
                return res.redirect('/personal/agregarMateria?mensaje=Materia%20no%20encontrada');
            }

            // Obtener datos de la materia y construir la URL de redireccionamiento
            const materia = results[0];
            const redirectURL = `/personal/agregarMateria?nombre=${materia.NOMBRE}&idMaestro=${materia.ID_MAESTRO}&hora=${materia.HORA}&diaSemana=${materia.DIA_SEMANA}&semestre=${materia.SEMESTRE}`;

            // Redirigir al usuario con los datos en la URL
            res.redirect(redirectURL);
        });
});


app.get('/personal/agregarMateria/tabla', function(req, res) {
    // Realiza la consulta para obtener los últimos 5 registros
    connection.query('SELECT materias.NOMBRE AS NOMBRE_MATERIA, CONCAT(profesor.nombre, " ", profesor.apellido_paterno, " ", profesor.apellido_materno) AS NOMBRE_PROFESOR, materias.SEMESTRE, CASE WHEN HOUR(materias.HORA) = 7 THEN "07:00 - 08:00" WHEN HOUR(materias.HORA) = 8 THEN "08:00 - 09:00" WHEN HOUR(materias.HORA) = 9 THEN "09:00 - 10:00" WHEN HOUR(materias.HORA) = 10 THEN "10:00 - 11:00" WHEN HOUR(materias.HORA) = 11 THEN "11:00 - 12:00" WHEN HOUR(materias.HORA) = 12 THEN "12:00 - 13:00" WHEN HOUR(materias.HORA) = 13 THEN "13:00 - 14:00" END AS HORA, materias.DIA_SEMANA FROM materias INNER JOIN profesor ON materias.ID_MAESTRO = profesor.id ORDER BY materias.id DESC LIMIT 5', function(error, results, fields) {
        if (error) {
            console.error('Error en la consulta a la base de datos:', error);
            return res.status(500).send('Error en la consulta a la base de datos');
        }

        // Construye la tabla HTML
        const tableHtml = buildTableHtml(results);

        // Envía la tabla HTML como respuesta al cliente
        res.status(200).send(tableHtml);
    });
});


app.get('/profesores', (req, res) => {
    connection.query('SELECT * FROM profesor', (err, results) => {
      if (err) {
        console.error('Error al obtener los profesores:', err);
        res.status(500).send('Error interno del servidor');
        return;
      }
      res.json(results);
    });
  });
  
