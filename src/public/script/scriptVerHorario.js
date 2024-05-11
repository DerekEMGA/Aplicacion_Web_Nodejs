const nombre_Horario = '';
const semestre = 0;

window.addEventListener("load", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const matricula = urlParams.get("matricula") || "";

  // Obtener la matrícula guardada de localStorage
  const matriculaGuardada = localStorage.getItem("matricula");

  // Verificar si la matrícula recibida es diferente a la matrícula guardada
  if (matricula && matricula !== matriculaGuardada) {
      // Guardar la nueva matrícula en localStorage
      localStorage.setItem("matricula", matricula);
  }

  // Asignar la matrícula al contenido del elemento HTML
  //alert(matriculaGuardada)
  const periodo = obtenerPeriodo();


  fetch(`/alumno/horario/tabla?matricula=${matriculaGuardada}&periodo=${periodo}`)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Error al obtener la tabla");
    }
    return response.json(); // Parsear la respuesta como JSON
  })
  .then((data) => {
    const tabla = document.getElementById('tabla');

    // Limpiar la tabla antes de agregar nuevas filas
    tabla.innerHTML = '';

    // Crear una fila para el encabezado
    const headerRow = document.createElement('tr');

    // Agregar las celdas de encabezado
    headerRow.innerHTML = `
      <th>Materia</th>
      <th>Profesor</th>
      <th>Día</th>
      <th>Hora</th>
      <th>Periodo</th>
      <th>Salón</th>
    `;

    // Agregar el encabezado a la tabla
    tabla.appendChild(headerRow);

    // Inicializar las variables nombre_Horario y semestre
    let nombre_Horario = '';
    let semestre = '';

    // Iterar sobre los datos y agregar cada fila a la tabla
    if (data.length === 0) {
        // Si no hay datos, mostrar el mensaje de tabla vacía
        document.getElementById('mensajeTablaVacia').style.display = 'block';
    } else {
        // Si hay datos, construir las filas de la tabla
        data.forEach((item, index) => {
            const row = document.createElement('tr');
            console.log("Iteración", index + 1, ":", item);

            // Agregar cada celda a la fila
            row.innerHTML = `
                <td>${item.NOMBRE_MATERIA}</td>
                <td>${item.NOMBRE_PROFESOR}</td>
                <td>${item.DIA_SEMANA}</td>
                <td>${item.HORA}</td>
                <td>${item.PERIODO}</td>
                <td>${item.SALON}</td>
            `;

            // Asignar valores a las variables nombre_Horario y semestre en la primera iteración
            if (index === 0) {
                nombre_Horario = item.NOMBRE_HORARIO;
                semestre = item.SEMESTRE;
            }

            // Agregar la fila a la tabla
            tabla.appendChild(row);
        });

        // Ahora las variables nombre_Horario y semestre están disponibles fuera del bucle forEach
        console.log("Nombre del Horario:", nombre_Horario);
        console.log("Semestre:", semestre);

        // Asignar el contenido a los elementos HTML
        document.getElementById("nombre_Horario").textContent = nombre_Horario;
        document.getElementById("semestre").textContent = semestre;
    }
  })
  .catch((error) => {
    console.error("Error al obtener la tabla:", error);
    document.getElementById('mensajeTablaVacia').style.display = 'block';
document.getElementById('tabla').style.display = 'none';

  });

  document.getElementById("matriculaMostrada").textContent = matriculaGuardada || matricula;
  document.getElementById("periodo").textContent = periodo;

});



const mensaje = obtenerParametroConsulta("mensaje");
if (mensaje) {
    alert(mensaje);
}

function obtenerParametroConsulta(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
}

function obtenerPeriodo() {
  // Obtener la fecha actual del sistema
  const fechaActual = new Date();

  // Obtener el año actual
  const añoActual = fechaActual.getFullYear();

  // Obtener el mes actual (los meses en JavaScript van de 0 a 11)
  const mesActual = fechaActual.getMonth();

  // Determinar el período basado en el mes actual
  let periodo;
  if (mesActual >= 0 && mesActual <= 5) { // Si el mes es de enero a junio (0 a 5)
      periodo = `Enero-Junio-${añoActual}`;
  } else { // Si el mes es de agosto a diciembre (6 a 11)
      periodo = `Agosto-Diciembre-${añoActual}`;
  }

  // Retornar el período calculado
  return periodo;
}