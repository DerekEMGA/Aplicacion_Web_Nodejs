const express = require("express");
const path = require("path");
const morgan = require("morgan");
const app = express();
const bodyParser = require("body-parser");

//rutas
const loginRoutes = require("../src/routes/loginRoutes.js");
const personalRoutes = require("../src/routes/personalRoutes.js");
const docenteRoutes = require("../src/routes/docenteRoutes.js");
const administradorRoutes = require("../src/routes/administradorRoutes.js");
const alumnoRoutes = require("../src/routes/alumnoRoutes.js");
const connection = require("./db.js");
const { Console } = require("console");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//settings
app.set("port", process.env.PORT || 3000);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views/"));

//middlewares
app.use(morgan("dev"));

//conexion sql
app.use(morgan("dev"));

//routes
app.use("/", loginRoutes);
app.use("/personal", personalRoutes);
app.use("/administrador", administradorRoutes);
app.use("administrador/agregarPersonal", administradorRoutes);
app.use("/docente", docenteRoutes);
app.use("/alumno", alumnoRoutes);
app.use("/personal/agregarDocente", personalRoutes);
app.use("/personal/agregarMateria", personalRoutes);
app.use("/personal/agregarAlumnos", personalRoutes);
app.use("/personal/asignarHorario",personalRoutes);
app.use("/personal/crearHorario", personalRoutes);



//CRUD routes
app.get("/administrador/modificarPersonal", function (req, res) {
  res.redirect("/administrador/agregarPersonal");
});
app.get("/administrador/eliminarPersonal", function (req, res) {
  res.redirect("/administrador/agregarPersonal");
});

//Static files
app.use(express.static(path.join(__dirname, "public")));

app.listen(app.get("port"), () => {
  console.log("server on port 3000");
});

//aquí se insertan los registros en la tabla personal y usuario
app.post("/insertar", function(req, res){
    const datosPersonal = req.body;

  let nombre = datosPersonal.nombre;
  let apellidoPaterno = datosPersonal.apellidoPaterno;
  let apellidoMaterno = datosPersonal.apellidoMaterno;
  let antiguedad = datosPersonal.antiguedad;
  let clave = datosPersonal.clave;
  let contrasena = datosPersonal.contrasena;

  // Verificar si el usuario ya existe en la tabla usuario
  connection.query(
    "SELECT * FROM usuario WHERE matricula_clave = ?",
    [clave],
    function (error, usuarioResults, fields) {
      if (error) {
        throw error;
      }

      // Si hay resultados, significa que el usuario ya existe en la tabla usuario
      if (usuarioResults.length > 0) {
        console.log("Usuario ya existe");
        res.redirect(
          "/administrador/agregarPersonal?mensaje=Numero%20de%20empleado%20y/o%20nombres%20duplicados"
        );
      } else {
        // Verificar si el usuario ya existe en la tabla personal
        connection.query(
          "SELECT * FROM personal WHERE nombre = ? AND apellido_paterno = ? AND apellido_materno = ?",
          [nombre, apellidoPaterno, apellidoMaterno],
          function (error, personalResults, fields) {
            if (error) {
              throw error;
            }

            // Si hay resultados, significa que el usuario ya existe en la tabla personal
            if (personalResults.length > 0) {
              console.log("Nombre y apellidos duplicados");
              res.redirect(
                "/administrador/agregarPersonal?mensaje=Numero%20de%20empleado%20y/o%20nombres%20duplicados"
              );
            } else {
              // Comenzar una transacción
              connection.beginTransaction(function (err) {
                if (err) {
                  throw err;
                }

                // Insertar en la tabla personal
                connection.query(
                  "INSERT INTO personal(nombre, apellido_paterno, apellido_materno, ocupacion, antiguedad, clave) VALUES (?, ?, ?, ?, ?, ?)",
                  [
                    nombre,
                    apellidoPaterno,
                    apellidoMaterno,
                    "Personal",
                    antiguedad,
                    clave,
                  ],
                  function (error, personalInsertResult, fields) {
                    if (error) {
                      return connection.rollback(function () {
                        throw error;
                      });
                    }

                    // Insertar en la tabla usuario
                    connection.query(
                      "INSERT INTO usuario(matricula_clave, contrasena, tipo) VALUES (?, ?, 'Personal')",
                      [clave, contrasena],
                      function (error, usuarioInsertResult, fields) {
                        if (error) {
                          return connection.rollback(function () {
                            throw error;
                          });
                        }

                        // Commit si todo está bien
                        connection.commit(function (err) {
                          if (err) {
                            return connection.rollback(function () {
                              throw err;
                            });
                          }
                          console.log("Datos almacenados correctamente");
                          res.redirect(
                            "/administrador/agregarPersonal?mensaje=Datos%20almacenados%20correctamente"
                          );
                        });
                      }
                    );
                  }
                );
              });
            }
          }
        );
      }
    }
  );
});

app.post("/modificar", function (req, res) {
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
  if (
    !nombre ||
    !apellidoPaterno ||
    !apellidoMaterno ||
    !antiguedad ||
    !clave ||
    !contrasena
  ) {
    return res.redirect(
      "/administrador/agregarPersonal?mensaje=Por%20favor,%20complete%20todos%20los%20campos%20antes%20de%20enviar%20el%20formulario."
    );
  }

  // Check if the user with the given clave already exists
  connection.query(
    "SELECT * FROM personal WHERE clave = ?",
    [clave],
    function (error, results, fields) {
      if (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return res.redirect(
          "/administrador/agregarPersonal?mensaje=Error%20en%20la%20consulta%20a%20la%20base%20de%20datos"
        );
      }

      // Check if the user with the given nombre and apellidos already exists with a different clave
      connection.query(
        "SELECT * FROM personal WHERE nombre = ? AND apellido_paterno = ? AND apellido_materno = ? AND clave <> ?",
        [nombre, apellidoPaterno, apellidoMaterno, clave],
        function (error, resultsSameName, fields) {
          if (error) {
            console.error("Error en la consulta a la base de datos:", error);
            return res.redirect(
              "/administrador/agregarPersonal?mensaje=Error%20en%20la%20consulta%20a%20la%20base%20de%20datos"
            );
          }

          // If there's another user with the same name and apellidos but different clave, return error
          if (resultsSameName.length > 0) {
            return res.redirect(
              "/administrador/agregarPersonal?mensaje=Error:%20Ya%20existe%20otro%20empleado%20con%20el%20mismo%20nombre%20y%20apellidos."
            );
          }

          // Continue with the update code
          connection.beginTransaction(function (err) {
            if (err) {
              throw err;
            }

            // Modificar el registro en la tabla personal
            connection.query(
              "UPDATE personal SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, antiguedad = ? WHERE clave = ?",
              [nombre, apellidoPaterno, apellidoMaterno, antiguedad, clave],
              function (error, results, fields) {
                if (error) {
                  return connection.rollback(function () {
                    throw error;
                  });
                }

                // Modificar el registro en la tabla usuario
                connection.query(
                  "UPDATE usuario SET contrasena = ? WHERE matricula_clave = ?",
                  [contrasena, clave], // Utilizamos la clave como referencia
                  function (error, results, fields) {
                    if (error) {
                      return connection.rollback(function () {
                        throw error;
                      });
                    }

                    // Commit si todo está bien
                    connection.commit(function (err) {
                      if (err) {
                        return connection.rollback(function () {
                          throw err;
                        });
                      }
                      console.log("Registro de personal modificado correctamente");
                      res.redirect(
                        "/administrador/agregarPersonal?mensaje=Personal%20modificado%20correctamente"
                      );
                    });
                  }
                );
              }
            );
          });
        }
      );
    }
  );
});


// Aquí se elimina un registro de personal y usuario
app.post("/eliminar", function (req, res) {
  const clave = req.body.clave;
  console.log(
    `Recibiendo solicitud para eliminar el usuario con clave: ${clave}`
  );

  // Comenzar una transacción
  connection.beginTransaction(function (err) {
    if (err) {
      throw err;
    }

    // Eliminar el registro de la tabla usuario (si existe)
    connection.query(
      "DELETE FROM usuario WHERE matricula_clave = ?",
      [clave],
      function (error, results, fields) {
        if (error) {
          return connection.rollback(function () {
            throw error;
          });
        }

        if (results.affectedRows === 0) {
          // El usuario no existe, enviar una alerta
          res.redirect(
            "/administrador/agregarPersonal?mensaje=Usuario%20no%20encontrado"
          );
          return;
        }

        // Eliminar el registro de la tabla personal
        connection.query(
          "DELETE FROM personal WHERE clave = ?",
          [clave],
          function (error, results, fields) {
            if (error) {
              return connection.rollback(function () {
                throw error;
              });
            }

            // Commit si todo está bien
            connection.commit(function (err) {
              if (err) {
                return connection.rollback(function () {
                  throw err;
                });
              }
              console.log("Registro de personal eliminado correctamente");
              res.redirect(
                "/administrador/agregarPersonal?mensaje=Usuario%20eliminado%20correctamente"
              );
            });
          }
        );
      }
    );
  });
});

