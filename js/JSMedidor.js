function validarCampo(campo) {
    const vacio = campo.value.trim() === "";
    campo.classList.toggle("is-invalid", vacio);
    campo.classList.toggle("is-valid", !vacio);

    return !vacio;
}

const formulario = document.getElementById("formulario");
const btnGuardar = document.getElementById("btnGuardar");
const dui = document.getElementById("dui");
const nombre = document.getElementById("nombre");
const numero = document.getElementById("numero");
const fecha = document.getElementById("fecha");
const canton = document.getElementById("canton");
const ruta = document.getElementById("ruta");
const nmedidor = document.getElementById("nmedidor");
const direccion = document.getElementById("direccion");
const referencia = document.getElementById("referencia");
const inicio = document.getElementById("inicio");
const estado = document.getElementById("estado");

const campos = [direccion, referencia, nmedidor, inicio];

if (formulario) {
    ///////////////////////////////////// VALIDACION DE CAMPOS VACIOS

    campos.forEach(function (campo) {
        campo.addEventListener("blur", function () {
            validarCampo(campo);
        });
    });

    ///////////////////////////////////// PASAR TODO A MAYUSCULAS
    const campos1 = [direccion, referencia];

    campos1.forEach(function (campo) {
        campo.addEventListener("input", function () {
            campo.value = campo.value.toUpperCase();
            validarCampo(campo);
        });
    });

    ///////////////////////////////////// VALIDAR QUE EL SUELDO SEAN SOLO NUMEROS ///////////////////////////
    inicio.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
    });
}

btnCancelar.addEventListener("click", function () {
    window.location.href = "lista-contrato.php";
});

