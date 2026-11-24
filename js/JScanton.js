function validarCampo(campo) {
    const vacio = campo.value.trim() === "";
    campo.classList.toggle("is-invalid", vacio);
    campo.classList.toggle("is-valid", !vacio);

    return !vacio;
}

const formulario = document.getElementById("formulario");
const btnGuardar = document.getElementById("btnGuardar");
const nombre = document.getElementById("nombre");


const campos = [nombre];

if (formulario) {
    ////////////////////VALIDACION DE CAMPOS VACIOS

    campos.forEach(function (campo) {
        campo.addEventListener("blur", function () {
            validarCampo(campo);
        });
    });
    ////////////////////PASAR TODO A MAYUSCULAS
    const campos1 = [nombre];

    campos1.forEach(function (campo) {
        campo.addEventListener("input", function () {
            campo.value = campo.value.toUpperCase();
            validarCampo(campo);
        });
    });


    btnGuardar.addEventListener("click", async function () {

        const nombreValido = validarCampo(nombre);

        if (btnGuardar.textContent.trim() == "Guardar") {

            if (nombreValido) {
                try {
                    const datos = new FormData(formulario);
                    datos.append("opcion", "guardar");

                    btnGuardar.disabled = true;
                    btnGuardar.textContent = "Procesando...";

                    // Enviar datos 
                    const respuesta = await fetch("DAOcanton.php", {
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
                            icon: "danger",
                            title: "Poseidón",
                            text: resultado.mensaje,
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                } catch (error) {

                } finally {
                    btnGuardar.disabled = false;
                    btnGuardar.textContent = "Guardar";
                }

            }
        }
        if (btnGuardar.textContent.trim() == "Modificar") {

            if (nombreValido) {
                try {
                    const datos = new FormData(formulario);
                    datos.append("opcion", "modificar");
                    datos.append("idcanton", btnGuardar.dataset.id);

                    btnGuardar.disabled = true;
                    btnGuardar.textContent = "Procesando...";

                    // Enviar datos 
                    // await hace que JavaScript ESPERE
                    const respuesta = await fetch("DAOcanton.php", {
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
                        }).then(() => {//cuando desaparece el mensaje se recarga la pagina
                            window.location.href = "canton.php";
                        });

                    } else {
                        Swal.fire({
                            position: "top-end",
                            icon: "danger",
                            title: "Poseidón",
                            text: resultado.mensaje,
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                } catch (error) {

                } finally {
                    btnGuardar.disabled = false;
                    btnGuardar.textContent = "Guardar";
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
    // Obtener el ID de la URL
    const parametros = new URLSearchParams(window.location.search);
    const idcanton = parametros.get("id");

    if (idcanton) {//SI EXISTE EL ID, SE HACE LA BUSQUEDA
        try {
            const datos = new FormData();
            datos.append("opcion", "consultarIndividual");
            datos.append("idcanton", idcanton);

            Swal.fire({
                title: "Consultando...",
                text: "Espere",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading()
            });

            const respuesta = await fetch("DAOcanton.php", {
                method: "POST",
                body: datos
            });

            if (!respuesta.ok) {
                console.error(respuesta.status);
                throw new Error("Error HTTP: " + respuesta.status);
            }

            const resultado = await respuesta.json();


            // Cerrar el mensaje de espera
            Swal.close();

            if (resultado.estado) {

                nombre.value = resultado.datos.nombre;


                btnGuardar.textContent = "Modificar";
                btnGuardar.dataset.id = resultado.datos.idcanton;
            }

        } catch (error) {
            Swal.close();
        }
    }


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