
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
const elementosHorarioN = [];

function addToHorarioArray() {
  const horasDelItem = [];
  const idsDelItem = [];

  // Obtener todos los elementos dentro del contenedor
  const items = horarioContainer.querySelectorAll('.list-group-item');

  // Iterar sobre cada elemento del contenedor
  items.forEach(item => {
      // Obtener la hora y el ID del elemento actual
      const horaElement = item.querySelector('.hora');
      const idElement = item.querySelector('.id');

      // Verificar si se encontraron la hora y el ID en el elemento actual
      if (horaElement && idElement) {
          const hora = horaElement.textContent.trim();
          const id = idElement.textContent.trim();

          // Verificar si la hora y el ID son válidos
          if (hora && id) {
              horasDelItem.push(hora);
              idsDelItem.push(id);
          }
      }
  });

  // Verificar si se encontraron elementos válidos antes de agregar al arreglo
  if (horasDelItem.length > 0 && horasDelItem.length === idsDelItem.length) {
      // Iterar sobre los elementos encontrados y agregarlos al arreglo elementosHorario
      for (let i = 0; i < horasDelItem.length; i++) {
          const nuevaHora = horasDelItem[i];
          const nuevoId = idsDelItem[i];
          const existingItemIndex = elementosHorarioN.findIndex(item => {
              return item.hora === nuevaHora && item.id === nuevoId;
          });

          if (existingItemIndex === -1) {
              // Guardar tanto la hora como el ID en un objeto y agregarlo al arreglo elementosHorario
              const nuevoElementoHorario = {
                  hora: nuevaHora,
                  id: nuevoId
              };

              elementosHorarioN.push(nuevoElementoHorario);
              console.log("Arreglo elementosHorario:", elementosHorarioN);
          } else {
              console.error("La hora ya está ocupada.");
          }
      }
  } else {
      console.error("No se encontraron elementos válidos o la longitud de los arreglos no coincide.");
  }
}

const llenar_arreglo = document.getElementById("modificarHorario");
llenar_arreglo.addEventListener("click", function() {
    addToHorarioArray(); // Llama a addToHorarioArray() para actualizar el arreglo elementosHorario
    alert("Arreglo elementosHorario: " + JSON.stringify(elementosHorarioN));
    validateForm("/modificarHorario"); // Llama a la función validateForm con la acción "/modificarHorario"
});


// Obtener datos al hacer clic en el botón "aplicarFiltrosBtn"
const filtroNombreInput = document.getElementById("nombreHorario");
const aplicarFiltrosBtnHorario = document.getElementById("buscarHorario");

