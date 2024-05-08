function validateForm(action) {
    //alert(`Validando formulario para la acción: ${action}`);
  
    var nombre = document.getElementById("nombre").value;
    var apellidoPaterno = document.getElementById("apellidoPaterno").value;
    var apellidoMaterno = document.getElementById("apellidoMaterno").value;
    var matricula = document.getElementById("matricula").value;
    var contrasena = document.getElementById("contrasena").value;
    
    var genero = document.getElementById("genero").value;
    var Domicilio = document.getElementById("Domicilio").value;
    var Fecha_Nacimiento = document.getElementById("Fecha_Nacimiento").value;
    var semestre = document.getElementById("semestre").value;

    switch (action) {
      case "/insertarAlumnos":
        if (
          nombre === "" ||
          apellidoPaterno === "" ||
          apellidoMaterno === "" ||
          matricula === "" ||
          contrasena === "" ||
          genero === "" ||
          Domicilio === "" ||
          Fecha_Nacimiento === "" ||
          semestre === ""
        ) {
          alert(
            "Por favor, complete todos los campos antes de enviar el formulario."
          );
          return false;
        }
        document.getElementById("formularioAlumnos").action = action;
        document.getElementById("formularioAlumnos").submit();
        return true;
  
      case "/eliminarAlumnos":
        if (matricula === "") {
          alert("Ingrese una matricula antes de eliminar.");
          return false;
        }
        document.getElementById("formularioAlumnos").action = action;
        document.getElementById("formularioAlumnos").submit();
  
        return true; // Evitar envío automático del formulario
  
      case "/modificarAlumnos":
        
        document.getElementById("formularioAlumnos").action = action;
        document.getElementById("formularioAlumnos").submit();
        break;
  
      case "/buscarAlumnos":
        // Validar que la matricula no esté vacía
        if (matricula === "") {
          alert("Ingresa una matricula de alumno antes de continuar.");
          document.preventDefault();
        } else {
          clearLocalStorage();
          document.getElementById("formularioAlumnos").action = action;
          document.getElementById("formularioAlumnos").submit();
        }
        break;
    }
  }
  
  window.addEventListener("load", function () {
    const urlParams = new URLSearchParams(window.location.search);
  
    const nombre = urlParams.get("nombre") || "";
    const apellidoPaterno = urlParams.get("apellidoPaterno") || "";
    const apellidoMaterno = urlParams.get("apellidoMaterno") || "";
    const contrasena = urlParams.get("contrasena") || "";
    const matricula = urlParams.get("matricula") || "";
    const genero =  urlParams.get("genero") || "";
    const domicilio = urlParams.get("domicilio") || "";
    const fecha_Nacimiento = urlParams.get("fecha_Nacimiento") || "";
    const semestre = urlParams.get("semestre") || "";
  
    document.getElementById("nombre").value = nombre;
    document.getElementById("apellidoPaterno").value = apellidoPaterno;
    document.getElementById("apellidoMaterno").value = apellidoMaterno;
    document.getElementById("contrasena").value = contrasena;
    document.getElementById("matricula").value = matricula;

    document.getElementById("genero").value = genero;
    document.getElementById("Domicilio").value = domicilio;
    document.getElementById("Fecha_Nacimiento").value = fecha_Nacimiento;
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
    localStorage.removeItem("apellidoPaterno");
    localStorage.removeItem("apellidoMaterno");
    localStorage.removeItem("contrasena");

    localStorage.removeItem("genero");
    localStorage.removeItem("Domicilio");
    localStorage.removeItem("Fecha_Nacimiento");
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
  
    fetch("/personal/agregarAlumnos/tabla")
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
      const regex = /^(?!.*\s{3,})(?!^\s|\S\s{2})(?![A-Za-z]*\d)[A-Za-z\s]*$/;
      const inputValue = event.target.value;
      // Permitir borrar si la tecla presionada es backspace o delete
      if (event.key === 'Backspace' || event.key === 'Delete') {
          return;
      }
      // Si el primer carácter es un espacio, prevenir la acción
      if (inputValue.length === 0 && event.key === ' ') {
        event.preventDefault();
        return;
      }
      // Si se ingresa un número en cualquier parte de la cadena, prevenir la acción
      if (/\d/.test(event.key)) {
        event.preventDefault();
        return;
      }
      // Si se ingresa un número o un símbolo en cualquier parte de la cadena, prevenir la acción
      if (/[\d!@#$%^&*(),.?":{}|<>]/.test(event.key)) {
        event.preventDefault();
        return;
      }
      if (!regex.test(inputValue)) {
          event.preventDefault();
      }
  }
  
  
  
    if (fieldName === "apellidoPaterno") {
      const regex = /^(?!.*\s{3,})(?!^\s|\S\s{2})(?![A-Za-z]*\d)[A-Za-z\s]*$/;
      const inputValue = event.target.value;
      // Permitir borrar si la tecla presionada es backspace o delete
      if (event.key === 'Backspace' || event.key === 'Delete') {
          return;
      }
      // Si el primer carácter es un espacio, prevenir la acción
      if (inputValue.length === 0 && event.key === ' ') {
        event.preventDefault();
        return;
      }
      // Si se ingresa un número en cualquier parte de la cadena, prevenir la acción
      if (/\d/.test(event.key)) {
        event.preventDefault();
        return;
      }
      // Si se ingresa un número o un símbolo en cualquier parte de la cadena, prevenir la acción
      if (/[\d!@#$%^&*(),.?":{}|<>]/.test(event.key)) {
        event.preventDefault();
        return;
      }
      if (!regex.test(inputValue)) {
          event.preventDefault();
      }
    }
    if (fieldName === "apellidoMaterno") {
      const regex = /^(?!.*\s{3,})(?!^\s|\S\s{2})(?![A-Za-z]*\d)[A-Za-z\s]*$/;
      const inputValue = event.target.value;
      // Permitir borrar si la tecla presionada es backspace o delete
      if (event.key === 'Backspace' || event.key === 'Delete') {
          return;
      }
      // Si el primer carácter es un espacio, prevenir la acción
      if (inputValue.length === 0 && event.key === ' ') {
        event.preventDefault();
        return;
      }
      // Si se ingresa un número en cualquier parte de la cadena, prevenir la acción
      if (/\d/.test(event.key)) {
        event.preventDefault();
        return;
      }
      // Si se ingresa un número o un símbolo en cualquier parte de la cadena, prevenir la acción
      if (/[\d!@#$%^&*(),.?":{}|<>]/.test(event.key)) {
        event.preventDefault();
        return;
      }
      if (!regex.test(inputValue)) {
          event.preventDefault();
      }
    }
    if(fieldName === "Domicilio")
    {
      //const regex = /^(?!.*\s{3,})(?!^\s|\S\s{2})(?![A-Za-z]*\d)[A-Za-z0-9#][A-Za-z0-9#\s]*$/;

      const regex = /^(?!.*\s{3,})(?![A-Za-z]*\d)[A-Za-z0-9#\s]*$/;
      const inputValue = event.target.value;
      
      // Permitir borrar si la tecla presionada es backspace o delete
      if (event.key === 'Backspace' || event.key === 'Delete') {
          return;
      }
      
      // Si el primer carácter es un espacio, un número o el símbolo '#', prevenir la acción
        if (inputValue.length === 0 && (event.key === ' ' || /\d/.test(event.key) || event.key === '#')) {
          event.preventDefault();
          return;
        }


      
      // Si se ingresa un número o un símbolo en cualquier parte de la cadena, prevenir la acción
      if (/[^A-Za-z0-9#\s]/.test(event.key)) {
          event.preventDefault();
          return;
      }
      
      if (!regex.test(inputValue)) {
          event.preventDefault();
      }
      
    }
  }
  
  
  function validateMatricula(event) {
    const maxDigits = 7;
    let inputValue = event.target.value;

    // Eliminar caracteres que no sean números
    inputValue = inputValue.replace(/\D/g, '');

    // Limitar la longitud a 7
    inputValue = inputValue.slice(0, maxDigits);

    // Actualizar el valor del campo
    event.target.value = inputValue;
}


  
  function validateContrasena(event) {
    const maxChars = 12;
    const inputValue = event.target.value;
  
    if (/\s/.test(inputValue)) {
      //alert('La contraseña no puede contener espacios.');
      event.target.value = inputValue.replace(/\s/g, ""); // Eliminar espacios
    }
  
    if (inputValue.length > maxChars) {
      event.target.value = inputValue.slice(0, maxChars); // Limitar la longitud
    }
  }
  
  function cancelarFormulario() {
    // Obtener todos los campos del formulario
    const camposFormulario = document.querySelectorAll("#formularioAlumnos input, #formularioAlumnos select");

    // Limpiar el valor de cada campo
    camposFormulario.forEach(function (campo) {
        if (campo.tagName === "SELECT") {
            campo.selectedIndex = 0; // Establecer el índice seleccionado en 0 para el campo select
        } else {
            campo.value = ""; // Limpiar el valor del campo de entrada
        }
    });
}

  