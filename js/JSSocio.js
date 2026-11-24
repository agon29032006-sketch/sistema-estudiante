function validarCampo(campo) {
    const vacio = campo.value.trim() === "";
    campo.classList.toggle("is-invalid", vacio);
    campo.classList.toggle("is-valid", !vacio);

    return !vacio;
}

const formulario = document.getElementById("formulario");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const dui = document.getElementById("dui");
const nombre = document.getElementById("nombre");
const apellido = document.getElementById("apellido");
const telefono = document.getElementById("telefono");
const profesion = document.getElementById("profesion");
const nit = document.getElementById("nit");
const direccion = document.getElementById("direccion");
const canton = document.getElementById("canton");
const fecha = document.getElementById("fecha");

const campos = [dui, nombre, apellido, telefono, profesion, nit, direccion, canton, fecha];

if (formulario) {
    ////////////////////VALIDACION DE CAMPOS VACIOS

    campos.forEach(function (campo) {
        campo.addEventListener("blur", function () {
            validarCampo(campo);
        });
    });
    ////////////////////PASAR TODO A MAYUSCULAS
    const campos1 = [nombre, apellido, direccion, profesion];

    campos1.forEach(function (campo) {
        campo.addEventListener("input", function () {
            campo.value = campo.value.toUpperCase();
            validarCampo(campo);
        });
    });

    //////////////////////////FORMATO DE DUI//////////////

    dui.addEventListener("input", function () {
        let valor = dui.value.replace(/\D/g, "");
        valor = valor.substring(0, 9);
        if (valor.length > 8) {
            valor = valor.substring(0, 8) + "-" + valor.substring(8);
        }
        dui.value = valor;
    });

    telefono.addEventListener("input", function () {
        let valor = telefono.value.replace(/\D/g, "");
        valor = valor.substring(0, 8);
        if (valor.length > 5) {
            valor = valor.substring(0, 4) + "-" + valor.substring(4);
        }
        telefono.value = valor;
    });

    nit.addEventListener("input", function () {
        let valor = nit.value.replace(/\D/g, "").substring(0, 14);
        let formato = "";
        if (valor.length > 0) {
            formato = valor.substring(0, 4);
        }
        if (valor.length > 4) {
            formato += "-" + valor.substring(4, 10);
        }
        if (valor.length > 10) {
            formato += "-" + valor.substring(10, 13);
        }
        if (valor.length > 13) {
            formato += "-" + valor.substring(13, 14);
        }
        nit.value = formato;
    });

    //////////////FECHAS, NO PUEDAN SER FUTURAS

    // Obtener la fecha actual en formato YYYY-MM-DD
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    const fechaActual = `${anio}-${mes}-${dia}`;

    // No permitir fechas futuras
    fecha.max = fechaActual;

    fecha.addEventListener("change", function () {
        if (this.value > fechaActual) {
            Swal.fire({
                icon: "warning",
                title: "Fecha inválida",
                text: "No puedes seleccionar una fecha futura."
            });

            this.value = "";
        }
    });

    ////////////////////BUSQUEDA DE DUI- PARA REPERIDOS/////////

    dui.addEventListener("keyup", async function () {
        if (dui.value.length === 10) {
            try {
                const datos = new FormData();
                datos.append("opcion", "consultarDUI");
                datos.append("dui", dui.value);

                Swal.fire({
                    title: "Espere...",
                    text: "Consultando DUI",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => Swal.showLoading()
                });

                const respuesta = await fetch("DAOSocio.php", {
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
                    dui.value = resultado.datos.dui;
                    nombre.value = resultado.datos.nombre;
                    apellido.value = resultado.datos.apellido;
                    telefono.value = resultado.datos.telefono;
                    fecha.value = resultado.datos.fecha_nacimiento;
                    canton.value = resultado.datos.idcanton;
                    profesion.value = resultado.datos.profesion;
                    nit.value = resultado.datos.nit;
                    direccion.value = resultado.datos.direccion;

                    btnGuardar.textContent = "Modificar";
                    btnGuardar.dataset.id = resultado.datos.idsocio;
                }
            } catch (error) {
                Swal.close();
            }
        }
    });


    btnGuardar.addEventListener("click", async function () {
        const duiValido = validarCampo(dui);
        const nombreValido = validarCampo(nombre);
        const apellidoValido = validarCampo(apellido);
        const telefonoValido = validarCampo(telefono);
        const fechaValido = validarCampo(fecha);
        const profesionValido = validarCampo(profesion);
        const nitValido = validarCampo(nit);
        const direccionValido = validarCampo(direccion);
        const cantonValido = validarCampo(canton);


        if (btnGuardar.textContent.trim() == "Guardar") {


            if (duiValido && nombreValido && apellidoValido && telefonoValido && fechaValido && profesionValido && nitValido
                && direccionValido && cantonValido) {
                try {
                    const datos = new FormData(formulario);
                    datos.append("opcion", "guardar");

                    btnGuardar.disabled = true;
                    btnGuardar.textContent = "Procesando...";

                    // Enviar datos
                    // await hace que JavaScript ESPERE
                    const respuesta = await fetch("DAOsocio.php", {
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
                    btnGuardar, this.textContent = "Guardar";
                }

            }
        }
        if (btnGuardar.textContent.trim() == "Modificar") {

            if (duiValido && nombreValido && apellidoValido && telefonoValido && fechaValido && profesionValido && nitValido
                && direccionValido && cantonValido) {
                try {
                    const datos = new FormData(formulario);
                    datos.append("opcion", "modificar");
                    datos.append("idsocio", btnGuardar.dataset.id);

                    btnGuardar.disabled = true;
                    btnGuardar.textContent = "Procesando...";

                    // Enviar datos 
                    // await hace que JavaScript ESPERE
                    const respuesta = await fetch("DAOsocio.php", {
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
                            window.location.href = "socio.php";
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
document.addEventListener("DOMContentLoaded", async () => {//LLENAR EL SELECT DEL CARGO

    //LLENAR EL SELECT DE CANTON
    try {
        const datos = new FormData();
        datos.append("opcion", "consultar");

        const respuesta = await fetch("DAOcanton.php", {
            method: "POST",
            body: datos
        });

        if (!respuesta.ok) {
            console.error(respuesta.status);
            throw new Error("Error HTTP: " + respuesta.status);
        }

        const resultado = await respuesta.json();

        const selectCanton = document.getElementById("canton");

        selectCanton.innerHTML = `<option value="">[SELECIONE UN CANTON]</option>`

        //recorrer el arreglo de cargos

        resultado.forEach(canton => {
            const option = document.createElement("option");

            option.value = canton.idcanton;
            option.textContent = canton.nombre;

            selectCanton.appendChild(option);
        });


    } catch (error) {
        Swal.close();
    }

    // Obtener el ID de la URL
    const parametros = new URLSearchParams(window.location.search);
    const idsocio = parametros.get("id");

    if (idsocio) {//SI EXISTE EL ID, SE HACE LA BUSQUEDA
        try {
            const datos = new FormData();
            datos.append("opcion", "consultarIndividual");
            datos.append("idsocio", idsocio);

            Swal.fire({
                title: "Consultando...",
                text: "Espere",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading()
            });

            const respuesta = await fetch("DAOsocio.php", {
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
                dui.value = resultado.datos.dui;
                nombre.value = resultado.datos.nombre;
                apellido.value = resultado.datos.apellido;
                telefono.value = resultado.datos.telefono;
                fecha.value = resultado.datos.fecha_nacimiento;
                nit.value = resultado.datos.nit;
                profesion.value = resultado.datos.profesion;
                direccion.value = resultado.datos.direccion;
                canton.value = resultado.datos.idcanton;


                btnGuardar.textContent = "Modificar";
                btnGuardar.dataset.id = resultado.datos.idsocio;
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