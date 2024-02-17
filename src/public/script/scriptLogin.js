  document.getElementById('usuario').addEventListener('input', function(event) {
    // Obtener el valor actual del campo de usuario
    var input = event.target.value;
    // Reemplazar cualquier caracter que no sea un número con una cadena vacía
    event.target.value = input.replace(/[^0-9]/g, '');
  });
  

  let botonSeleccionado = null;

function setBotonSeleccionado(boton) {
  botonSeleccionado = boton;
  console.log("Botón seleccionado:", botonSeleccionado);
}

async function validarLogin() {
    const usuario = document.getElementById('usuario').value;
    const contrasena = document.getElementById('contrasena').value;
    const tipoUsuario = botonSeleccionado;
  
    console.log('Datos a enviar al servidor:', { usuario, contrasena, tipoUsuario });
  
    try {
      const respuesta = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, contrasena, tipoUsuario }),
      });
  
      const resultado = await respuesta.json();
  
      console.log('Respuesta del servidor:', resultado);
  
      if (resultado.autenticado) {
        // ... (resto del código para redirigir según el tipo de usuario)
      } else {
        // ... (resto del código en caso de inicio de sesión fallido)
      }
    } catch (error) {
      console.error('Error al enviar la solicitud al servidor:', error);
    }
  
    return false; // Evita que el formulario se envíe normalmente
  }
  