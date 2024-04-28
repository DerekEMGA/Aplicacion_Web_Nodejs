const elementosHorario = [];

document.addEventListener("DOMContentLoaded", function() {
  const horarioContainer = document.getElementById("horario");
  const materiasContainer = document.getElementById("materias");
// Crear el Sortable y definir las funciones onAdd y onRemove
Sortable.create(horarioContainer, {
  maxItems: 7,
  group: {
      name: "materias",
      pull: true,
      put: true
  },
  animation: 400,
  chosenClass: "active",
  removeOnSpill: true,
  onAdd: function(evt) {
      const newItem = evt.item;
      const newItemHoraElement = newItem.querySelector('.hora');
      const newItemHora = newItemHoraElement ? newItemHoraElement.textContent.trim() : '';
      
      const newItemIdElement = newItem.querySelector('.id'); // Ajusta el selector según donde esté el id
      const newItemId = newItemIdElement ? newItemIdElement.textContent.trim() : ''; // Ajusta el selector según donde esté el id
  
      if (!newItemHora || !newItemId) {
          console.error("No se pudo encontrar la hora o el id en el nuevo elemento.");
          return;
      }

      // Verificar si la hora del nuevo elemento ya está presente en el contenedor
      const existingItem = Array.from(horarioContainer.children).find(item => {
          return item !== newItem && item.querySelector('.hora').textContent.trim() === newItemHora;
      });

      if (existingItem) {
          // Mostrar una notificación o mensaje de error indicando que la hora ya está ocupada
          console.error("La hora ya está ocupada.");
          // Eliminar el nuevo elemento que se intentó agregar
          newItem.parentNode.removeChild(newItem);
          return;
      }
  
      const existingItemIndex = elementosHorario.findIndex(item => {
          return item.hora === newItemHora && item.id === newItemId;
      });
  
      if (existingItemIndex !== -1) {
          console.error("La hora ya está ocupada.");
          newItem.parentNode.removeChild(newItem);
          return;
      }
  
      // Guardar tanto la hora como el id en un objeto
      const nuevoElementoHorario = {
          hora: newItemHora,
          id: newItemId
      };
  
      elementosHorario.push(nuevoElementoHorario);
  
      console.log("Arreglo elementosHorario:", elementosHorario);
  },
  
  onRemove: function(evt) {
      const item = evt.item;
      const itemId = item.querySelector('.id').textContent.trim();
      
      const itemIndex = elementosHorario.findIndex(elemento => elemento.id === itemId);
      
      if (itemIndex !== -1) {
          // Eliminar el elemento del arreglo
          elementosHorario.splice(itemIndex, 1);
          
          // Imprimir el arreglo actualizado
          console.log("Arreglo elementosHorario:", elementosHorario);
      }
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
  
   // Manejar el evento 'sort' para ordenar los elementos si se detecta un cambio en el orden
   materiasContainer.addEventListener('sort', function(evt) {
    const items = Array.from(materiasContainer.children);
    // Ordenar los elementos por hora de menor a mayor
    items.sort((a, b) => a.querySelector('.hora').textContent.localeCompare(b.querySelector('.hora').textContent));
    // Reagregar los elementos ordenados al contenedor
    items.forEach(item => materiasContainer.appendChild(item));
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
          const listItem = document.createElement('div');
          listItem.classList.add('list-group-item');
          listItem.innerHTML = `
            <p class="mb-0 hora" style="color:blue;">${item.HORA}</p>
            <p class="mb-0">Materia: ${item.NOMBRE_MATERIA}</p>
            <p class="mb-0">Docente: ${item.NOMBRE_PROFESOR}</p>
            <p class="mb-0">Semestre: ${item.SEMESTRE}</p>
            <p class="mb-0">Periodo: ${item.PERIODO}</p>
            <p class="mb-0">Dias: ${item.DIA_SEMANA}</p>
            <p class="mb-0">Salon: ${item.SALON}</p>
            <p class="mb-0 id">${item.ID_MATERIA}</p>
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
    const urlParams = new URLSearchParams(window.location.search);

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

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname + window.location.hash
    );


  });
  

 


  function validateForm(action) {
    //alert(`Validando formulario para la acción: ${action}`);
  

      switch (action) {
        case "/insertarHorario":
          document.getElementById("formularioHorario").action = action;

// Iterar sobre cada objeto en elementosHorario y mostrar sus valores en la consola
//elementosHorario.forEach(elemento => {
  //console.log("Hora:", elemento.hora);
  //console.log("ID:", elemento.id);
//});

// Convertir el arreglo de objetos a una cadena de texto en formato JSON
const elementosHorarioString = JSON.stringify(elementosHorario);

// Crear un campo oculto para la cadena de texto elementosHorario
const elementosHorarioInput = document.createElement('input');
elementosHorarioInput.type = 'hidden';
elementosHorarioInput.name = 'elementosHorario'; // Nombre del campo en el formulario
elementosHorarioInput.value = elementosHorarioString; // Asignar la cadena de texto como valor

// Agregar el campo oculto al formulario
document.getElementById("formularioHorario").appendChild(elementosHorarioInput);

// Enviar el formulario
document.getElementById("formularioHorario").submit();

 
 
 return true;
  
        case "/eliminarHorario":
         
          document.getElementById("formularioHorario").action = action;
          document.getElementById("formularioHorario").submit();
    
          return true; 
    
        case "/modificarHorario":
          document.getElementById("formularioHorario").action = action
          document.getElementById("formularioHorario").submit()
          break;
    
        case "/buscarHorario":
            clearLocalStorage();
            document.getElementById("formularioHorario").action = action;
            document.getElementById("formularioHorario").submit();
          
          break;
      }
    }


    function clearLocalStorage() {
      localStorage.removeItem("nombre");
      localStorage.removeItem("docente");
      localStorage.removeItem("hora");
      localStorage.removeItem("dias");
      localStorage.removeItem("semestre");
      localStorage.removeItem("salon");
      localStorage.removeItem("periodo");
      }


 