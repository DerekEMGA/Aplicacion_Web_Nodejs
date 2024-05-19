document.addEventListener("DOMContentLoaded", function() {
    // Variable para almacenar el ID del horario seleccionado
    let idHorarioSeleccionado = "";

    // Variable para controlar si se ha guardado el nombre del horario
    let nombreHorarioGuardado = false;

    // Crear el contenedor del horario
    const horarioContainer = document.getElementById("horario");

    // Configurar el Sortable para el contenedor del horario
    Sortable.create(horarioContainer, {
        maxItems: 7,
        group: {
            name: "materias",
            pull: false,
            put: false
        },
        animation: 400,
        chosenClass: "active",
        removeOnSpill: true,
        onAdd: function(evt) {
            const newItemIdElement = evt.item.querySelector('.id');
            idHorarioSeleccionado = newItemIdElement ? newItemIdElement.textContent.trim() : '';
        },
        onRemove: function(evt) {
            idHorarioSeleccionado = "";
        }
    });

    // Función para agregar el ID del horario al formulario antes de enviarlo
    function agregarIdHorarioAlFormulario() {
        const formulario = document.getElementById("formularioHorario");
        const inputIdHorario = document.createElement('input');
        inputIdHorario.type = 'hidden';
        inputIdHorario.name = 'idHorario';
        inputIdHorario.value = idHorarioSeleccionado;
        formulario.appendChild(inputIdHorario);
    }

    // Evento para enviar el formulario
    const botonAsignarHorario = document.getElementById("asignarHorario");
    botonAsignarHorario.addEventListener("click", function() {
        agregarIdHorarioAlFormulario();

        // Validar el formulario y enviarlo
        validateForm("/personal/asignarHorario");
    });

    // Evento para eliminar la asignación de horario
    const botonEliminarAsignacion = document.getElementById("eliminarAsignacion");
    botonEliminarAsignacion.addEventListener("click", function() {
        agregarIdHorarioAlFormulario();

        // Validar el formulario y enviarlo
        validateForm("/personal/eliminarAsignacion");
    });

    // Obtener datos al hacer clic en el botón "aplicarFiltrosBtn"
    const filtroNombreInput = document.getElementById("nombreHorario");
    const aplicarFiltrosBtnHorario = document.getElementById("buscarHorario");

    const buttonEliminar = document.getElementById("eliminarAsignacion");
    const buttonAsignar = document.getElementById("asignarHorario");



    aplicarFiltrosBtnHorario.addEventListener("click", function() {
        const filtroNombre = filtroNombreInput.value.trim();
    
        if (!filtroNombre) {
            alert("Ingrese un nombre de horario antes de buscar");
            return;
        }
    
        // Verificar si el nombre del horario ya ha sido guardado
        if (!nombreHorarioGuardado) {
            // Crear el campo oculto para el nombre del horario solo si no ha sido guardado antes
            const nombreHorarioInput = document.createElement('input');
            nombreHorarioInput.type = 'hidden';
            nombreHorarioInput.name = 'nombreHorario';
            nombreHorarioInput.value = filtroNombre;
            document.getElementById("formularioHorario").appendChild(nombreHorarioInput);
            // Marcar que el nombre del horario ha sido guardado
            nombreHorarioGuardado = true;
        }
    
        fetch(`/personal/crearHorario/tablaHorario?filtroNombre=${filtroNombre}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error al obtener los datos");
                }
                return response.json();
            })
            .then((data) => {

                if (data.length === 0) {
                    alert("No se encontró ningún horario con ese nombre");    
                    buttonAsignar.setAttribute('disabled',true)
                    buttonEliminar.setAttribute('disabled',true)
                  } 

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
                        <p class="mb-0 id">${item.ID_MATERIA}</p>
                    `;
                    // Agregar el elemento al contenedor de "horario"
                    horarioContainer.appendChild(listItem);
                });
            })
            .catch((error) => {
                console.error("Error al obtener los datos:", error);
                alert("Ocurrió un error al obtener los datos del horario.");
            });


            fetch(`/personal/agregarAlumnos/tabla2?nombreHorario=${filtroNombre}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error al obtener la tabla");
                }
                return response.json();
            })
            .then((data) => {
               // alert(JSON.stringify(data)); // Alerta para mostrar el contenido de data
                  

                    // Verificar si la tabla está vacía
                    if (data.tableHtml === '<table name="tabla"  cellpadding="8"><tr></tr></table>') {     
                        // Si la tabla está vacía, mostrar un mensaje y deshabilitar los botones
                        buttonAsignar.setAttribute('disabled', true);
                        buttonEliminar.setAttribute('disabled', true);
                    } else {
                        // Si la tabla no está vacía, insertar la tabla HTML en el contenedor
                        document.getElementById("tabla").innerHTML = data.tableHtml;
                        
                        // Mostrar el contador
                        const contador = data.count;
                        console.log("Contador:", contador);
                        if (contador >= 1) {
                            document.getElementById("contadorDisplay").innerText = `Total de alumnos con el horario "${filtroNombre}": ${contador}`;
                        }

                        // Habilitar los botones
                        buttonAsignar.removeAttribute('disabled');
                        buttonEliminar.removeAttribute('disabled');
                    }
        
            })
            .catch((error) => {
                console.error("Error al obtener la tabla:", error);
                // Puedes mostrar un mensaje al usuario indicando el error
                document.getElementById("tabla").innerHTML = `<p>Error al obtener la tabla: ${error.message}</p>`;
            });


            
    });

    // Función para validar la matrícula del alumno
    function validateMatricula(event) {
        const maxDigits = 7;
        let inputValue = event.target.value;

        // Eliminar caracteres que no sean números
        inputValue = inputValue.replace(/\D/g, '');

        // Limitar la longitud a 7
        inputValue = inputValue.slice(0, maxDigits);

        // Actualizar el valor del campo
        event.target.value = inputValue;
    }

    // Vincular la función de validación al campo de matrícula del alumno
    const matriculaInput = document.getElementById("matricula");
    matriculaInput.addEventListener("input", validateMatricula);

    function validateForm(action) {
        switch (action) {
            case "/personal/asignarHorario":
                // Establecer la acción del formulario para asignar horario
                document.getElementById("formularioHorario").action = action;
                break;
            case "/personal/eliminarAsignacion":
                // Establecer la acción del formulario para eliminar asignación
                document.getElementById("formularioHorario").action = action;
                break;
            default:
                // En caso de que no se reconozca la acción, mostrar un mensaje de error
                console.error("Acción no reconocida:", action);
                return false;
        }
        // Enviar el formulario
        document.getElementById("formularioHorario").submit();
        return true;
    }
});


    document.addEventListener("DOMContentLoaded", function () {
        console.log("Script ejecutado en la carga de la página."); // Registro para verificar la ejecución
        const serverMessage = obtenerParametroConsulta("mensaje");
    
        if (serverMessage && !sessionStorage.getItem("messageShown")) {
        console.log("Mensaje recibido:", serverMessage); // Registro para verificar el mensaje recibido
        alert(serverMessage);
        sessionStorage.setItem("messageShown", "true");
        }
    
       
    });


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


      const btnCancelar = document.getElementById("cancelar");

      btnCancelar.addEventListener("click", function() {
          // Recarga la página para limpiarla
          location.reload();
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
        const cleanUrl = window.location.href.split('?')[0];
        window.history.replaceState({}, document.title, cleanUrl);
      });
      