btnGuardar.addEventListener("click", async function () {
    const direccionValido = validarCampo(direccion);
    const referenciaValido = validarCampo(referencia);
    const nmedidorValido = validarCampo(nmedidor);
    const inicioValido = validarCampo(inicio);

    const cantonValido = canton.value !== "0";
    canton.classList.toggle("is-invalid", !cantonValido);
    canton.classList.toggle("is-valid", cantonValido);

    const rutaValido = ruta.value !== "0";
    ruta.classList.toggle("is-invalid", !rutaValido);
    ruta.classList.toggle("is-valid", rutaValido);

    const estadoValido = estado.value !== "0";
    estado.classList.toggle("is-invalid", !estadoValido);
    estado.classList.toggle("is-valid", estadoValido);

    if (btnGuardar.textContent.trim() == "Guardar") {
        if (direccionValido && referenciaValido && nmedidorValido && inicioValido && cantonValido && rutaValido && estadoValido) {
            try {
                const datos = new FormData(formulario);
                datos.append("opcion", "guardar");
                datos.append("idcontrato", btnGuardar.dataset.id);

                btnGuardar.disabled = true;
                btnGuardar.textContent = "Procesando...";

                // Enviar datos
                // await hace que JavaScript ESPERE
                const respuesta = await fetch("DAOMedidor.php", {
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
                    // todo salio bien
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Poseidón",
                        text: resultado.mensaje,
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {//cuando desaparece el mensaje se recarga la pagina
                        window.location.href = "lista-contrato.php";
                    });

                    limpiarCampos();
                } else {
                    Swal.fire({
                        position: "top-end",
                        icon: "error",
                        title: "Poseidón",
                        text: resultado.mensaje,
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {//cuando desaparece el mensaje se recarga la pagina
                        window.location.href = "lista-contrato.php";
                    });
                }
            } catch (error) {
                console.error("Error al procesar:", error);
            } finally {
                btnGuardar.disabled = false;
                btnGuardar.textContent = "Guardar";
            }
        }
    }

    if (btnGuardar.textContent.trim() == "Modificar") {

        if (direccionValido && referenciaValido && nmedidorValido && inicioValido && cantonValido && rutaValido && estadoValido) {
            try {
                const datos = new FormData(formulario);
                datos.append("opcion", "modificar");
                datos.append("idmedidor", btnGuardar.dataset.id);

                btnGuardar.disabled = true;
                btnGuardar.textContent = "Procesando...";

                // Enviar datos
                // await hace que JavaScript ESPERE
                const respuesta = await fetch("DAOMedidor.php", {
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
                        window.location.href = "lista-contrato.php";
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
                console.error("Error al procesar:", error);
            } finally {
                btnGuardar.disabled = true;
                btnGuardar.textContent = "Guardar";
            }
        }
    }
});

///////////////////////////////////// LIMPIAR TODOS LOS CAMPOS ///////////////////////////
function limpiarCampos() {
    campos.forEach(function (campo) {
        campo.value = "";
        campo.classList.remove("is-invalid");
        campo.classList.remove("is-valid");
    });
}

///////////////////////////////////// PROCESA AL TERMINAR DE CARGAR LA PAGINA
document.addEventListener("DOMContentLoaded", async () => {

    ///// LLENAMOS EL SELECT DE CARGOS
    try {
        const datos = new FormData();
        datos.append("opcion", "consultar");

        const respuesta = await fetch("DAOCanton.php", {
            method: "POST",
            body: datos
        });

        if (!respuesta.ok) {
            console.error(respuesta.status);
            throw new Error("Error HTTP: " + respuesta.status);
        }

        const resultado = await respuesta.json();

        const select = document.getElementById("canton");

        // Limpiar el select
        select.innerHTML = '<option value="0">[SELECCIONE]</option>';

        // Recorrer el arreglo de cargos
        resultado.forEach(canton => {
            const opcion = document.createElement("option");
            opcion.value = canton.idcanton;
            opcion.textContent = canton.nombre;

            select.appendChild(opcion);
        });
    } catch (error) {
    }

    /////////////////LLENAMOS EL SELECT DE RUTA
    try {
        const datos = new FormData();
        datos.append("opcion", "consultar");

        const respuesta = await fetch("DAORuta.php", {
            method: "POST",
            body: datos
        });

        if (!respuesta.ok) {
            console.error(respuesta.status);
            throw new Error("Error HTTP: " + respuesta.status);
        }

        const resultado = await respuesta.json();

        const select = document.getElementById("ruta");

        // Limpiar el select
        select.innerHTML = '<option value="0">[SELECCIONE]</option>';

        // Recorrer el arreglo de cargos
        resultado.forEach(ruta => {
            const opcion = document.createElement("option");
            opcion.value = ruta.idruta;
            opcion.textContent = ruta.nombre;

            select.appendChild(opcion);
        });
    } catch (error) {
    }


    /////////////////////////////////////
    // Obtener el ID de la URL
    const parametros = new URLSearchParams(window.location.search);
    const idcontrato = parametros.get("id");

    if (idcontrato) { //SI EXISTE EL ID, SE HACE LA BUSQUEDA
        try {
            const datos = new FormData();
            datos.append("opcion", "consultarMedidor");
            datos.append("idcontrato", idcontrato);

            Swal.fire({
                title: "Consultando...",
                text: "Espere",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading()
            });

            const respuesta = await fetch("DAOContrato.php", {
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
                nombre.value = resultado.datos.nombre + " " + resultado.datos.apellido;
                numero.value = resultado.datos.ncontrato;
                fecha.value = resultado.datos.fecha;
                canton.value = resultado.datos.idcanton;
                ruta.value = resultado.datos.idruta;
                direccion.value = resultado.datos.direccion;
                referencia.value = resultado.datos.referencia;
                nmedidor.value = resultado.datos.nmedidor;
                inicio.value = resultado.datos.lectura_inicial;
                estado.value = resultado.datos.estado;

                if (resultado.datos.nmedidor == null || resultado.datos.nmedidor === "") {
                    btnGuardar.textContent = "Guardar";
                    btnGuardar.dataset.id = idcontrato;
                    btnGuardar.disabled = false;
                } else {
                    btnGuardar.textContent = "Modificar";
                    btnGuardar.dataset.id = resultado.datos.idmedidor;
                    btnGuardar.disabled = false;
                }
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