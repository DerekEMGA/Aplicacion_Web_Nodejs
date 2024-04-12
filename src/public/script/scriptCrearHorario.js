document.addEventListener("DOMContentLoaded", function() {
  const horarioContainer = document.getElementById("horario");
  const materiasContainer = document.getElementById("materias");

  // Inicializar el contenedor de "horario" como sortable
  Sortable.create(horarioContainer, {
    group: {
      name: "materias",
      pull: false,
      put: true // Permitir soltar elementos aquí
    },
    animation: 600,
    chosenClass: "active",
    onAdd: function(evt) {
      const item = evt.item;
      const uniqueID = `horario-${item.id}`; // Agregar un sufijo único al id

      // Verificar si la hora ya está presente en el contenedor de "horario"
      const existingHour = Array.from(horarioContainer.children).find(child => {
        return child.querySelector('.hora').textContent === item.querySelector('.hora').textContent;
      });

      if (existingHour) {
        //item.style.display = 'none';
        return;
      }

      // Clonar el elemento y agregarlo al contenedor de "horario"
      const clonedItem = item.cloneNode(true);
      clonedItem.setAttribute('id', uniqueID);
      horarioContainer.appendChild(clonedItem);

      // Ocultar el elemento clonado en el contenedor de "materias"
      item.style.display = 'none';
    }
  });

  // Inicializar el contenedor de "materias" como sortable
  Sortable.create(materiasContainer, {
    group: {
      name: "materias",
      pull: "clone",
      put: false
    },
    animation: 600,
    chosenClass: "active"
  });

  // Obtener datos al hacer clic en el botón "aplicarFiltrosBtn"
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
          listItem.classList.add('list-group-item');
          listItem.innerHTML = `
            <p class="mb-0 hora" style="color:blue;">${item.HORA}</p>
            <p class="mb-0">Materia: ${item.NOMBRE_MATERIA}</p>
            <p class="mb-0">Docente: ${item.NOMBRE_PROFESOR}</p>
            <p class="mb-0">Semestre:${item.SEMESTRE}</p>
            <p class="mb-0">${item.DIA_SEMANA}</p>
          `;

          // Agregar el elemento al contenedor de "materias"
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