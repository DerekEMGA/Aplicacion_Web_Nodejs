let botonSeleccionado = null;


function setBotonSeleccionado(boton) {
  botonSeleccionado = boton;
}




document.getElementById('login').addEventListener('submit', async function(event) {
  event.preventDefault(); // Evita la acción predeterminada del formulario

  // Obtener los datos del formulario
  var formData = new FormData(this);
  const matricula = formData.get('matricula');
  const contrasena = formData.get('contrasena');
  const tipo = formData.get('tipo');

  try {
    console.log('servicio fetch')

    // Realizar la solicitud POST al servidor con el cuerpo del formulario
    const response = await fetch('/', {
      method: 'POST',
      body: JSON.stringify({ matricula, contrasena, tipo }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || 'Error en el servidor';
      throw new Error(`Código de estado: ${response.status}, Mensaje: ${errorMessage}`);
    }
    
    console.log('response')
    // Espera a que se resuelva la promesa de response.text()
    const redirectTo = await response.text();
    console.log(redirectTo)

    // Verifica si la respuesta indica una redirección
    if (redirectTo) {
      window.location.href = redirectTo;
    } else {
      // Procesa la respuesta de otra manera si es necesario
      const responseData = await response.json();
      console.log(responseData);
    }
   
  } catch (error) {
    if (!botonSeleccionado) {
      // Mostrar cuadro de diálogo personalizado
      document.getElementById("overlay").style.display = "block";
      document.getElementById("customAlert").style.display = "block";
      return false;
    }
    // Manejar errores y mostrar la alerta al usuario sin redirigir
    console.error('Error en la solicitud:', error.message);
    alert(`Usuario y/o contraseña incorrectos `);
    return true
  }
})


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

