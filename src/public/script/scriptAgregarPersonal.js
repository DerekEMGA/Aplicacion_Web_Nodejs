
function validateForm(action) {
    var nombre = document.getElementById("nombre").value;
    var apellidoPaterno = document.getElementById("apellidoPaterno").value;
    var apellidoMaterno = document.getElementById("apellidoMaterno").value;
    var antiguedad = document.getElementById("antiguedad").value;
    var clave = document.getElementById("clave").value;
    
    // Check if any of the required fields is empty
    if (nombre === "" || apellidoPaterno === "" || apellidoMaterno === "" || antiguedad === "" || clave === "") {
        alert("Por favor, complete todos los campos antes de enviar el formulario.");
        return false; // Don't submit the form if validation fails
    }
    // If validation passes, set the form action and submit
    document.getElementById("formularioPersonal").action = action;
    document.getElementById("formularioPersonal").submit();
    return true;
}


document.addEventListener('DOMContentLoaded', function() {
    // Extract the message from the server response
    const serverMessage = {"message":"Registro insertado correctamente"};

    // Check if the server message exists and hasn't been shown before
    if (serverMessage && !sessionStorage.getItem('messageShown')) {
        // Display an alert with the server message
        alert(serverMessage);

        // Set a flag in sessionStorage to avoid repeated alerts
        sessionStorage.setItem('messageShown', 'true');
    }
});


fetch('/validar')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Assuming the server response structure includes 'status' and 'message'
    if (data.status === 'success') {
      alert(data.message);
    } else {
      console.error('Server returned an error:', data.message);
    }
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });



  function obtenerParametroConsulta(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
}

// Verificar si hay un parámetro 'mensaje' en la URL
const mensaje = obtenerParametroConsulta('mensaje');
if (mensaje) {
    alert(mensaje);
}