let botonSeleccionado = null;

function setBotonSeleccionado(boton) {
  botonSeleccionado = boton;
}

function validateForm() {
  if (!botonSeleccionado) {
    // Mostrar cuadro de diálogo personalizado
    document.getElementById("overlay").style.display = "block";
    document.getElementById("customAlert").style.display = "block";
    return false;
  }
  return true;

  
}

function closeAlert() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("customAlert").style.display = "none";
}


document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login').addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matricula: document.getElementById('matricula').value,
          contrasena: document.getElementById('contrasena').value,
          tipo: document.getElementById('tipo').value,
        }),
      });

      if (!response.ok) {
        console.error('Error en la solicitud:', response.status, response.statusText);
        throw new Error('Error en la solicitud');
      }

      const data = await response.json();

      // Manejar la respuesta exitosa
      console.log(data.message);
    } catch (error) {
      console.error('Error en el manejo de la respuesta:', error);

      // Mostrar el mensaje de error
      showErrorMessage();
    }
  });
});

// Función para mostrar el mensaje de error
function showErrorMessage() {
  const errorMessageDiv = document.createElement('div');
  errorMessageDiv.textContent = 'Error en el inicio de sesión. Por favor, inténtelo de nuevo más tarde.';
  errorMessageDiv.style.position = 'fixed';
  errorMessageDiv.style.top = '50%';
  errorMessageDiv.style.left = '50%';
  errorMessageDiv.style.transform = 'translate(-50%, -50%)';
  errorMessageDiv.style.backgroundColor = 'red';
  errorMessageDiv.style.color = 'white';
  errorMessageDiv.style.padding = '10px';
  errorMessageDiv.style.textAlign = 'center';
  errorMessageDiv.style.zIndex = '1000';

  document.body.appendChild(errorMessageDiv);

  setTimeout(() => {
    errorMessageDiv.remove();
  }, 3000);
}
