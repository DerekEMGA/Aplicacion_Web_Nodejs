window.addEventListener("load", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const matricula = urlParams.get("matricula") || "";

    // Obtener la ruta actual
    const rutaActual = window.location.pathname;

    // Verificar si la página actual es la página de inicio de sesión (/login)
    const paginaLogin = rutaActual === "/login";

    // Obtener la matrícula guardada en localStorage
    let matriculaGuardada = localStorage.getItem("matricula");

    // Si la página actual es la página de inicio de sesión y no hay una matrícula guardada,
    // o si la matrícula recibida es diferente a la matrícula guardada, actualizarla
    if ((paginaLogin && !matriculaGuardada) || (matricula && matricula !== matriculaGuardada)) {
        localStorage.setItem("matricula", matricula);
        matriculaGuardada = matricula;
    }

    // Asignar la matrícula al elemento HTML
    document.getElementById("matriculaMostrada").textContent = matriculaGuardada;

    // Si la página actual es la página de inicio de sesión, limpiar la matrícula guardada
    if (paginaLogin) {
        localStorage.removeItem("matricula");
    }

    // Enviar la matrícula a la ruta /alumno/horario utilizando fetch
    fetch(`/alumno/horario?matricula=${matriculaGuardada}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error al enviar la matrícula");
            }
            return response.text();
        })
        .then((data) => {
            // Hacer algo con la respuesta del servidor, si es necesario
            console.log(data);
        })
        .catch((error) => {
            console.error("Error al enviar la matrícula:", error);
        });
});