aplicarFiltrosBtnHorario.addEventListener("click", function() {
  const filtroNombre = filtroNombreInput.value.trim();

  fetch(`/personal/crearHorario/tablaHorario?filtroNombre=${filtroNombre}`)
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
          <p class="mb-0 id">${item.ID_MATERIA}</p> `;
        // Agregar el elemento al contenedor de "materias"
        horarioContainer.appendChild(listItem);
        const id_horario = item.ID_HORARIO;
       // addToHorarioArray();

        // Crear un nuevo elemento input para almacenar el ID del horario
        const idHorarioInput = document.createElement('input');
        idHorarioInput.type = 'hidden'; // Establecer el tipo de input como 'hidden'
        idHorarioInput.name = 'idHorario'; // Establecer el nombre del campo en el formulario
        idHorarioInput.value = id_horario; // Asignar el valor del ID del horario al campo oculto
        
        // Agregar el campo oculto al formulario
        document.getElementById("formularioHorario").appendChild(idHorarioInput);

      });
    })


    .catch((error) => {
      console.error("Error al obtener los datos:", error);
      // Mostrar un mensaje de error al usuario
    });
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
  

//Funcion para la comprobacion de los datos en los input

function validateInput(event) {
  const fieldName = event.target.name;

 if (fieldName === "nombreHorario") {

  const regex = /^(?!.*\s{3,})(?![A-Za-z]*\d)[A-Za-z0-9\s]*$/;
  const inputValue = event.target.value;
  
  // Permitir borrar si la tecla presionada es backspace o delete
  if (event.key === 'Backspace' || event.key === 'Delete') {
      return;
  }
  
  // Si el primer carácter es un espacio, un número o el símbolo '#', prevenir la acción
    if (inputValue.length === 0 && (event.key === ' ' || /\d/.test(event.key) || event.key === '#')) {
      event.preventDefault();
      return;
    }

  // Si se ingresa un número o un símbolo en cualquier parte de la cadena, prevenir la acción
  if (/[^A-Za-z0-9\s]/.test(event.key)) {
      event.preventDefault();
      return;
  }
  
  if (!regex.test(inputValue)) {
      event.preventDefault();
  }
}
}


//Funcion para recibir las acciones de los botones y agregar el arreglo del contendor horario como hijo del formulario para el servidor
function validateForm(action) {

  

 
      switch (action) {

        case "/insertarHorario":
        document.getElementById("formularioHorario").action = action;
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

      
         document.getElementById("formularioHorario").action = action;
         const elementosHorarioStringN = JSON.stringify(elementosHorarioN);
          // Crear un campo oculto para la cadena de texto elementosHorario

          const elementosHorarioInputN = document.createElement('input');
  
           // Convertir el arreglo de objetos a una cadena de texto en formato JSON
           elementosHorarioInputN.type = 'hidden';
           elementosHorarioInputN.name = 'elementosHorarioN'; // Nombre del campo en el formulario
           elementosHorarioInputN.value = elementosHorarioStringN; // Asignar la cadena de texto como valor
        document.getElementById("formularioHorario").appendChild(elementosHorarioInputN);
        document.getElementById("formularioHorario").submit();

         break
       
      }
    }

    $(function(){
      var textos = ["Consulta de materias ", "Mostrara todas las materias disponibles ", "Arrastre el contenedor a la plantilla "];
      var index = 0;
      var intervalo = 100;
      var espera = 2000; // 2 segundos de espera antes de borrar
  
      mostrarTexto(textos[index]);
  
      function mostrarTexto(texto) {
          maquina("typer", texto, intervalo, function() {
              // Una vez que se muestra un texto, esperamos antes de comenzar el borrado
              setTimeout(function() {
                  // Comienza el borrado gradual
                  var i = texto.length;
                  var borradoTimer = setInterval(function() {
                      if (i >= 0) {
                          $("#" + "typer").html(texto.substr(0, i--) + "_");
                      } else {
                          clearInterval(borradoTimer);
                          // Pasamos al siguiente texto
                          index = (index + 1) % textos.length; // Esto garantiza que index esté entre 0 y textos.length - 1
                          setTimeout(function() {
                              mostrarTexto(textos[index]);
                          }, 1000); // Espera 1 segundo antes de mostrar el próximo texto
                      }
                  }, intervalo);
              }, espera);
          });
      }
  });
  
  function maquina(contenedor, texto, intervalo, callback) {
      var i = 0;
      var timer = setInterval(function() {
          if (i < texto.length) {
              $("#" + contenedor).html(texto.substr(0, i++) + "_");
          } else {
              clearInterval(timer);
              // Una vez que se ha mostrado todo el texto, llamamos al callback
              if (callback) {
                  callback();
              }
          }
      }, intervalo);
  };
  
  
      
    $(function(){
      var texto = "Plantilla de horario";
      maquina1("typer1",texto,100,0);
     });
     
     function maquina1(contenedor,texto,intervalo,n){
      var i=0,
       // Creamos el timer
       timer = setInterval(function() {
       if ( i<texto.length ) {
        // Si NO hemos llegado al final del texto..
        // Vamos añadiendo letra por letra y la _ al final.
        $("#"+contenedor).html(texto.substr(0,i++) + "_");
       } else {
        // En caso contrario..
        // Salimos del Timer y quitamos la barra baja (_)
        clearInterval(timer);
        $("#"+contenedor).html(texto);
        // Auto invocamos la rutina n veces (0 para infinito)
        if ( --n!=0 ) {
         setTimeout(function() {
          maquina1(contenedor,texto,intervalo,n);
         },21000);
        }
       }
      },intervalo);
     };