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

// Aquí se insertan los registros en la tabla personal y usuario
app.post("/insertar", function (req, res) {
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

  // Check if any field is empty
  if (
    !nombre ||
    !apellidoPaterno ||
    !apellidoMaterno ||
    !profesion ||
    !clave ||
    !contrasena
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
            "/personal/agregarDocente?mensaje=Profesor%20no%20encontrado"
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
                "/personal/agregarDocente?mensaje=El%20profesor%20tiene%20materias%20asignadas%20y%20no%20se%20puede%20eliminar"
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

  if (!nombre || !docente || !hora || !diaSemana || !semestre || !salon || !periodo) {
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

  // Check if any field is empty
  if (!nombre || !idMaestro || !hora || !diaSemana || !semestre || !salon || ! periodo) {
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
    sqlQuery += ' LIMIT 7';
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
  
    // Formatear la fecha de nacimiento al formato deseado (año-mes-día)
    let fechaFormateada = `${fechaNacimientoObj.getFullYear()}-${(
      fechaNacimientoObj.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${fechaNacimientoObj
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  
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

// Verificar si Fecha_Nacimiento es una fecha válida
if (Fecha_Nacimiento && !isNaN(Date.parse(Fecha_Nacimiento))) {
  // Crear un objeto Date con la fecha de nacimiento
  let fechaFormateada = new Date(Fecha_Nacimiento).toISOString().split("T")[0];
  console.log("Fecha formateada:", fechaFormateada);
} else {
  console.error("La fecha de nacimiento no es válida.");
}

    console.log(nombre)
    console.log(apellidoPaterno)
    console.log(apellidoMaterno)
    console.log(matricula)

    if (
        !nombre ||
        !apellidoPaterno ||
        !apellidoMaterno ||
        !genero ||
        !Domicilio ||
        !Fecha_Nacimiento ||
        !semestre ||
        !contrasena
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

  let sqlQuery = 'SELECT materias.NOMBRE AS NOMBRE_MATERIA, CONCAT(profesor.nombre, " ", profesor.apellido_paterno, " ", profesor.apellido_materno) AS NOMBRE_PROFESOR, materias.SEMESTRE, CASE WHEN HOUR(materias.HORA) = 7 THEN "07:00 - 08:00" WHEN HOUR(materias.HORA) = 8 THEN "08:00 - 09:00" WHEN HOUR(materias.HORA) = 9 THEN "09:00 - 10:00" WHEN HOUR(materias.HORA) = 10 THEN "10:00 - 11:00" WHEN HOUR(materias.HORA) = 11 THEN "11:00 - 12:00" WHEN HOUR(materias.HORA) = 12 THEN "12:00 - 13:00" WHEN HOUR(materias.HORA) = 13 THEN "13:00 - 14:00" END AS HORA, materias.DIA_SEMANA, materias.PERIODO, materias.SALON FROM materias INNER JOIN profesor ON materias.ID_MAESTRO = profesor.id';

  if (filtroSemestre) {
    // Si hay filtros, agregar condiciones WHERE a la consulta SQL
    sqlQuery += " WHERE ";
    sqlQuery += `materias.SEMESTRE = '${filtroSemestre}'`;
  }
  
  // Ordenar los resultados por hora descendente
  sqlQuery += ' ORDER BY HOUR(materias.HORA) ASC';

  // Si los filtros están vacíos, establecer el límite en 7, de lo contrario, no hay límite
  if (!(filtroSemestre)) {
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
