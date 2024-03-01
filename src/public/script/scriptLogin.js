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

