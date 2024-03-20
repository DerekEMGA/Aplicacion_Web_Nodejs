function validateForm(action) {
    //alert(`Validando formulario para la acción: ${action}`);
  
    var nombre = document.getElementById("nombre").value;
    var docente = document.getElementById("docente").value;
    var hora = document.getElementById("hora").value;
    var dias = document.getElementById("dias").value;
    var semestre = document.getElementById("semestre").value;
    
    //alert("Nombre: " + nombre);
    //alert("Docente: " + docente);
    //alert("Hora: " + hora);
    //alert("Días: " + dias);
    //alert("Semestre: " + semestre);
    
        
    switch (action) {
      case "/insertarMateria":
        if (
          nombre === "" ||
          docente === "" ||
          hora === "" ||
          dias === "" ||
          semestre === "" 
        ) {
          alert(
            "Por favor, complete todos los campos antes de enviar el formulario."
          );
          return false;
        }

        document.getElementById("formularioMateria").action = action;
        document.getElementById("formularioMateria").submit();
        return true;
  
      case "/eliminarMateria":

        if (docente === "" || hora === "") {
          alert("Ingrese un nombre y hora de la materia antes de eliminar.");
          return false;
        }
        document.getElementById("formularioMateria").action = action;
        document.getElementById("formularioMateria").submit();
  
        return true; // Evitar envío automático del formulario
  
      case "/modificarMateria":
        document.getElementById("formularioMateria").action = action;
        document.getElementById("formularioMateria").submit();
        break;
  
      case "/buscarMateria":
        // Validar que la clave no esté vacía
        if (docente === "" || hora === "") {
          alert("Ingrese un nombre y hora de la materia antes de buscar");
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
  
    document.getElementById("nombre").value = nombre;
    document.getElementById("hora").value = hora;
    document.getElementById("dias").value = dias;
    document.getElementById("docente").value = docente;
    document.getElementById("semestre").value = semestre;
  
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
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    console.log("Script ejecutado en la carga de la página."); // Registro para verificar la ejecución
    const serverMessage = obtenerParametroConsulta("mensaje");
  
    if (serverMessage && !sessionStorage.getItem("messageShown")) {
      console.log("Mensaje recibido:", serverMessage); // Registro para verificar el mensaje recibido
      alert(serverMessage);
      sessionStorage.setItem("messageShown", "true");
    }
  
    fetch("/personal/agregarMateria/tabla")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener la tabla");
        }
        return response.text();
      })
      .then((html) => {
        // Inserta la tabla HTML en el contenedor
        document.getElementById("tabla").innerHTML = html;
      })
      .catch((error) => {
        console.error("Error al obtener la tabla:", error);
        // Puedes mostrar un mensaje al usuario indicando el error
      });
  });
  

  fetch('/profesores')
      .then(response => response.json())
      .then(profesores => {
        const select = document.getElementById('docente');
        profesores.forEach(profesor => {
          const option = document.createElement('option');
          option.value = profesor.id; // Asigna el ID como valor
          option.textContent = profesor.nombre + " " + profesor.apellido_paterno + " " + profesor.apellido_materno; // Muestra el nombre del profesor
          select.appendChild(option);
        });
      })
      .catch(error => console.error('Error al obtener los profesores:', error));

  function obtenerParametroConsulta(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
  }
  
  const mensaje = obtenerParametroConsulta("mensaje");
  if (mensaje) {
    alert(mensaje);
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
  