
  let botonSeleccionado = null;
function setBotonSeleccionado(boton) {
  botonSeleccionado = boton;
}
function validateForm() {
  if (!botonSeleccionado) {
    alert("Selecciona un tipo de usuario");
    return false;
  }
  return true;
  
}
  