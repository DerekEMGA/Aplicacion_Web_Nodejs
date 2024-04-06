const horario = document.getElementById('horario')

Sortable.create(materias,
    {
        group:"materias",
        animation: 600
        })

Sortable.create(tabla)


  

document.addEventListener("DOMContentLoaded", function() {
    const filtroSemestreInput = document.getElementById("filtroSemestre");
    const aplicarFiltrosBtn = document.getElementById("aplicarFiltrosBtn");
    const horarioContainer = document.getElementById("materias"); // Contenedor de horario
    
    aplicarFiltrosBtn.addEventListener("click", function() {
      const filtroSemestre = filtroSemestreInput.value.trim();
    
      fetch(`/personal/crearHorario/tabla?filtroSemestre=${filtroSemestre}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error al obtener los datos");
          }
          return response.json();
        })
        .then((data) => {
          // Limpiar el contenedor antes de agregar nuevos elementos
          horarioContainer.innerHTML = '';
          
          // Crear elementos de lista para cada elemento en los datos
          data.forEach((item) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.NOMBRE_MATERIA} - ${item.NOMBRE_PROFESOR} - ${item.SEMESTRE} - ${item.HORA} - ${item.DIA_SEMANA}`;
            horarioContainer.appendChild(listItem);
          });
        })
        .catch((error) => {
          console.error("Error al obtener los datos:", error);
          // Mostrar un mensaje de error al usuario
        });
    });
  });
  

  const mensaje = obtenerParametroConsulta("mensaje");
  if (mensaje) {
      alert(mensaje);
  }

  function obtenerParametroConsulta(nombre) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(nombre);
  }