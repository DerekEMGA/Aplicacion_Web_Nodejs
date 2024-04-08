document.addEventListener("DOMContentLoaded", function() {
  const horarioContainer = document.getElementById("horario");

  Sortable.create(horarioContainer, {
    group: {
      name: "materias",
      pull: false
    },
    animation: 600,
    chosenClass: "active",
   
  });

  const materiasContainer = document.getElementById("materias");

  Sortable.create(materiasContainer, {
    group: {
      name: "materias",
      pull: "clone",
      put: false
    },
    animation: 600,
    chosenClass: "active"
  });

  const filtroSemestreInput = document.getElementById("filtroSemestre");
  const aplicarFiltrosBtn = document.getElementById("aplicarFiltrosBtn");

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
        materiasContainer.innerHTML = '';

        // Crear elementos de lista para cada elemento en los datos
        data.forEach((item) => {
          const listItem = document.createElement('div');
          listItem.classList.add('list-group-item'); // Agrega la clase 'list-group-item' al div creado
          listItem.innerHTML = `
            <p class="mb-0" style="color:blue;">${item.HORA}</p>
            <p class="mb-0">Materia: ${item.NOMBRE_MATERIA}</p>
            <p class="mb-0">Docente: ${item.NOMBRE_PROFESOR}</p>
            <p class="mb-0">Semestre:${item.SEMESTRE}</p>
            <p class="mb-0">${item.DIA_SEMANA}</p>
          `;

          // Agregar evento de clic para clonar elementos al contenedor de horario
          listItem.addEventListener("click", function() {
            const hora = item.HORA;
            const horaContainer = document.getElementById(hora.replace('-', '_')); // Reemplazar "-" con "_" en la hora para crear el ID del contenedor
            const clonedItem = listItem.cloneNode(true); // Clonar el elemento
            horaContainer.appendChild(clonedItem); // Agregar el elemento clonado al contenedor de horario
          });

          materiasContainer.appendChild(listItem);
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