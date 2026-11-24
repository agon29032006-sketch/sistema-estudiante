function validarCampo(campo) {
    const vacio = campo.value.trim() === "";
    campo.classList.toggle("is-invalid", vacio);
    campo.classList.toggle("is-valid", !vacio);

    return !vacio;
}

const formulario = document.getElementById("formulario");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const btnEliminar = document.getElementById("btnEliminar");
const empleado = document.getElementById("empleado");
const ruta = document.getElementById("ruta");
const rutas = document.getElementById("rutas");


const campos = [empleado, ruta];

if (formulario) {
    ////////////////////VALIDACION DE CAMPOS VACIOS

    campos.forEach(function (campo) {
        campo.addEventListener("blur", function () {
            validarCampo(campo);
        });
    });

    //////////////////ELIMINAR RUTAS ASIGNADAS
    rutas.addEventListener("change", async function () {
        if (rutas.value.trim() !== "") {
            document.getElementById("btnEliminar").style.display = "inline-block"
        }
    });

    btnEliminar.addEventListener("click", async function () {
        if (rutas.value.trim() !== "") {
            try {
                const datos = new FormData();
                datos.append("opcion", "eliminar");
                datos.append("idempleado_ruta", rutas.value);


                const respuesta = await fetch("DAOAsignarRuta.php", {
                    method: "POST",
                    body: datos
                });

                if (!respuesta.ok) {
                    throw new Error("Error HTTP: " + respuesta.status);
                }

                const resultado = await respuesta.json();
                if (resultado.estado) {
                    //todo salio bien
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Poseidón",
                        text: resultado.mensaje,
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        window.location.href = "asignarRuta.php";
                    });


                } else {
                    Swal.fire({
                        position: "top-end",
                        icon: "error",
                        title: "Poseidón",
                        text: resultado.mensaje,
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            } catch (error) {

            }
        }
    });


    /////EVENTO CUANDO SE SELECIONE UN EMPLEADO / MUESTRA LAS RUTAS
    empleado.addEventListener("change", async function () {
        try {
            const datos = new FormData();
            datos.append("opcion", "consultarRutas");
            datos.append("idempleado", empleado.value);

            const respuesta = await fetch("DAOAsignarRuta.php", {
                method: "POST",
                body: datos
            });

            if (!respuesta.ok) {
                console.error(respuesta.status);
                throw new Error("Error HTTP: " + respuesta.status);
            }

            const resultado = await respuesta.json();

            const select = document.getElementById("rutas");

            // limpiar el select
            select.innerHTML = `<option value="">[Seleccione Ruta]</option>`;

            if (resultado.estado) {
                resultado.datos.forEach(ruta => {
                    const option = document.createElement("option");
                    option.value = ruta.idempleado_ruta;
                    option.textContent = ruta.nombre;

                    select.appendChild(option);
                });
            }
        } catch (error) {
        }
    });

    ////////////BOTON CANCELAR
    btnCancelar.addEventListener("click", async function () {
        window.location.href = "asignarRuta.php";
    });
    /////////BOTON DE GUARDAR
    btnGuardar.addEventListener("click", async function () {

        const empleadoValido = validarCampo(empleado);
        const rutaValido = validarCampo(ruta);

        if (btnGuardar.textContent.trim() == "Guardar") {

            if (empleadoValido && rutaValido) {
                try {
                    const datos = new FormData(formulario);
                    datos.append("opcion", "guardar");

                    btnGuardar.disabled = true;
                    btnGuardar.textContent = "Procesando...";

                    // Enviar datos 
                    // await hace que JavaScript ESPERE
                    const respuesta = await fetch("DAOAsignarRuta.php", {
                        method: "POST",
                        body: datos
                    });

                    // Verificar respuesta HTTP
                    if (!respuesta.ok) {
                        throw new Error("Error HTTP: " + respuesta.status);
                    }

                    // Esperar a que DAO termine
                    const resultado = await respuesta.json();
                    if (resultado.estado) {
                        //todo salio bien
                        Swal.fire({
                            position: "top-end",
                            icon: "success",
                            title: "Poseidón",
                            text: resultado.mensaje,
                            showConfirmButton: false,
                            timer: 1500
                        });

                        limpiarCampos();

                    } else {
                        Swal.fire({
                            position: "top-end",
                            icon: "warning",
                            title: "Poseidón",
                            text: resultado.mensaje,
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                } catch (error) {

                } finally {
                    btnGuardar.disabled = false;
                    btnGuardar, this.textContent = "Guardar";
                }

            }
        }
        
    });
}
///////////////////LIMPIAR TODOS LOS CAMPOS///////////
function limpiarCampos() {
    campos.forEach(function (campo) {
        campo.value = "";
        campo.classList.remove("is-invalid");
        campo.classList.remove("is-valid");
    });
}

//////////PROCESA AL TERMINAR DE CARGAR LA PAGINA
document.addEventListener("DOMContentLoaded", async () => {

    //LLENAMOS EL SELECT DE LOS EMPLEADOS
    try {
        const datos = new FormData();
        datos.append("opcion", "consultarLectores");

        const respuesta = await fetch("DAOEmpleado.php", {
            method: "POST",
            body: datos
        });

        if (!respuesta.ok) {
            console.error(respuesta.status);
            throw new Error("Error HTTP: " + respuesta.status);
        }

        const resultado = await respuesta.json();

        const select = document.getElementById("empleado");

        // limpiar el select
        select.innerHTML = `<option value="">[Seleccione Empleado]</option>`;

        resultado.forEach(empleado => {
            const option = document.createElement("option");
            option.value = empleado.idempleado;
            option.textContent = empleado.nombre;

            select.appendChild(option);
        });

    } catch (error) {
    }


    //LLENAMOS EL SELECT DE LAS RUTAS
    try {
        const datos = new FormData();
        datos.append("opcion", "consultar");

        const respuesta = await fetch("DAOruta.php", {
            method: "POST",
            body: datos
        });

        if (!respuesta.ok) {
            console.error(respuesta.status);
            throw new Error("Error HTTP: " + respuesta.status);
        }

        const resultado = await respuesta.json();

        const select = document.getElementById("ruta");

        // limpiar el select
        select.innerHTML = `<option value="">[Seleccione Ruta]</option>`;

        resultado.forEach(ruta => {
            const option = document.createElement("option");
            option.value = ruta.idruta;
            option.textContent = ruta.nombre;

            select.appendChild(option);
        });

    } catch (error) {
    }

    document.getElementById("btnEliminar").style.display = "none";

});

const cerrarSesion = document.getElementById("cerrarSesion");

cerrarSesion.addEventListener("click", function (e) {
    e.preventDefault();

    Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Estás seguro que deseas salir del sistema?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {

        if (result.isConfirmed) {
            window.location.href = 'salir.php';
        }

    });
});