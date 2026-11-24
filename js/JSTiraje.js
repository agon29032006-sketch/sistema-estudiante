
function validarCampo(campo) {
    const vacio = campo.value.trim() === "";
    campo.classList.toggle("is-invalid", vacio);
    campo.classList.toggle("is-valid", !vacio);

    return !vacio;
}

const formulario = document.getElementById("formulario");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const prefijo = document.getElementById("prefijo");
const ultimo = document.getElementById("ultimo");
const estado = document.getElementById("estado");

const campos = [prefijo, ultimo, estado];

if (formulario) {

    ////////////////////VALIDACION DE CAMPOS VACIOS

    campos.forEach(function (campo) {
        campo.addEventListener("blur", function () {
            validarCampo(campo);
        });
    });

    //////////////BOTON CANCELAR///////

    btnCancelar.addEventListener("click", function () {
        window.location.href = "tiraje.php";
    });

    //////////////CONSULTAR PREFIJO///////

    prefijo.addEventListener("change", async function () {
        try {
            const datos = new FormData();
            datos.append("opcion", "consultarPrefijo");
            datos.append("prefijo", prefijo.value);

            Swal.fire({
                title: "Consultando...",
                text: "Espere",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading()
            });

            const respuesta = await fetch("DAOTiraje.php", {
                method: "POST",
                body: datos
            });

            if (!respuesta.ok) {
                console.error(respuesta.status);
                throw new Error("Error HTTP: " + respuesta.status);
            }

            const resultado = await respuesta.json();
            Swal.close();

            if (resultado.estado) {
                ultimo.value = resultado.datos.ultimo;
                estado.value = resultado.datos.estado;

            } else {
                ultimo.value = resultado.datos.ultimo ?? 0;
                estado.value = resultado.datos.estado ?? "No Existe";
            }

        } catch (error) {
            Swal.close();
            console.error(error);
        }
    });

    //////////////BOTON GUARDAR///////

    btnGuardar.addEventListener("click", async function () {

        const prefijoValido = validarCampo(prefijo);
        const ultimoValido = validarCampo(ultimo);
        const estadoValido = validarCampo(estado);

        if (btnGuardar.textContent.trim() == "Nuevo Tiraje de números de factura") {

            if (prefijoValido && ultimoValido && estadoValido) {

                Swal.fire({
                    title: "Poseidon",
                    text: "Al Guardar el numero PERIODO se iniciará en contador a 0.\nESTA ACCIÓN NO SE PUEDE REVERTIR",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Si, Confirmo"
                }).then(async (result) => {

                    if (result.isConfirmed) {

                        try {

                            const datos = new FormData();
                            datos.append("opcion", "guardar");

                            const respuesta = await fetch("DAOTiraje.php", {
                                method: "POST",
                                body: datos
                            });

                            if (!respuesta.ok) {
                                throw new Error("Error de Comunicacion " + respuesta.status);
                            }

                            const resultado = await respuesta.json();

                            if (resultado.estado) {

                                Swal.fire({
                                    position: "top-end",
                                    icon: "success",
                                    title: "Poseidon",
                                    text: resultado.mensaje,
                                    showConfirmButton: false,
                                    timer: 1500
                                }).then(() => {
                                    location.reload();
                                });

                            } else {

                                Swal.fire({
                                    position: "top-end",
                                    icon: "error",
                                    title: "Poseidon",
                                    text: resultado.mensaje,
                                    showConfirmButton: false,
                                    timer: 1500
                                });
                            }

                        } catch (error) {
                            console.error(error);
                        }
                    }
                });
            }
        }
    });

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

        try {

            const datos = new FormData();
            datos.append("opcion", "consultar");

            Swal.fire({
                title: "Consultando...",
                text: "Espere",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading()
            });

            const respuesta = await fetch("DAOTiraje.php", {
                method: "POST",
                body: datos
            });

            if (!respuesta.ok) {
                console.error(respuesta.status);
                throw new Error("Error HTTP: " + respuesta.status);
            }

            const resultado = await respuesta.json();

            Swal.close();

            const select = document.getElementById("prefijo");

            // Limpiar el select
            select.innerHTML = '<option value="">[Seleccione]</option>';

            let estado = 0;

            // Recorrer el arreglo
            resultado.forEach(prefijo => {

                const opcion = document.createElement("option");
                opcion.value = prefijo.prefijo;
                opcion.textContent = prefijo.prefijo;

                select.appendChild(opcion);
                estado = 1;
            });

            // Seleccionar el primer prefijo encontrado
            if (resultado.length > 0) {
                select.value = resultado[0].prefijo;

                // Consultar el ultimo numero y el estado
                select.dispatchEvent(new Event("change"));
            }

        } catch (error) {
            Swal.close();
            console.error(error);
        }

    });

}


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