app.post("/buscar", function (req, res) {
  const clave = req.body.clave;
  console.log("Recibiendo solicitud para buscar el usuario con clave:");
  console.log(clave);

  // Realizar la consulta para obtener los datos del usuario
  connection.query(
    `
        SELECT personal.*, usuario.contrasena
        FROM personal
        LEFT JOIN usuario ON personal.clave = usuario.matricula_clave
        WHERE personal.clave = ?
    `,
    [clave],
    function (error, results, fields) {
      if (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return res.redirect(
          "/administrador/agregarPersonal?mensaje=Error%20en%20la%20consulta%20a%20la%20base%20de%20datos"
        );
      }

      // Comprobar si se encontraron resultados
      if (results.length === 0) {
        return res.redirect(
          "/administrador/agregarPersonal?mensaje=Usuario%20no%20encontrado"
        );
      }

      // Obtener datos del usuario y construir la URL de redireccionamiento
      const usuario = results[0];
      const redirectURL = `/administrador/agregarPersonal?nombre=${usuario.nombre}&apellidoPaterno=${usuario.apellido_paterno}&apellidoMaterno=${usuario.apellido_materno}&antiguedad=${usuario.antiguedad}&contrasena=${usuario.contrasena}&clave=${usuario.clave}`;

      // Redirigir al usuario con los datos en la URL
      res.redirect(redirectURL);
    }
  );
});

function buildTableHtml(results) {
  // Construye la tabla HTML aquí
  let tableHtml =
    '<table name="tabla"  cellpadding="8">';

  // Construye la fila de encabezados utilizando los nombres de los campos
  tableHtml += "<tr>";
  for (const field in results[0]) {
    tableHtml += `<th>${field}</th>`;
  }
  tableHtml += "</tr>";

  // Construye las filas de datos
  for (const result of results) {
    tableHtml += "<tr>";
    for (const field in result) {
      tableHtml += `<td>${result[field]}</td>`;
    }
    tableHtml += "</tr>";
  }

  tableHtml += "</table>";
  return tableHtml;
}

app.get("/administrador/agregarPersonal/tabla", function (req, res) {
  // Realiza la consulta para obtener los últimos 5 registros
  connection.query(
    "SELECT nombre,apellido_paterno,apellido_materno,ocupacion,antiguedad,clave FROM personal ORDER BY id DESC LIMIT 5",
    function (error, results, fields) {
      if (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return res.status(500).send("Error en la consulta a la base de datos");
      }

      // Construye la tabla HTML
      const tableHtml = buildTableHtml(results);

      // Envía la tabla HTML como respuesta al cliente
      res.status(200).send(tableHtml);
    }
  );
});

//Seccion de agregarDocente

app.post("/insertarProfesor", function (req, res) {
  const datosProfesor = req.body;

  let nombre = datosProfesor.nombre;
  let apellidoPaterno = datosProfesor.apellidoPaterno;
  let apellidoMaterno = datosProfesor.apellidoMaterno;
  let profesion = datosProfesor.profesion;
  let clave = datosProfesor.clave;
  let contrasena = datosProfesor.contrasena;


  if (
    !nombre.trim() ||
    !apellidoPaterno.trim() ||
    !apellidoMaterno.trim() ||
    !profesion.trim() ||
    !clave.trim() ||
    !contrasena.trim()
) {
    return res.redirect(
        "/personal/agregarDocente?mensaje=Por%20favor,%20complete%20todos%20los%20campos%20antes%20de%20enviar%20el%20formulario."
    );
}


  // Verificar si el profesor ya existe en la tabla usuario
  connection.query(
    "SELECT * FROM usuario WHERE matricula_clave = ?",
    [clave],
    function (error, usuarioResults, fields) {
      if (error) {
        throw error;
      }

      // Si hay resultados, significa que el profesor ya existe en la tabla usuario
      if (usuarioResults.length > 0) {
        console.log("Numero de empleado y/o nombres duplicados");
        res.redirect(
          "/personal/agregarDocente?mensaje=Numero%20de%20empleado%20y/o%20nombres%20duplicados"
        );
      } else {
        // Verificar si el profesor ya existe en la tabla profesor
        connection.query(
          "SELECT * FROM profesor WHERE nombre = ? AND apellido_paterno = ? AND apellido_materno = ?",
          [nombre, apellidoPaterno, apellidoMaterno],
          function (error, profesorResults, fields) {
            if (error) {
              throw error;
            }
            // Si hay resultados, significa que el profesor ya existe en la tabla profesor
            if (profesorResults.length > 0) {
              console.log("Numero de empleado y/o nombres duplicados");
              res.redirect(
                "/personal/agregarDocente?mensaje=Numero%20de%20empleado%20y/o%20nombres%20duplicados"
              );
            } else {
              // Comenzar una transacción
              connection.beginTransaction(function (err) {
                if (err) {
                  throw err;
                }

                // Insertar en la tabla profesor
                connection.query(
                  "INSERT INTO profesor(nombre, apellido_paterno, apellido_materno, profesion, clave) VALUES (?, ?, ?, ?, ?)",
                  [nombre, apellidoPaterno, apellidoMaterno, profesion, clave],
                  function (error, profesorInsertResult, fields) {
                    if (error) {
                      return connection.rollback(function () {
                        throw error;
                      });
                    }

                    // Insertar en la tabla usuario
                    connection.query(
                      "INSERT INTO usuario(matricula_clave, contrasena, tipo) VALUES (?, ?, 'profesor')",
                      [clave, contrasena],
                      function (error, usuarioInsertResult, fields) {
                        if (error) {
                          return connection.rollback(function () {
                            throw error;
                          });
                        }

                        // Commit si todo está bien
                        connection.commit(function (err) {
                          if (err) {
                            return connection.rollback(function () {
                              throw err;
                            });
                          }
                          console.log(
                            "Datos del profesor almacenados correctamente"
                          );
                          res.redirect(
                            "/personal/agregarDocente?mensaje=Datos%20almacenados%20correctamente"
                          );
                        });
                      }
                    );
                  }
                );
              });
            }
          }
        );
      }
    }
  );
});

// Modificar un registro de profesor
app.post("/modificarProfesor", function (req, res) {
  const datosProfesor = req.body;

  let nombre = datosProfesor.nombre;
  let apellidoPaterno = datosProfesor.apellidoPaterno;
  let apellidoMaterno = datosProfesor.apellidoMaterno;
  let profesion = datosProfesor.profesion;
  let antiguedad = datosProfesor.antiguedad;
  const clave = datosProfesor.clave; // Usamos la clave como referencia
  let contrasena = datosProfesor.contrasena;

  if (
    !nombre.trim() ||
    !apellidoPaterno.trim() ||
    !apellidoMaterno.trim() ||
    !profesion.trim() ||
    !clave.trim() ||
    !contrasena.trim()
) {
    return res.redirect(
        "/personal/agregarDocente?mensaje=Por%20favor,%20complete%20todos%20los%20campos%20antes%20de%20enviar%20el%20formulario."
    );
}


  // Check if the professor with the given clave exists
  connection.query(
    "SELECT * FROM profesor WHERE clave = ? ",
    [clave],
    function (error, results, fields) {
      if (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return res.redirect(
          "/personal/agregarDocente?mensaje=Error%20en%20la%20consulta%20a%20la%20base%20de%20datos"
        );
      }

      // Check if there's a professor with the provided clave
      if (results.length === 0) {
        return res.redirect(
          "/personal/agregarDocente?mensaje=Docente%20no%20encontrado"
        );
      }

      // Check if the combination of nombre, apellidoPaterno, and apellidoMaterno exists in another professor
      connection.query(
        "SELECT * FROM profesor WHERE nombre = ? AND apellido_paterno = ? AND apellido_materno = ? AND clave != ?",
        [nombre, apellidoPaterno, apellidoMaterno, clave],
        function (error, results, fields) {
          if (error) {
            console.error("Error en la consulta a la base de datos:", error);
            return res.redirect(
              "/personal/agregarDocente?mensaje=Error%20en%20la%20consulta%20a%20la%20base%20de%20datos"
            );
          }

          if (results.length > 0) {
            return res.redirect(
              "/personal/agregarDocente?mensaje=Ya%20existe%20un%20Docente%20con%20el%20mismo%20nombre%20y%20apellidos%20y/o%20clave"
            );
          }

          // Continue with the update code
          connection.beginTransaction(function (err) {
            if (err) {
              throw err;
            }

            // Modificar el registro en la tabla profesor
            connection.query(
              "UPDATE profesor SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, profesion = ? WHERE clave = ?",
              [nombre, apellidoPaterno, apellidoMaterno, profesion, clave],
              function (error, results, fields) {
                if (error) {
                  return connection.rollback(function () {
                    throw error;
                  });
                }

                // Modificar el registro en la tabla usuario
                connection.query(
                  "UPDATE usuario SET contrasena = ? WHERE matricula_clave = ?",
                  [contrasena, clave], // Utilizamos la clave como referencia
                  function (error, results, fields) {
                    if (error) {
                      return connection.rollback(function () {
                        throw error;
                      });
                    }

                    // Commit si todo está bien
                    connection.commit(function (err) {
                      if (err) {
                        return connection.rollback(function () {
                          throw err;
                        });
                      }
                      console.log("Registro de profesor modificado correctamente");
                      res.redirect(
                        "/personal/agregarDocente?mensaje=Docente%20modificado%20correctamente"
                      );
                    });
                  }
                );
              }
            );
          });
        }
      );
    }
  );
});


