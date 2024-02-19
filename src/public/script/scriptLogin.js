  document.getElementById('matricula').addEventListener('input', function(event) {
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
function validateForm() {
  if (!botonSeleccionado) {
    alert("Selecciona un tipo de usuario");
    return false;
  }
  return true;
}
  