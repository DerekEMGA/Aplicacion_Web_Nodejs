document.addEventListener("DOMContentLoaded", function() {
 

  const horarioContainer = document.getElementById("horario");
  const materiasContainer = document.getElementById("materias");



  Sortable.create(horarioContainer, {
    maxItems: 7,
    group: {
      name: "materias",
      pull: true,
      put: true 
    },
    animation: 400,
    chosenClass: "active",
    removeOnSpill: true, // Eliminar automáticamente los elementos cuando se arrastren fuera del contenedor
    onAdd: function(evt) {
      const newItem = evt.item;
      const newItemHora = newItem.querySelector('.hora').textContent;
  
      // Verificar si el contenedor ya tiene elementos
      if (horarioContainer.children.length > 0) {
        // Verificar si la hora del nuevo elemento ya está presente en el contenedor
        const existingItem = Array.from(horarioContainer.children).find(item => {
          return item !== newItem && item.querySelector('.hora').textContent === newItemHora;
        });
  
        if (existingItem) {
          // Mostrar una notificación o mensaje de error indicando que la hora ya está ocupada
          console.error("La hora ya está ocupada.");
          // Eliminar el nuevo elemento que se intentó agregar
          newItem.parentNode.removeChild(newItem);
          return;
        }
      }
    },
    onRemove: function(evt) {
      const item = evt.item;
      console.log("Elemento eliminado de horarioContainer:", item);
      item.parentNode.removeChild(item);
    }
  });
  
  // Manejar el evento 'sort' para ordenar los elementos si se detecta un cambio en el orden
  horarioContainer.addEventListener('sort', function(evt) {
    const items = Array.from(horarioContainer.children);
    // Ordenar los elementos por hora de menor a mayor
    items.sort((a, b) => a.querySelector('.hora').textContent.localeCompare(b.querySelector('.hora').textContent));
    // Reagregar los elementos ordenados al contenedor
    items.forEach(item => horarioContainer.appendChild(item));
  });
  
  
  

  // Inicializar el contenedor de "materias" como sortable
  Sortable.create(materiasContainer, {
    group: {
      name: "materias",
      pull: "clone",
      put: false
    },
    animation: 400,
    chosenClass: "active"
    
  });

  // Obtener datos al hacer clic en el botón "aplicarFiltrosBtn"
  const filtroSemestreInput = document.getElementById("filtroSemestre");
  const aplicarFiltrosBtn = document.getElementById("aplicarFiltrosBtn");
  const filtroPeriodoInput= document.getElementById("periodo");

  aplicarFiltrosBtn.addEventListener("click", function() {
    const filtroSemestre = filtroSemestreInput.value.trim();
    const filtroPeriodo = filtroPeriodoInput.value.trim();

    fetch(`/personal/crearHorario/tabla?filtroSemestre=${filtroSemestre}&filtroPeriodo=${filtroPeriodo}`)
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
          const listItem = document.createElement('li');
          listItem.classList.add('list-group-item');
          listItem.innerHTML = `
            <p class="mb-0 hora" style="color:blue;">${item.HORA}</p>
            <p class="mb-0">Materia: ${item.NOMBRE_MATERIA}</p>
            <p class="mb-0">Docente: ${item.NOMBRE_PROFESOR}</p>
            <p class="mb-0">Semestre: ${item.SEMESTRE}</p>
            <p class="mb-0">Periodo: ${item.PERIODO}</p>
            <p class="mb-0">Dias: ${item.DIA_SEMANA}</p>
            <p class="mb-0">Salon: ${item.SALON}</p>
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



  window.addEventListener("load", function () {
    // Obtener el año actual
    const year = new Date().getFullYear();
  
    document.querySelectorAll('.year').forEach(function(select) {
      // Obtener todas las opciones dentro del select
      const options = select.querySelectorAll('option');
    
      // Iterar sobre cada opción y agregar el año al valor
      options.forEach(function(option) {
        option.value +=year;
        option.innerText += `${year}`;
      });
    });
  });
  