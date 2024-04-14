function validateForm(action) {
  //alert(`Validando formulario para la acción: ${action}`);

  
    var nombre = document.getElementById("nombre").value;
    var docente = document.getElementById("docente").value;
    var hora = document.getElementById("hora").value;
    var dias = document.getElementById("dias").value;
    var semestre = document.getElementById("semestre").value;
    var salon = document.getElementById("salon").value;
    var periodo = document.getElementById("periodo").value;

    //alert("Nombre: " + nombre);
    //alert("Docente: " + docente);
    //alert("Hora: " + hora);
    //alert("Días: " + dias);
    //alert("Semestre: " + semestre);

        
    switch (action) {
      case "/insertarMateria":
       

        document.getElementById("formularioMateria").action = action;
        document.getElementById("formularioMateria").submit();
       return true;
  
      case "/eliminarMateria":

        if (docente === "" || hora === "") {
          alert("Ingrese un nombre de profesor y hora de la materia antes de buscar");
          return false;
        }
        document.getElementById("formularioMateria").action = action;
        document.getElementById("formularioMateria").submit();
  
        return true; // Evitar envío automático del formulario
  
      case "/modificarMateria":
        document.getElementById("formularioMateria").action = action
        document.getElementById("formularioMateria").submit()
        break;
  
      case "/buscarMateria":
        // Validar que la clave no esté vacía
        if (docente === "" || hora === "" || periodo === "") {
          alert("Ingrese un nombre de profesor , hora y periodo de la materia antes de buscar");
          document.preventDefault();
        } else {
          clearLocalStorage();
          document.getElementById("formularioMateria").action = action;
          document.getElementById("formularioMateria").submit();
        }
        break;
    }
  }
  
  window.addEventListener("load", function () {
    const urlParams = new URLSearchParams(window.location.search);
  
    const nombre = urlParams.get("nombre") || "";
    const hora = urlParams.get("hora") || "";
    const dias = urlParams.get("diaSemana") || "";
    const docente = urlParams.get("idMaestro") || "";
    const semestre = urlParams.get("semestre") || "";
    const salon = urlParams.get("salon") || "";
    const periodo = urlParams.get("periodo") || "";
    const year = new Date().getFullYear();

    console.log(periodo)

    document.getElementById("nombre").value = nombre;
    document.getElementById("hora").value = hora;
    document.getElementById("dias").value = dias;
    document.getElementById("docente").value = docente;
    document.getElementById("semestre").value = semestre;
    document.getElementById("salon").value=salon;
    
    document.querySelectorAll('.year').forEach(function(select) {
      // Obtener todas las opciones dentro del select
      const options = select.querySelectorAll('option');
    
      // Iterar sobre cada opción y agregar el año al valor
      options.forEach(function(option) {
          option.value += year;
          option.innerText += ` ${year}`;
    
      });
    
    });
    
    document.getElementById("periodo").value=periodo;

// Insertar el año actual en los elementos relevantes


    const id_maestro = urlParams.get("idMaestro") || ""
    const hora_antigua1 = urlParams.get("hora") || ""
    document.getElementById("docente_antiguo").value = id_maestro;
    document.getElementById("hora_antigua").value = hora_antigua1;


  
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname + window.location.hash
    );
  });
  
  // Function to clear local storage
  function clearLocalStorage() {
    localStorage.removeItem("nombre");
    localStorage.removeItem("docente");
    localStorage.removeItem("hora");
    localStorage.removeItem("dias");
    localStorage.removeItem("semestre");
    localStorage.removeItem("salon");
    localStorage.removeItem("periodo");
    }

document.addEventListener("DOMContentLoaded", function() {
  // Obtener referencia a los elementos del DOM
  const filtroNombreMateriaInput = document.getElementById("filtroNombreMateria");
  const filtroIdMaestroInput = document.getElementById("filtroIdMaestro");
  const filtroPeriodoInput = document.getElementById("filtroPeriodo")
  const aplicarFiltrosBtn = document.getElementById("aplicarFiltrosBtn");
  const tablaContainer = document.getElementById("tabla");

  // Manejar el evento de clic en el botón de aplicar filtros
  aplicarFiltrosBtn.addEventListener("click", function() {
    // Obtener los valores de los filtros
    const filtroNombreMateria = filtroNombreMateriaInput.value.trim();
    const filtroIdMaestro = filtroIdMaestroInput.value.trim();
    const filtroPeriodo = filtroPeriodoInput.value.trim();
    // Realizar una solicitud al servidor con los filtros
    fetch(`/personal/agregarMateria/tabla?filtroNombreMateria=${filtroNombreMateria}&filtroIdMaestro=${filtroIdMaestro}&filtroPeriodo=${filtroPeriodo}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener la tabla");
        }
        return response.text();
      })
      .then((html) => {
        // Insertar la tabla HTML en el contenedor
        tablaContainer.innerHTML = html;
      })
      .catch((error) => {
        console.error("Error al obtener la tabla:", error);
        // Mostrar un mensaje de error al usuario
      });
  });
});

fetch('/profesores')
  .then(response => response.json())
  .then(profesores => {
    const selectDocente = document.getElementById('docente');
    const selectFiltro = document.getElementById('filtroIdMaestro');

    // Agregar las opciones de los profesores al primer select
    profesores.forEach(profesor => {
      const optionDocente = document.createElement('option');
      optionDocente.value = profesor.id;
      optionDocente.textContent = profesor.nombre + " " + profesor.apellido_paterno + " " + profesor.apellido_materno;
      selectDocente.appendChild(optionDocente);
    });

    // Agregar la opción en blanco solo al segundo select (filtroIdMaestro)
    const optionBlanco = document.createElement('option');
    optionBlanco.value = '';
    optionBlanco.textContent = ""; // Deja el texto en blanco
    selectFiltro.appendChild(optionBlanco);

    // Agregar las opciones de los profesores al segundo select (filtroIdMaestro)
    profesores.forEach(profesor => {
      const optionFiltro = document.createElement('option');
      optionFiltro.value = profesor.id;
      optionFiltro.textContent = profesor.nombre + " " + profesor.apellido_paterno + " " + profesor.apellido_materno;
      selectFiltro.appendChild(optionFiltro);
    });
  })
  .catch(error => console.error('Error al obtener los profesores:', error));

  const mensaje = obtenerParametroConsulta("mensaje");
  if (mensaje) {
      alert(mensaje);
  }

  function obtenerParametroConsulta(nombre) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(nombre);
  }

  
  function validateInput(event) {
    const fieldName = event.target.name;
  
   if (fieldName === "nombre") {
  const regex = /^[A-Za-z0-9\s]+$/;
  const inputValue = event.key;

  // Excluir los símbolos ', ´, y `
  if (inputValue === "'" || inputValue === "´" || inputValue === "`" || !regex.test(inputValue)) {
    event.preventDefault();
  }
}

    
  }

  function cancelarFormulario() {
    // Obtener todos los campos del formulario (input y select)
    const camposFormulario = document.querySelectorAll("#formularioMateria input, #formularioMateria select");
  
    // Limpiar el valor de cada campo
    camposFormulario.forEach(function (campo) {
      if (campo.tagName === "INPUT") {
        // Limpiar campos de entrada
        campo.value = "";
      } else if (campo.tagName === "SELECT") {
        // Limpiar select
        campo.value = ""; // Establecer el valor del select en una cadena vacía
      }
    });
  }
  