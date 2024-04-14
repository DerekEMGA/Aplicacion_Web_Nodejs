function validateForm(action) {
    //alert(`Validando formulario para la acción: ${action}`);
  
    var nombre = document.getElementById("nombre").value;
    var apellidoPaterno = document.getElementById("apellidoPaterno").value;
    var apellidoMaterno = document.getElementById("apellidoMaterno").value;
    var profesion = document.getElementById("profesion").value;
    var clave = document.getElementById("clave").value;
    var contrasena = document.getElementById("contrasena").value;
  
    switch (action) {
      case "/insertarProfesor":
        if (
          nombre === "" ||
          apellidoPaterno === "" ||
          apellidoMaterno === "" ||
          profesion === "" ||
          clave === "" ||
          contrasena === ""
        ) {
          alert(
            "Por favor, complete todos los campos antes de enviar el formulario."
          );
          return false;
        }
        document.getElementById("formularioDocente").action = action;
        document.getElementById("formularioDocente").submit();
        return true;
  
      case "/eliminarProfesor":
        if (clave === "") {
          alert("Ingrese una clave antes de eliminar.");
          return false;
        }
        document.getElementById("formularioDocente").action = action;
        document.getElementById("formularioDocente").submit();
  
        return true; // Evitar envío automático del formulario
  
      case "/modificarProfesor":
        document.getElementById("formularioDocente").action = action;
        document.getElementById("formularioDocente").submit();
        break;
  
      case "/buscarProfesor":
        // Validar que la clave no esté vacía
        if (clave === "") {
          alert("Ingrese un numero de empleado antes de continuar.");
          document.preventDefault();
        } else {
          clearLocalStorage();
          document.getElementById("formularioDocente").action = action;
          document.getElementById("formularioDocente").submit();
        }
        break;
    }
  }
  
  window.addEventListener("load", function () {
    const urlParams = new URLSearchParams(window.location.search);
  
    const nombre = urlParams.get("nombre") || "";
    const apellidoPaterno = urlParams.get("apellidoPaterno") || "";
    const apellidoMaterno = urlParams.get("apellidoMaterno") || "";
    const profesion = urlParams.get("profesion") || "";
    const contrasena = urlParams.get("contrasena") || "";
    const clave = urlParams.get("clave") || "";
  
    document.getElementById("nombre").value = nombre;
    document.getElementById("apellidoPaterno").value = apellidoPaterno;
    document.getElementById("apellidoMaterno").value = apellidoMaterno;
    document.getElementById("profesion").value = profesion;
    document.getElementById("contrasena").value = contrasena;
    document.getElementById("clave").value = clave;
  
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
    localStorage.removeItem("profesion");
    localStorage.removeItem("contrasena");
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    console.log("Script ejecutado en la carga de la página."); // Registro para verificar la ejecución
    const serverMessage = obtenerParametroConsulta("mensaje");
  
    if (serverMessage && !sessionStorage.getItem("messageShown")) {
      console.log("Mensaje recibido:", serverMessage); // Registro para verificar el mensaje recibido
      alert(serverMessage);
      sessionStorage.setItem("messageShown", "true");
    }
  
    fetch("/personal/agregarDocente/tabla")
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
      const regex = /^[A-Za-z\s]+$/;
      const inputValue = event.key;
  
      if (inputValue === "'" || inputValue === "´" || inputValue === " ´´" || inputValue === "`" || !regex.test(inputValue)) {
        event.preventDefault();
      }
    }
    if (fieldName === "apellidoPaterno") {
      const regex = /^[A-Za-z\s]+$/;
      const inputValue = event.key;
  
      if (inputValue === "'" || inputValue === "´" || inputValue === "`" || !regex.test(inputValue)) {
        event.preventDefault();
      }
    }
    if (fieldName === "apellidoMaterno") {
      const regex = /^[A-Za-z\s]+$/;
      const inputValue = event.key;
  
      if (inputValue === "'" || inputValue === "´" || inputValue === "`" || !regex.test(inputValue)) {
        event.preventDefault();
      }
    }
    if (fieldName === "profesion") {
        const regex = /^[A-Za-z\s]+$/;
        const inputValue = event.key;
    
          if (inputValue === "'" || inputValue === "´" || inputValue === "`" || !regex.test(inputValue)) {
    event.preventDefault();
  }
    

      }
  }
  
  
  function validateNumeroEmpleado(event) {
    const maxDigits = 7;
    let inputValue = event.target.value;
  
    // Asegurarse de que la primera letra sea 'E' (mayúscula) y eliminar cualquier otra letra
    inputValue = inputValue.replace(/[^E\d]/g, "");
  
    // Si no comienza con 'E', agrega 'E' al principio
    if (!/^E/.test(inputValue)) {
      inputValue = "E" + inputValue.substr(1);
    }
  
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
    const camposFormulario = document.querySelectorAll(
      "#formularioDocente input"
    );
  
    // Limpiar el valor de cada campo
    camposFormulario.forEach(function (campo) {
      campo.value = "";
    });
  }
  