// Eliminar un registro de profesor
app.post("/eliminarProfesor", function (req, res) {
  const clave = req.body.clave;
  console.log(
    `Recibiendo solicitud para eliminar el profesor con clave: ${clave}`
  );

  // Comenzar una transacción
  connection.beginTransaction(function (err) {
    if (err) {
      throw err;
    }

    // Obtener el id del maestro desde la tabla de profesores
    connection.query(
      "SELECT id FROM profesor WHERE clave = ?",
      [clave],
      function (error, results, fields) {
        if (error) {
          return connection.rollback(function () {
            throw error;
          });
        }

        if (results.length === 0) {
          // El profesor no existe, enviar una alerta
          res.redirect(
            "/personal/agregarDocente?mensaje=Docente%20no%20encontrado"
          );
          return;
        }

        const id_maestro = results[0].id;

        // Verificar si hay materias asignadas al profesor
        connection.query(
          "SELECT COUNT(*) AS count FROM materias WHERE ID_MAESTRO = ?",
          [id_maestro],
          function (error, results, fields) {
            if (error) {
              return connection.rollback(function () {
                throw error;
              });
            }

            const count = results[0].count;

            if (count > 0) {
              // El profesor tiene materias asignadas, enviar un mensaje de error
              res.redirect(
                "/personal/agregarDocente?mensaje=El%20docente%20tiene%20materias%20asignadas%20y%20no%20se%20puede%20eliminar"
              );
              return;
            }

            // Si no hay materias asignadas, proceder con la eliminación del profesor
            // Eliminar el registro de la tabla usuario (si existe)
            connection.query(
              "DELETE FROM usuario WHERE matricula_clave = ?",
              [clave],
              function (error, results, fields) {
                if (error) {
                  return connection.rollback(function () {
                    throw error;
                  });
                }

                // Eliminar el registro de la tabla profesor
                connection.query(
                  "DELETE FROM profesor WHERE clave = ?",
                  [clave],
                  function (error, results, fields) {
                    if (error) {
                      return connection.rollback(function () {
                        throw error;
                      });
                    }

                    // Commit si todo está bien
                    connection.commit(function (err) {
                      if (err) {
                        return connection.rollback(function () {
                          throw err;
                        });
                      }
                      console.log("Registro de profesor eliminado correctamente");
                      res.redirect(
                        "/personal/agregarDocente?mensaje=Docente%20eliminado%20correctamente"
                      );
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});


// Buscar un profesor por su clave
app.post("/buscarProfesor", function (req, res) {
  const clave = req.body.clave;
  console.log("Recibiendo solicitud para buscar el profesor con clave:");
  console.log(clave);

  // Realizar la consulta para obtener los datos del profesor
  connection.query(
    `
    SELECT profesor.*, usuario.contrasena
    FROM profesor
    LEFT JOIN usuario ON profesor.clave = usuario.matricula_clave
    WHERE profesor.clave = ?
`,
    [clave],
    function (error, results, fields) {
      if (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return res.redirect(
          "/personal/agregarDocente?mensaje=Error%20en%20la%20consulta%20a%20la%20base%20de%20datos"
        );
      }

      // Comprobar si se encontraron resultados
      if (results.length === 0) {
        return res.redirect(
          "/personal/agregarDocente?mensaje=Docente%20no%20encontrado"
        );
      }

      // Obtener datos del profesor y construir la URL de redireccionamiento
      const profesor = results[0];

      const redirectURL = `/personal/agregarDocente?nombre=${profesor.nombre}&apellidoPaterno=${profesor.apellido_paterno}&apellidoMaterno=${profesor.apellido_materno}&profesion=${profesor.profesion}&clave=${profesor.clave}&contrasena=${profesor.contrasena}`;

      // Redirigir al usuario con los datos en la URL
      res.redirect(redirectURL);
    }
  );
});

app.get("/personal/agregarDocente/tabla", function (req, res) {
  // Realiza la consulta para obtener los últimos 5 registros
  connection.query(
    "SELECT nombre,apellido_paterno,apellido_materno,profesion,clave FROM profesor ORDER BY id DESC LIMIT 5",
    function (error, results, fields) {
      if (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return res.status(500).send("Error en la consulta a la base de datos");
      }

      // Construye la tabla HTML
      const tableHtml = buildTableHtml(results);

      // Envía la tabla HTML como respuesta al cliente
      res.status(200).send(tableHtml);
    }
  );
});

//Seccion para agregar Materia

// Sección de agregar Materia
app.post("/insertarMateria", function (req, res) {
  const datosMateria = req.body;
  console.log(req.body);

  let nombre = datosMateria.nombre;
  let docente = datosMateria.docente;
  let hora = datosMateria.hora;
  let diaSemana = datosMateria.dias;
  let semestre = datosMateria.semestre;
  let salon = datosMateria.salon;
  let periodo = datosMateria.periodo;
  // Verificar si ya existe una materia con los mismos datos

  if (
    !nombre.trim() ||
    !docente.trim() ||
    !hora.trim() ||
    !diaSemana.trim() ||
    !semestre.trim() ||
    !salon.trim() ||
    !periodo.trim()
) {
    return res.redirect(
        "/personal/agregarMateria?mensaje=Por%20favor,%20complete%20todos%20los%20campos%20antes%20de%20enviar%20el%20formulario."
    );
}


  connection.query(
    "SELECT * FROM materias WHERE NOMBRE = ? AND ID_MAESTRO = ? AND HORA = ? AND DIA_SEMANA = ? AND SALON = ? AND PERIODO = ? ",
    [nombre, docente, hora, diaSemana,salon,periodo],
    function (error, results, fields) {
      if (error) {
        throw error;
      }

      if (results.length > 0) {
        // Si ya existe una materia con los mismos datos, enviar mensaje de error
        console.log("Ya existe una materia con los mismos datos.");
        res.redirect(
          "/personal/agregarMateria?mensaje=Ya%20existe%20una%20materia%20con%20los%20mismos%20datos"
        );
      } else {
        // Verificar si el docente tiene otro registro a la misma hora
        connection.query(
          "SELECT * FROM materias WHERE ID_MAESTRO = ? AND HORA = ? AND PERIODO = ? ",
          [docente, hora,periodo],
          function (error, results, fields) {
            if (error) {
              throw error;
            }

            if (results.length > 0) {
              // Si el docente ya tiene otro registro a la misma hora, enviar mensaje de error
              console.log("El docente ya tiene otro registro a la misma hora.");
              res.redirect(
                "/personal/agregarMateria?mensaje=El%20docente%20ya%20tiene%20otro%20registro%20a%20la%20misma%20hora"
              );
            } else {
              // Comenzar una transacción
              connection.beginTransaction(function (err) {
                if (err) {
                  throw err;
                }

                // Insertar en la tabla Materias
                connection.query(
                  "INSERT INTO materias (NOMBRE, ID_MAESTRO, HORA, DIA_SEMANA, SEMESTRE,SALON,PERIODO) VALUES (?, ?, ?, ?, ?,?,?)",
                  [nombre, docente, hora, diaSemana, semestre,salon,periodo],
                  function (error, results, fields) {
                    if (error) {
                      return connection.rollback(function () {
                        throw error;
                      });
                    }

                    // Commit si todo está bien
                    connection.commit(function (err) {
                      if (err) {
                        return connection.rollback(function () {
                          throw err;
                        });
                      }
                      console.log(
                        "Datos de la materia almacenados correctamente"
                      );
                      res.redirect(
                        "/personal/agregarMateria?mensaje=Datos%20almacenados%20correctamente"
                      );
                    });
                  }
                );
              });
            }
          }
        );
      }
    }
  );
});

// Modificar Materia

app.post("/modificarMateria", function (req, res) {
  const datosMateria = req.body;
  console.log(req.body);

  const nombre = datosMateria.nombre;
  const idMaestro = datosMateria.docente;
  let hora = datosMateria.hora;
  let diaSemana = datosMateria.dias;
  let semestre = datosMateria.semestre;
  const idMaestro_Viejo = datosMateria.docente_antiguo;
  const hora_antigua = datosMateria.hora_antigua;
  const salon = datosMateria.salon;
  const periodo = datosMateria.periodo;

  if (
    !nombre.trim() ||
    !idMaestro.trim() ||
    !hora.trim() ||
    !diaSemana.trim() ||
    !semestre.trim() ||
    !salon.trim() ||
    !periodo.trim()
) {
    return res.redirect(
        "/personal/agregarMateria?mensaje=Por%20favor,%20complete%20todos%20los%20campos%20antes%20de%20enviar%20el%20formulario."
    );
}


  // Continuar con el código de verificación
  connection.beginTransaction(function (err) {
    if (err) {
      throw err;
    }

    // Verificar si se están intentando cambiar el ID del maestro o la hora
    if (idMaestro !== idMaestro_Viejo || hora !== hora_antigua) {
      console.log("No se permite cambiar al docente o la hora.");
      return res.redirect(
        "/personal/agregarMateria?mensaje=No%20se%20permite%20cambiar%20al%20docente%20o%20la%20hora."
      );
    }

    // Verificar si el docente tiene otro registro a la misma hora excluyendo la materia que se está modificando
    connection.query(
      "SELECT * FROM materias WHERE ID_MAESTRO = ? AND HORA = ? AND PERIODO = ?  AND NOT ( HORA = ? AND ID_MAESTRO = ? AND PERIODO = ?)",
      [idMaestro, hora,periodo, hora, idMaestro,periodo],
      function (error, results, fields) {
        if (error) {
          return connection.rollback(function () {
            throw error;
          });
        }

        if (results.length > 0) {
          // Si el docente ya tiene otro registro a la misma hora, enviar mensaje de error
          console.log("El docente ya tiene otro registro a la misma hora.");
          return res.redirect(
            "/personal/agregarMateria?mensaje=Error:%20El%20docente%20ya%20tiene%20otro%20registro%20a%20la%20misma%20hora"
          );
        } else {
          // Continuar con el código de actualización
          connection.query(
            "UPDATE materias SET NOMBRE = ?, DIA_SEMANA = ?, SEMESTRE = ?, SALON = ? , PERIODO = ? WHERE  ID_MAESTRO = ? AND HORA = ? ",
            [
              nombre,
              diaSemana,
              semestre,
              salon,
              periodo,
              idMaestro,
              hora
            ],
            function (error, results, fields) {
              if (error) {
                return connection.rollback(function () {
                  throw error;
                });
              }

              // Commit si todo está bien
              connection.commit(function (err) {
                if (err) {
                  return connection.rollback(function () {
                    throw err;
                  });
                }
                console.log("Registro de materia modificado correctamente");
                res.redirect(
                  "/personal/agregarMateria?mensaje=Materia%20modificada%20correctamente"
                );
              });
            }
          );
        }
      }
    );
  });
});


// Eliminar Materia
app.post("/eliminarMateria", function (req, res) {
  const docente = req.body.docente;
  const hora = req.body.hora;
  console.log(
    `Recibiendo solicitud para eliminar la materia con docente: ${docente} y hora: ${hora}`
  );

  // Verificar si se proporcionaron los datos necesarios
  if (!docente || !hora) {
    return res.redirect(
      "/personal/agregarMateria?mensaje=Error:%20Se%20requieren%20el%20docente%20y%20la%20hora%20para%20eliminar%20una%20materia"
    );
  }

  // Comenzar una transacción
  connection.beginTransaction(function (err) {
    if (err) {
      throw err;
    }

    // Verificar si la materia con el docente y la hora proporcionados existe
    connection.query(
      "SELECT * FROM materias WHERE ID_MAESTRO = ? AND HORA = ?",
      [docente, hora],
      function (error, results, fields) {
        if (error) {
          return connection.rollback(function () {
            throw error;
          });
        }

        if (results.length === 0) {
          // La materia no existe, enviar una alerta
          res.redirect(
            "/personal/agregarMateria?mensaje=Materia%20no%20encontrada"
          );
          return;
        }

        // Eliminar el registro de la tabla Materias
        connection.query(
          "DELETE FROM materias WHERE ID_MAESTRO = ? AND HORA = ?",
          [docente, hora],
          function (error, results, fields) {
            if (error) {
              return connection.rollback(function () {
                throw error;
              });
            }

            // Commit si todo está bien
            connection.commit(function (err) {
              if (err) {
                return connection.rollback(function () {
                  throw err;
                });
              }
              console.log("Registro de materia eliminado correctamente");
              res.redirect(
                "/personal/agregarMateria?mensaje=Materia%20eliminada%20correctamente"
              );
            });
          }
        );
      }
    );
  });
});

// Buscar Materia
app.post("/buscarMateria", function (req, res) {
  const docente = req.body.docente;
  const hora = req.body.hora;
  const periodo = req.body.periodo;

  console.log("Recibiendo solicitud para buscar la materia con docente:");
  console.log(docente);
  console.log("y hora:");
  console.log(hora);
  console.log(periodo);

  // Realizar la consulta para obtener los datos de la materia
  connection.query(
    "SELECT * FROM materias WHERE ID_MAESTRO = ? AND HORA = ? AND PERIODO = ? ",
    [docente, hora,periodo],
    function (error, results, fields) {
      if (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return res.redirect(
          "/personal/agregarMateria?mensaje=Error%20en%20la%20consulta%20a%20la%20base%20de%20datos"
        );
      }
 
      // Comprobar si se encontraron resultados
      if (results.length === 0) {
        return res.redirect(
          "/personal/agregarMateria?mensaje=Materia%20no%20encontrada"
        );
      }

      // Obtener datos de la materia y construir la URL de redireccionamiento
      const materia = results[0];
      console.log(materia);
      const redirectURL = `/personal/agregarMateria?nombre=${materia.NOMBRE}&idMaestro=${materia.ID_MAESTRO}&hora=${materia.HORA}&diaSemana=${materia.DIA_SEMANA}&semestre=${materia.SEMESTRE}&salon=${materia.SALON}&periodo=${materia.PERIODO}`;

      // Redirigir al usuario con los datos en la URL
      res.redirect(redirectURL);
    }
  );
});

app.get("/personal/agregarMateria/tabla", function (req, res) {
  const filtroNombreMateria = req.query.filtroNombreMateria || ""; // Obtener el filtro de nombre de materia
  const filtroIdMaestro = req.query.filtroIdMaestro || ""; // Obtener el filtro de id_maestro
  const filtroPeriodo = req.query.filtroPeriodo || ""; // Obtener el filtro de período

  // Construir la consulta SQL basada en los filtros
  let sqlQuery = 'SELECT materias.NOMBRE AS NOMBRE_MATERIA, CONCAT(profesor.nombre, " ", profesor.apellido_paterno, " ", profesor.apellido_materno) AS NOMBRE_PROFESOR, materias.SEMESTRE, CASE WHEN HOUR(materias.HORA) = 7 THEN "07:00 - 08:00" WHEN HOUR(materias.HORA) = 8 THEN "08:00 - 09:00" WHEN HOUR(materias.HORA) = 9 THEN "09:00 - 10:00" WHEN HOUR(materias.HORA) = 10 THEN "10:00 - 11:00" WHEN HOUR(materias.HORA) = 11 THEN "11:00 - 12:00" WHEN HOUR(materias.HORA) = 12 THEN "12:00 - 13:00" WHEN HOUR(materias.HORA) = 13 THEN "13:00 - 14:00" END AS HORA, materias.DIA_SEMANA, materias.SALON ,materias.PERIODO FROM materias INNER JOIN profesor ON materias.ID_MAESTRO = profesor.id';

  if (filtroNombreMateria || filtroIdMaestro || filtroPeriodo) {
    // Si hay filtros, agregar condiciones WHERE a la consulta SQL
    sqlQuery += " WHERE ";
    if (filtroNombreMateria) {
      sqlQuery += `materias.NOMBRE LIKE '%${filtroNombreMateria}%'`;
      if (filtroIdMaestro || filtroPeriodo) {
        sqlQuery += " AND ";
      }
    }
    if (filtroIdMaestro) {
      sqlQuery += `profesor.id = ${filtroIdMaestro}`;
      if (filtroPeriodo) {
        sqlQuery += " AND ";
      }
    }
    if (filtroPeriodo) {
      sqlQuery += `materias.PERIODO = '${filtroPeriodo}'`;
    }
  }

  // Agregar el orden y límite
  sqlQuery += ' ORDER BY materias.id DESC';

  // Si los filtros están vacíos, establecer el límite en 7, de lo contrario, no hay límite
  if (!(filtroNombreMateria || filtroIdMaestro )) {
    sqlQuery += ' LIMIT 5';
  }

  // Realizar la consulta a la base de datos
  connection.query(sqlQuery, function (error, results, fields) {
    if (error) {
      console.error("Error en la consulta a la base de datos:", error);
      return res.status(500).send("Error en la consulta a la base de datos");
    }

    // Construir la tabla HTML
    const tableHtml = buildTableHtml(results);

    // Enviar la tabla HTML como respuesta al cliente
    res.status(200).send(tableHtml);
  });
});



app.get("/profesores", (req, res) => {
  connection.query("SELECT * FROM profesor", (err, results) => {
    if (err) {
      console.error("Error al obtener los profesores:", err);
      res.status(500).send("Error interno del servidor");
      return;
    }
    res.json(results);
  });
});

// Seccion de insertarAlumnos
app.post("/insertarAlumnos", function (req, res) {
    const datosAlumnos = req.body;
  
    let nombre = datosAlumnos.nombre;
    let apellidoPaterno = datosAlumnos.apellidoPaterno;
    let apellidoMaterno = datosAlumnos.apellidoMaterno;
    let matricula = datosAlumnos.matricula;
    let contrasena = datosAlumnos.contrasena;
  
    let genero = datosAlumnos.genero;
    let Domicilio = datosAlumnos.Domicilio;
    let Fecha_Nacimiento = datosAlumnos.Fecha_Nacimiento;
    let semestre = datosAlumnos.semestre;
  
    // Convertir la fecha de entrada en un objeto de fecha
    let fechaNacimientoObj = new Date(Fecha_Nacimiento);
  
    fechaNacimientoObj.setDate(fechaNacimientoObj.getDate() + 1);

    // Obtener los componentes de la fecha de nacimiento modificada
    const year = fechaNacimientoObj.getFullYear();
    const month = (fechaNacimientoObj.getMonth() + 1).toString().padStart(2, "0");
    const day = fechaNacimientoObj.getDate().toString().padStart(2, "0");
    
    // Formatear la nueva fecha
    const fechaFormateada = `${year}-${month}-${day}`;
    
    if (
      !nombre.trim() ||
      !apellidoPaterno.trim() ||
      !apellidoMaterno.trim() ||
      !genero.trim() ||
      !Domicilio.trim() ||
      !Fecha_Nacimiento.trim() ||
      !semestre.trim() ||
      !contrasena.trim()
  ) {
      return res.redirect(
          "/personal/agregarAlumnos?mensaje=Por%20favor,%20complete%20todos%20los%20campos%20antes%20de%20enviar%20el%20formulario."
      );
  }

  
    // Verificar si el Alumno ya existe en la tabla usuario
    connection.query(
      "SELECT * FROM usuario WHERE matricula_clave= ?",
      [matricula],
      function (error, usuarioResults, fields) {
        if (error) {
          throw error;
        }
  
        // Si hay resultados, significa que el Alumno ya existe en la tabla usuario
        if (usuarioResults.length > 0) {
          console.log("Matricula y/o nombres duplicados");
          res.redirect(
            "/personal/agregarAlumnos?mensaje=Matricula%20y/o%20nombres%20duplicados"
          );
        } else {
          // Verificar si el Alumno ya existe en la tabla Alumnos
          connection.query(
            "SELECT * FROM alumnos WHERE nombre = ? AND apellido_paterno = ? AND apellido_materno = ?",
            [nombre, apellidoPaterno, apellidoMaterno],
            function (error, alumnosResults, fields) {
              if (error) {
                throw error;
              }
  
              // Si hay resultados, significa que el Alumno ya existe en la tabla Alumnos
              if (alumnosResults.length > 0) {
                console.log("Matricula y/o nombres duplicados");
                res.redirect(
                  "/personal/agregarAlumnos?mensaje=Matricula%20y/o%20nombres%20duplicados"
                );
              } else {
                // Comenzar una transacción
                connection.beginTransaction(function (err) {
                  if (err) {
                    throw err;
                  }
  
                  // Insertar en la tabla Alumnos
                  connection.query(
                    "INSERT INTO alumnos(nombre, apellido_paterno, apellido_materno, genero, matricula, Domicilio, Fecha_Nacimiento, semestre) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                      nombre,
                      apellidoPaterno,
                      apellidoMaterno,
                      genero,
                      matricula,
                      Domicilio,
                      fechaFormateada,
                      semestre,
                    ],
                    function (error, alumnosInsertResult, fields) {
                      if (error) {
                        return connection.rollback(function () {
                          throw error;
                        });
                      }
  
                      // Insertar en la tabla usuario
                      connection.query(
                        "INSERT INTO usuario(matricula_clave, contrasena, tipo) VALUES (?, ?, 'Alumno')",
                        [matricula, contrasena],
                        function (error, usuarioInsertResult, fields) {
                          if (error) {
                            return connection.rollback(function () {
                              throw error;
                            });
                          }
  
                          // Commit si todo está bien
                          connection.commit(function (err) {
                            if (err) {
                              return connection.rollback(function () {
                                throw err;
                              });
                            }
                            console.log(
                              "Datos del Alumno almacenados correctamente"
                            );
                            res.redirect(
                              "/personal/agregarAlumnos?mensaje=Datos%20almacenados%20correctamente"
                            );
                          });
                        }
                      );
                    }
                  );
                });
              }
            }
          );
        }
      }
    );
  });
  
  app.post("/modificarAlumnos", function (req, res) {
    const datosAlumnos = req.body;

    let nombre = datosAlumnos.nombre;
    let apellidoPaterno = datosAlumnos.apellidoPaterno;
    let apellidoMaterno = datosAlumnos.apellidoMaterno;
    const matricula = datosAlumnos.matricula;
    let contrasena = datosAlumnos.contrasena;
    let genero = datosAlumnos.genero;
    let Domicilio = datosAlumnos.Domicilio;
    let Fecha_Nacimiento = datosAlumnos.Fecha_Nacimiento;
    let semestre = datosAlumnos.semestre;

    let fechaNacimientoObj = new Date(Fecha_Nacimiento);

    
// Sumar un día a la fecha de nacimiento
fechaNacimientoObj.setDate(fechaNacimientoObj.getDate() + 1);

// Obtener los componentes de la fecha de nacimiento modificada
const year = fechaNacimientoObj.getFullYear();
const month = (fechaNacimientoObj.getMonth() + 1).toString().padStart(2, "0");
const day = fechaNacimientoObj.getDate().toString().padStart(2, "0");

// Formatear la nueva fecha
const fechaFormateada = `${year}-${month}-${day}`;


    console.log(nombre)
    console.log(apellidoPaterno)
    console.log(apellidoMaterno)
    console.log(matricula)

    if (
      !nombre.trim() ||
      !apellidoPaterno.trim() ||
      !apellidoMaterno.trim() ||
      !genero.trim() ||
      !Domicilio.trim() ||
      !Fecha_Nacimiento.trim() ||
      !semestre.trim() ||
      !contrasena.trim()
  ) {
      return res.redirect(
          "/personal/agregarAlumnos?mensaje=Por%20favor,%20complete%20todos%20los%20campos%20antes%20de%20enviar%20el%20formulario."
      );
  }
  

    connection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }

   
      
        // Validación de nombres y apellidos
        connection.query("SELECT * FROM alumnos WHERE nombre = ? AND apellido_paterno = ? AND apellido_materno = ? AND matricula <> ?",
            [nombre, apellidoPaterno, apellidoMaterno, matricula],
            function (error, results, fields) {
                if (error) {
                    console.error("Error en la consulta a la base de datos:", error);
                    return res.redirect("/personal/agregarAlumnos?mensaje=Error%20en%20la%20consulta%20a%20la%20base%20de%20datos");
                }

                if (results.length > 0) {
                  return res.redirect("/personal/agregarAlumnos?mensaje=Ya%20existe%20un%20alumno%20con%20el%20mismo%20nombre%20y%20apellidos%20y/o%20intentó%20cambiar%20la%20matrícula");
                }

                // Continuar con el código de actualización
                connection.query("UPDATE alumnos SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, genero = ?, Domicilio = ?, Fecha_Nacimiento = ?, semestre = ? WHERE matricula = ?",
                    [nombre, apellidoPaterno, apellidoMaterno, genero, Domicilio, fechaFormateada, semestre, matricula],
                    function (error, results, fields) {
                        if (error) {
                            return connection.rollback(function () {
                                throw error;
                            });
                        }

                        // Actualizar la contraseña en la tabla "usuario"
                        connection.query("UPDATE usuario SET contrasena = ? WHERE matricula_clave = ?",
                            [contrasena, matricula],
                            function (error, results, fields) {
                                if (error) {
                                    return connection.rollback(function () {
                                        throw error;
                                    });
                                }

                                connection.commit(function (err) {
                                    if (err) {
                                        return connection.rollback(function () {
                                            throw err;
                                        });
                                    }
                                    console.log("Registro de Alumno modificado correctamente");
                                    res.redirect("/personal/agregarAlumnos?mensaje=Alumno%20modificado%20correctamente");
                                });
                            });
                    });
            });
    });
});

  

// Eliminar un registro de Alumnos
app.post("/eliminarAlumnos", function (req, res) {
  const matricula = req.body.matricula;
  console.log(
    `Recibiendo solicitud para eliminar el Alumno con matricula: ${matricula}`
  );

  // Comenzar una transacción
  connection.beginTransaction(function (err) {
    if (err) {
      throw err;
    }

    // Eliminar el registro de la tabla usuario (si existe)
    connection.query(
      "DELETE FROM usuario WHERE matricula_clave = ?",
      [matricula],
      function (error, results, fields) {
        if (error) {
          return connection.rollback(function () {
            throw error;
          });
        }

        if (results.affectedRows === 0) {
          // El Alumnos no existe, enviar una alerta
          res.redirect(
            "/personal/agregarAlumnos?mensaje=Alumno%20no%20encontrado"
          );
          return;
        }

        // Eliminar el registro de la tabla Alumnos
        connection.query(
          "DELETE FROM alumnos WHERE matricula = ?",
          [matricula],
          function (error, results, fields) {
            if (error) {
              return connection.rollback(function () {
                throw error;
              });
            }

            // Commit si todo está bien
            connection.commit(function (err) {
              if (err) {
                return connection.rollback(function () {
                  throw err;
                });
              }
              console.log("Registro de Alumnos eliminado correctamente");
              res.redirect(
                "/personal/agregarAlumnos?mensaje=Alumno%20eliminado%20correctamente"
              );
            });
          }
        );
      }
    );
  });
});

// Buscar un alumno por su matricula
app.post("/buscarAlumnos", function (req, res) {
  const matricula = req.body.matricula;
  console.log("Recibiendo solicitud para buscar el alumno con matricula:");
  console.log(matricula);

  // Realizar la consulta para obtener los datos del Alumno
  connection.query(
    `
    SELECT alumnos.*, usuario.contrasena
    FROM alumnos
    LEFT JOIN usuario ON alumnos.matricula = usuario.matricula_clave
    WHERE alumnos.matricula = ?`,
    [matricula],
    function (error, results, fields) {
      if (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return res.redirect(
          "/personal/agregarAlumnos?mensaje=Error%20en%20la%20consulta%20a%20la%20base%20de%20datos"
        );
      }

      // Comprobar si se encontraron resultados
      if (results.length === 0) {
        return res.redirect(
          "/personal/agregarAlumnos?mensaje=Alumno%20no%20encontrado"
        );
      }

      // Obtener datos del Alumno y formatear la fecha
      const alumno = results[0];
      const fechaNacimiento = new Date(alumno.Fecha_Nacimiento);
      const fechaFormateada = `${fechaNacimiento.getFullYear()}-${(
        fechaNacimiento.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${fechaNacimiento
        .getDate()
        .toString()
        .padStart(2, "0")}`;

      // Construir la URL de redireccionamiento con la fecha formateada
      const redirectURL = `/personal/agregarAlumnos?nombre=${encodeURIComponent(alumno.nombre)}&apellidoPaterno=${encodeURIComponent(alumno.apellido_paterno)}&apellidoMaterno=${encodeURIComponent(alumno.apellido_materno)}&genero=${encodeURIComponent(alumno.genero)}&matricula=${encodeURIComponent(alumno.matricula)}&fecha_Nacimiento=${encodeURIComponent(fechaFormateada)}&semestre=${encodeURIComponent(alumno.semestre)}&contrasena=${encodeURIComponent(alumno.contrasena)}&domicilio=${encodeURIComponent(alumno.Domicilio)}`;

      // Redirigir al usuario con los datos en la URL
      res.redirect(redirectURL);
    }
  );
});


app.get("/personal/agregarAlumnos/tabla", function (req, res) {
  // Realiza la consulta para obtener los últimos 5 registros
  connection.query(
    'SELECT nombre, apellido_paterno, apellido_materno, genero, matricula, Domicilio, DATE_FORMAT(Fecha_Nacimiento, "%d-%m-%Y") AS Fecha_Nacimiento, semestre FROM alumnos ORDER BY id DESC LIMIT 5',
    function (error, results, fields) {
      if (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return res.status(500).send("Error en la consulta a la base de datos");
      }

      // Construye la tabla HTML
      const tableHtml = buildTableHtml(results);

      // Envía la tabla HTML como respuesta al cliente
      res.status(200).send(tableHtml);
    }
  );
});

app.get("/personal/crearHorario/tabla", function (req, res) {
  const filtroSemestre = req.query.filtroSemestre || ""; // Obtener el filtro de semestre
  const filtroPeriodo = req.query.filtroPeriodo || ""; // Obtener el filtro de período

  // Consulta SQL base
  let sqlQuery = 'SELECT materias.ID AS ID_MATERIA, materias.NOMBRE AS NOMBRE_MATERIA, CONCAT(profesor.nombre, " ", profesor.apellido_paterno, " ", profesor.apellido_materno) AS NOMBRE_PROFESOR, materias.SEMESTRE, CASE WHEN HOUR(materias.HORA) = 7 THEN "07:00 - 08:00" WHEN HOUR(materias.HORA) = 8 THEN "08:00 - 09:00" WHEN HOUR(materias.HORA) = 9 THEN "09:00 - 10:00" WHEN HOUR(materias.HORA) = 10 THEN "10:00 - 11:00" WHEN HOUR(materias.HORA) = 11 THEN "11:00 - 12:00" WHEN HOUR(materias.HORA) = 12 THEN "12:00 - 13:00" WHEN HOUR(materias.HORA) = 13 THEN "13:00 - 14:00" END AS HORA, materias.DIA_SEMANA, materias.PERIODO, materias.SALON FROM materias INNER JOIN profesor ON materias.ID_MAESTRO = profesor.id';

  // Lista de condiciones de filtro
  const condicionesFiltro = [];

  // Si hay filtro de semestre, agregar la condición correspondiente
  if (filtroSemestre) {
    condicionesFiltro.push(`materias.SEMESTRE = '${filtroSemestre}'`);
  }

  // Si hay filtro de período, agregar la condición correspondiente
  if (filtroPeriodo) {
    condicionesFiltro.push(`materias.PERIODO = '${filtroPeriodo}'`);
  }

  // Si hay condiciones de filtro, agregar la cláusula WHERE a la consulta SQL
  if (condicionesFiltro.length > 0) {
    sqlQuery += " WHERE " + condicionesFiltro.join(" AND ");
  }
    
  // Agregar la condición para evitar seleccionar las materias que ya están en el horario
  for (let i = 1; i <= 7; i++) {
    sqlQuery += ` AND materias.ID NOT IN (SELECT id_materia_${i} FROM horarios WHERE id_materia_${i} IS NOT NULL)`;
  }

  // Ordenar los resultados por hora ascendente
  sqlQuery += ' ORDER BY HOUR(materias.HORA) ASC';

  // Si no hay filtros de semestre ni de período, establecer el límite en 7, de lo contrario, no hay límite
  if (!filtroSemestre && !filtroPeriodo) {
    sqlQuery += ' LIMIT 7';
  }

  // Realizar la consulta a la base de datos
  connection.query(sqlQuery, function (error, results, fields) {
    if (error) {
      console.error("Error en la consulta a la base de datos:", error);
      return res.status(500).send("Error en la consulta a la base de datos");
    }

    // Enviar los resultados como JSON al cliente
    res.status(200).json(results);
  });
});


// Sección de insertarHorario
app.post("/insertarHorario", function (req, res) {
  const { nombreHorario, elementosHorario } = req.body;

  // Verificar que el nombre no esté vacío y que haya al menos un elemento en elementosHorario
  if (!nombreHorario || !elementosHorario || JSON.parse(elementosHorario).length === 0) {
    return res.redirect(
      "/personal/crearHorario?mensaje=Nombre%20del%20horario%20vacío%20o%20sin%20elementos"
    );
  }

  // Convertir elementosHorario a un objeto JavaScript si es una cadena JSON
  const parsedElementosHorario = JSON.parse(elementosHorario);

  // Definir las horas de 7:00am a 2:00pm
  const horasDelDia = [
    "07:00 - 08:00",
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:00"
  ];

  // Verificar si ya existe un horario con el mismo nombre
  connection.query("SELECT * FROM horarios WHERE nombre = ?", [nombreHorario], function (err, results) {
    if (err) {
      throw err;
    }

    // Si ya existe un horario con el mismo nombre, redirigir con un mensaje de error
    if (results.length > 0) {
      return res.redirect(
        "/personal/crearHorario?mensaje=Ya%20existe%20un%20horario%20con%20ese%20nombre"
      );
    }

    // Iniciar el query para la inserción de los datos si no hay un horario con el mismo nombre
    let sql = "INSERT INTO horarios (nombre, ";
    for (let i = 1; i <= horasDelDia.length; i++) {
      sql += `ID_MATERIA_${i}, `;
    }
    sql = sql.slice(0, -2); // Eliminar la última coma y espacio
    sql += ") VALUES (?, ";

    // Crear un array con los valores a insertar
    const values = [nombreHorario];

    // Asignar los IDs de las materias a los campos correspondientes según la hora
    horasDelDia.forEach(hora => {
      const elemento = parsedElementosHorario.find(el => el.hora === hora);
      if (elemento) {
        values.push(elemento.id);
      } else {
        values.push(null);
      }
    });

    // Agregar placeholders para los valores
    const placeholders = horasDelDia.map(() => "?").join(", ");
    sql += placeholders + ")";

    // Ejecutar el query
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      }

      connection.query(sql, values, function (error, results, fields) {
        if (error) {
          return connection.rollback(function () {
            throw error;
          });
        }

        // Commit si todo está bien
        connection.commit(function (err) {
          if (err) {
            return connection.rollback(function () {
              throw err;
            });
          }
          return res.redirect(
            "/personal/crearHorario?mensaje=Datos%20almacenados%20correctamente"
          );
        });
      });
    });
  });
});


app.get("/personal/crearHorario/tablaHorario", function (req, res) {
  const filtroNombre = req.query.filtroNombre; // Obtener el filtro de nombre de horario

  // Consulta SQL base para obtener los datos de la tabla de horarios con las materias y nombres de profesores
  let sqlQuery = `SELECT horarios.id AS ID_HORARIO, horarios.nombre AS NOMBRE_HORARIO, 
                  materias.ID AS ID_MATERIA, materias.NOMBRE AS NOMBRE_MATERIA, 
                  CONCAT(profesor.nombre, " ", profesor.apellido_paterno, " ", profesor.apellido_materno) AS NOMBRE_PROFESOR, 
                  materias.SEMESTRE, 
                  CASE 
                    WHEN HOUR(materias.HORA) = 7 THEN "07:00 - 08:00" 
                    WHEN HOUR(materias.HORA) = 8 THEN "08:00 - 09:00" 
                    WHEN HOUR(materias.HORA) = 9 THEN "09:00 - 10:00" 
                    WHEN HOUR(materias.HORA) = 10 THEN "10:00 - 11:00" 
                    WHEN HOUR(materias.HORA) = 11 THEN "11:00 - 12:00" 
                    WHEN HOUR(materias.HORA) = 12 THEN "12:00 - 13:00" 
                    WHEN HOUR(materias.HORA) = 13 THEN "13:00 - 14:00" 
                  END AS HORA, 
                  materias.DIA_SEMANA, materias.PERIODO, materias.SALON 
                FROM horarios 
                INNER JOIN materias ON horarios.id_materia_1 = materias.ID OR horarios.id_materia_2 = materias.ID 
                                   OR horarios.id_materia_3 = materias.ID OR horarios.id_materia_4 = materias.ID 
                                   OR horarios.id_materia_5 = materias.ID OR horarios.id_materia_6 = materias.ID 
                                   OR horarios.id_materia_7 = materias.ID 
                INNER JOIN profesor ON materias.ID_MAESTRO = profesor.id`;

  // Si hay filtro de nombre de horario, agregar la condición correspondiente
  if (filtroNombre) {
    sqlQuery += ` WHERE horarios.nombre = '${filtroNombre}'`;
  }

  // Ordenar los resultados por hora ascendente
  sqlQuery += ' ORDER BY HOUR(materias.HORA) ASC';

  // Realizar la consulta a la base de datos para obtener los datos de la tabla de horarios y materias
  connection.query(sqlQuery, function (error, results, fields) {
    if (error) {
      console.error("Error en la consulta a la base de datos:", error);
      return res.status(500).send("Error en la consulta a la base de datos");
    }

    // Si no se encontraron resultados, enviar un mensaje indicando que no se encontraron horarios
    if (results.length === 1) {
      return res.redirect(
        "/personal/crearHorario?mensaje=Horario%20no%20encontrado"
      ); 
    }

    // Enviar los resultados como JSON al cliente
    res.status(200).json(results);
  });
});



// Sección de actualizarHorario
app.post("/modificarHorario", function (req, res) {
  const { nombreHorario, elementosHorarioN } = req.body;
  const [idHorario] = req.body.idHorario;
  
  console.log(req.body)
  // Verificar que el nombre, el ID y los elementos no estén vacíos
  if (!idHorario || !nombreHorario || !elementosHorarioN || JSON.parse(elementosHorarioN).length === 0) {
    return res.redirect(
      "/personal/crearHorario?mensaje=Nombre%20del%20horario%20vacío%20o%20sin%20elementos"
    );
  }

  // Convertir elementosHorario a un objeto JavaScript si es una cadena JSON
  const parsedElementosHorario = JSON.parse(elementosHorarioN);

  // Verificar si ya existe un horario con el mismo nombre
  connection.query("SELECT * FROM horarios WHERE nombre = ? AND id != ?", [nombreHorario, idHorario], function (err, results) {
    if (err) {
      throw err;
    }

    // Si ya existe un horario con el mismo nombre (excluyendo el horario que estamos modificando), redirigir con un mensaje de error
    if (results.length > 0) {
      return res.redirect(
        "/personal/crearHorario?mensaje=Ya%20existe%20un%20horario%20con%20ese%20nombre"
      );
    }

    // Definir las horas de 7:00am a 2:00pm
    const horasDelDia = [
      "07:00 - 08:00",
      "08:00 - 09:00",
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "12:00 - 13:00",
      "13:00 - 14:00"
    ];

    // Iniciar el query para la actualización de los datos
    let sql = "UPDATE horarios SET nombre = ?, ";
    const values = [nombreHorario];

    // Construir la parte del query para actualizar las materias según la hora
    horasDelDia.forEach((hora, index) => {
      const elemento = parsedElementosHorario.find(el => el.hora === hora);
      if (elemento) {
        sql += `ID_MATERIA_${index + 1} = ?, `;
        values.push(elemento.id);
      } else {
        sql += `ID_MATERIA_${index + 1} = NULL, `;
      }
    });

    // Eliminar la última coma y espacio
    sql = sql.slice(0, -2);

    // Agregar la condición WHERE para actualizar el horario correcto
    sql += " WHERE id = ?";

    // Agregar el ID del horario al array de valores
    values.push(idHorario);

    // Ejecutar el query
    connection.beginTransaction(function (err) {
      if (err) {
        throw err;
      }

      connection.query(sql, values, function (error, results, fields) {
        if (error) {
          return connection.rollback(function () {
            throw error;
          });
        }

        // Commit si todo está bien
        connection.commit(function (err) {
          if (err) {
            return connection.rollback(function () {
              throw err;
            });
          }
          return res.redirect(
            "/personal/crearHorario?mensaje=Datos%20actualizados%20correctamente"
          );
        });
      });
    });
  });
});


// Sección de eliminarHorario
app.post("/eliminarHorario", function (req, res) {
  const [idHorario] = req.body.idHorario;
  console.log(req.body)

  // Verificar que el ID no esté vacío
  if (!idHorario) {
    return res.redirect(
      "/personal/crearHorario?mensaje=ID%20del%20horario%20vacío"
    );
  }

  // Iniciar el query para la eliminación del horario
  let sql = "DELETE FROM horarios WHERE id = ?";

  // Ejecutar el query
  connection.beginTransaction(function (err) {
    if (err) {
      throw err;
    }

    connection.query(sql, [idHorario], function (error, results, fields) {
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }

      // Commit si todo está bien
      connection.commit(function (err) {
        if (err) {
          return connection.rollback(function () {
            throw err;
          });
        }
        return res.redirect(
          "/personal/crearHorario?mensaje=Horario%20eliminado%20correctamente"
        );
      });
    });
  });
});



// Ruta para asignar un horario a un alumno
app.post('/personal/asignarHorario', function (req, res) {
  const ultimoElemento = req.body.nombreHorario;
  const nombreHorario = ultimoElemento[ultimoElemento.length - 1]; 
   const matricula  = req.body.matricula;
  console.log(req.body)

  // Verificar que se recibieron datos válidos
  if (!nombreHorario || !matricula) {
    return res.redirect("/personal/asignarHorario?mensaje=Matricula%20del%20alumno%20vacío%20o%20nombre%20del%20horario%20vacío");
  }

  // Realizar una consulta para contar cuántos alumnos tienen asignado el horario deseado
  connection.query('SELECT COUNT(*) AS total FROM asignacion_horario WHERE id_horario = (SELECT id FROM horarios WHERE nombre = ?)', [nombreHorario], function (error, results) {
    if (error) {
      console.error("Error al verificar la asignación de horario:", error);
      return res.redirect("/personal/asignarHorario?mensaje=Error%20al%20verificar%20la%20asignaci%C3%B3n%20de%20horario");
    }

    const totalAsignaciones = results[0].total;

    // Verificar si el número de asignaciones supera el límite de 30
    if (totalAsignaciones >= 30) {
      console.error("Se alcanzó el límite de asignaciones por plantilla");
      return res.redirect("/personal/asignarHorario?mensaje=No%20se%20permiten%20m%C3%A1s%20de%2030%20asignaciones%20por%20plantilla");
    }

    // Si no se supera el límite de 30 asignaciones, proceder con la asignación del horario
    // Verificar si la matrícula existe en la tabla alumnos
    connection.query('SELECT * FROM alumnos WHERE matricula = ?', [matricula], function (error, results) {
      if (error) {
        console.error("Error al verificar la matrícula del alumno:", error);
        return res.redirect("/personal/asignarHorario?mensaje=Error%20al%20verificar%20la%20matr%C3%ADcula%20del%20alumno");
      }

      if (results.length === 0) {
        // Si la matrícula no existe en la tabla alumnos, redirigir con mensaje
        return res.redirect("/personal/asignarHorario?mensaje=Matricula%20no%20existente");
      }

      // Verificar si el alumno ya tiene un horario asignado
      connection.query('SELECT * FROM asignacion_horario WHERE matricula_alumno = ?', [matricula], function (error, results) {
        if (error) {
          console.error("Error al verificar la asignación de horario:", error);
          return res.redirect("/personal/asignarHorario?mensaje=Error%20al%20verificar%20la%20asignaci%C3%B3n%20de%20horario");
        }

        // Si el alumno ya tiene un horario asignado, redirigir con un mensaje de error
        if (results.length > 0) {
          console.error("El alumno ya tiene un horario asignado");
          return res.redirect("/personal/asignarHorario?mensaje=El%20alumno%20ya%20tiene%20un%20horario%20asignado");
        }

        // Si el alumno no tiene un horario asignado y no se supera el límite de 30 asignaciones, proceder con la asignación del horario
        // Buscar el ID del horario en la base de datos
        connection.query('SELECT id FROM horarios WHERE nombre = ?', [nombreHorario], function (error, results) {
          if (error) {
            console.error("Error al buscar el ID del horario:", error);
            return res.redirect("/personal/asignarHorario?mensaje=Error%20interno%20del%20servidor");
          }

          if (results.length === 0) {
            console.error("No se encontró ningún horario con ese nombre");
            return res.redirect("/personal/asignarHorario?mensaje=No%20se%20encontr%C3%B3%20ning%C3%BAn%20horario%20con%20ese%20nombre");
          }

          const idHorario = results[0].id;

          // Guardar la asignación en la base de datos
          connection.query('INSERT INTO asignacion_horario (id_horario, matricula_alumno) VALUES (?, ?)', [idHorario, matricula], function (error) {
            if (error) {
              console.error("Error al guardar la asignación del horario:", error);
              return res.redirect("/personal/asignarHorario?mensaje=Error%20interno%20del%20servidor");
            }

            // Redirigir con un mensaje de éxito
            return res.redirect("/personal/asignarHorario?mensaje=Asignaci%C3%B3n%20del%20horario%20guardada%20correctamente");
          });
        });
      });
    });
  });
});


// Ruta para eliminar la asignación de horario de un alumno
app.post('/personal/eliminarAsignacion', function (req, res) {
  const ultimoElemento = req.body.nombreHorario;
  const nombreHorario = ultimoElemento[ultimoElemento.length - 1]; 
  const matricula  = req.body.matricula;
  console.log(req.body);
   
  // Verificar que se recibió la matrícula del alumno
  if (!matricula) {
    return res.redirect("/personal/asignarHorario?mensaje=Matricula%20del%20alumno%20vacía");
  }

  // Verificar si la matrícula existe en la tabla alumnos
  connection.query('SELECT * FROM alumnos WHERE matricula = ?', [matricula], function (error, results) {
    if (error) {
      console.error("Error al verificar la matrícula del alumno:", error);
      return res.redirect("/personal/asignarHorario?mensaje=Error%20al%20verificar%20la%20matr%C3%ADcula%20del%20alumno");
    }

    if (results.length === 0) {
      // Si la matrícula no existe en la tabla alumnos, redirigir con mensaje
      return res.redirect("/personal/asignarHorario?mensaje=La%20Matricula%20ingresada%20no%20existe");
    }

    // Verificar si existe una asignación de horario para el alumno y si el horario corresponde a la matrícula
    connection.query('SELECT * FROM asignacion_horario WHERE matricula_alumno = ? AND id_horario = (SELECT id FROM horarios WHERE nombre = ?)', [matricula, nombreHorario], function (error, results) {
      if (error) {
        console.error("Error al verificar la asignación de horario:", error);
        return res.redirect("/personal/asignarHorario?mensaje=Error%20interno%20del%20servidor");
      }

      // Si no se encuentra ninguna asignación de horario para el alumno o no coincide, redirigir con un mensaje de error
      if (results.length === 0) {
        console.error("No se encontró ninguna asignación de horario para el alumno con la matrícula proporcionada o el horario no corresponde a la matrícula");
        return res.redirect("/personal/asignarHorario?mensaje=Plantilla%20de%20horario%20no%20corresponde%20a%20la%20matrícula");
      }

      // Si se encuentra una asignación de horario para el alumno y coincide, proceder a eliminarla
      connection.query('DELETE FROM asignacion_horario WHERE matricula_alumno = ? AND id_horario = (SELECT id FROM horarios WHERE nombre = ?)', [matricula, nombreHorario], function (error, results) {
        if (error) {
          console.error("Error al eliminar la asignación de horario:", error);
          return res.redirect("/personal/asignarHorario?mensaje=Error%20interno%20del%20servidor");
        }

        // Redirigir con un mensaje de éxito
        return res.redirect("/personal/asignarHorario?mensaje=Asignación%20de%20horario%20eliminada%20correctamente");
      });
    });
  });
});


app.get("/personal/agregarAlumnos/tabla2", function (req, res) {
  const { nombreHorario } = req.query; // Obtener el nombre del horario de los parámetros de la consulta

  // Verificar que el nombre del horario fue proporcionado
  if (!nombreHorario) {
    return res.status(400).send("El nombre del horario es requerido");
  }

  // Realiza la consulta para obtener los alumnos que tienen asignado el horario especificado
  connection.query(`
    SELECT alumnos.nombre, alumnos.apellido_paterno, alumnos.apellido_materno, alumnos.matricula, horarios.nombre AS nombre_horario
    FROM asignacion_horario
    JOIN alumnos ON asignacion_horario.matricula_alumno = alumnos.matricula
    JOIN horarios ON asignacion_horario.id_horario = horarios.id
    WHERE horarios.nombre = ?;
    `, [nombreHorario],
    function (error, results, fields) {
      if (error) {
        console.error("Error en la consulta a la base de datos:", error);
        return res.status(500).send("Error en la consulta a la base de datos");
      }

      count = results.length
      // Construye la tabla HTML
      const tableHtml = buildTableHtml(results);

      // Envía la tabla HTML como respuesta al cliente
      res.status(200).json({ tableHtml, count });
    }
  );
});






app.get("/alumno/horario/tabla", function (req, res) {
  const matricula = req.query.matricula; // Obtener la matrícula del alumno desde la URL
  const periodo = req.query.periodo; // Obtener el período del alumno desde la URL

  console.log(matricula);
  if (!matricula || !periodo) {
    return res.redirect("/alumno/horario?mensaje=Ingrese%20la%20matrícula%20y%20el%20período%20del%20alumno");
  }

  // Consulta SQL para obtener el horario asociado a la matrícula del alumno y al período especificado
  let sqlQuery = `SELECT horarios.id AS ID_HORARIO, horarios.nombre AS NOMBRE_HORARIO, 
                  materias.ID AS ID_MATERIA, materias.NOMBRE AS NOMBRE_MATERIA, 
                  CONCAT(profesor.nombre, " ", profesor.apellido_paterno, " ", profesor.apellido_materno) AS NOMBRE_PROFESOR, 
                  materias.SEMESTRE, 
                  CASE 
                    WHEN HOUR(materias.HORA) = 7 THEN "07:00 - 08:00" 
                    WHEN HOUR(materias.HORA) = 8 THEN "08:00 - 09:00" 
                    WHEN HOUR(materias.HORA) = 9 THEN "09:00 - 10:00" 
                    WHEN HOUR(materias.HORA) = 10 THEN "10:00 - 11:00" 
                    WHEN HOUR(materias.HORA) = 11 THEN "11:00 - 12:00" 
                    WHEN HOUR(materias.HORA) = 12 THEN "12:00 - 13:00" 
                    WHEN HOUR(materias.HORA) = 13 THEN "13:00 - 14:00" 
                  END AS HORA, 
                  materias.DIA_SEMANA, materias.PERIODO, materias.SALON 
                FROM  horarios
                INNER JOIN materias ON horarios.id_materia_1 = materias.ID OR horarios.id_materia_2 = materias.ID 
                                   OR horarios.id_materia_3 = materias.ID OR horarios.id_materia_4 = materias.ID 
                                   OR horarios.id_materia_5 = materias.ID OR horarios.id_materia_6 = materias.ID 
                                   OR horarios.id_materia_7 = materias.ID 
                INNER JOIN profesor ON materias.ID_MAESTRO = profesor.id 
                INNER JOIN asignacion_horario ON asignacion_horario.id_horario = horarios.id
                WHERE asignacion_horario.matricula_alumno = ${matricula}
                AND materias.PERIODO = '${periodo}' 
                ORDER BY HOUR(materias.HORA) ASC`;

  // Realizar la consulta para obtener los detalles del horario asociado a la matrícula y al período proporcionado
  connection.query(sqlQuery, function (error, results, fields) {
    if (error) {
      console.error("Error en la consulta a la base de datos:", error);
      return res.status(500).send("Error en la consulta a la base de datos");
    }

    // Si se encontraron detalles del horario, enviar los resultados como JSON al cliente
    if (results.length > 0) {
      res.status(200).json(results);
    } else {
      // Si no se encontraron detalles del horario para el período proporcionado, enviar un mensaje de error
      res.status(200).json({ mensaje: "No se encontraron detalles de horario para el período proporcionado" });
    }
  });
});