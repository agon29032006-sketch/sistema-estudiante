function validarCampo(campo) {
    const vacio = campo.value.trim() === "";
    campo.classList.toggle("is-invalid", vacio);
    campo.classList.toggle("is-valid", !vacio);

    return !vacio;
}

const formulario = document.getElementById("formulario");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const nrecibo = document.getElementById("nrecibo");
const recibido = document.getElementById("recibido");
const fecha = document.getElementById("fecha");
const monto = document.getElementById("monto");
const pagado = document.getElementById("pagado");
const pendiente = document.getElementById("pendiente");
const estado = document.getElementById("estado");

const campos = [recibido, fecha];

if (formulario) {
    const urlParams = new URLSearchParams(window.location.search);
    const idDesdeURL = urlParams.get("id"); // Captura el "1" de ?id=1

    if (idDesdeURL) {
        cargarDatosPorID(idDesdeURL);
    }

    async function cargarDatosPorID(id) {
        try {
            const datos = new FormData();
            datos.append("opcion", "consultarPorID");
            datos.append("id_buscar", id);

            Swal.fire({
                title: "Cargando recibo...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const respuesta = await fetch("DAOPago.php", {
                method: "POST",
                body: datos
            });

            if (!respuesta.ok) throw new Error("Error HTTP");

            const resultado = await respuesta.json();
            Swal.close();

            if (resultado.estado) {
                // Llenamos TODOS los inputs, incluyendo el campo "Número Recibo"
                document.getElementById("nrecibo").value = resultado.datos.nrecibo; 
                document.getElementById("nombre").value = resultado.datos.nombre;
                document.getElementById("monto").value = resultado.datos.monto;
                document.getElementById("pagado").value = resultado.datos.pagado;
                document.getElementById("pendiente").value = resultado.datos.pendiente;
                document.getElementById("nmedidor").value = resultado.datos.nmedidor;
                document.getElementById("periodo").value = resultado.datos.periodo;

                setTimeout(() => { document.getElementById("recibido").focus(); }, 500);
                
                const estado = document.getElementById("estado");
                estado.classList.remove("estado-pendiente", "estado-pagado");
                
                if (resultado.datos.estado === "PENDIENTE") {
                    btnGuardar.disabled = false;
                    btnGuardar.dataset.id = resultado.datos.idrecibos;
                    estado.innerHTML = "PENDIENTE";
                    estado.classList.add("estado-pendiente");
                } else {
                    btnGuardar.disabled = true;
                    estado.innerHTML = "PAGADO";
                    estado.classList.add("estado-pagado");
                }
            } else {
                Swal.fire({ icon: "error", title: "Error", text: "No se encontró el recibo." });
            }
        } catch (error) {
            Swal.close();
            console.error(error);
        }
    }


    ////////////////////////VALIDACION DE CAMPOS VACIOS

    campos.forEach(function (campo) {
        campo.addEventListener("blur", function () {
            validarCampo(campo);
        });
    });

    ///////////FORMATO DE RECIBO

        nrecibo.addEventListener("input", function () {
            let valor = nrecibo.value.replace(/\D/g, "");
            valor = valor.substring(0, 9);
            if (valor.length > 4) {
                valor = valor.substring(0, 4) + "-" + valor.substring(4);
            }
            nrecibo.value = valor;
        });



        //////////////VALIDAR QUE EL SUELDO SEAN SOLO NUMEROS///////////
        recibido.addEventListener("input", function () {
            // Permitir solo números y un punto decimal
            let valor = this.value.replace(/[^0-9.]/g, "");

            // Evitar más de un punto decimal
            const partes = valor.split(".");
            if (partes.length > 2) {
                valor = partes[0] + "." + partes.slice(1).join("");
            }

            // Permitir solo un decimal
            const posicion = valor.indexOf(".");
            if (posicion !== -1) {
                valor = valor.substring(0, posicion + 3);
            }
            ///QUITAMOS EL SIMBOLO DE DOLAR Y LAS COMAS DE MILES
            /*let monto1 = parseFloat(monto.value.replace(/[\$,]/g, ""));
            
            */

            this.value = valor;
        });

        /////////////////FECHAS, NO PUEDAN SER FUTURAS///////////
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");
        const fechaActual = `${anio}-${mes}-${dia}`;

        fecha.max = fechaActual;
        fecha.value = fechaActual;

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

        ////////////////////////BUSQUEDA DE DUI- PARA REPERIDOS/////////

nrecibo.addEventListener("keyup", async function () {
    if (nrecibo.value.length === 10) {
        try {
            const datos = new FormData();
            datos.append("opcion", "consultarRECIBO");
            datos.append("nrecibo", nrecibo.value);

            Swal.fire({
                title: "Espere...",
                text: "Consultando",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading()
            });

            const respuesta = await fetch("DAOPago.php", {
                method: "POST",
                body: datos
            });

            if (!respuesta.ok) {
                console.error(respuesta.status);
                throw new Error("Error HTTP: " + respuesta.status);
            }

            const resultado = await respuesta.json();
            //console.log(resultado);

            Swal.close();

            if (resultado.estado) {
                nombre.value = resultado.datos.nombre;
                monto.value = resultado.datos.monto;
                pagado.value = resultado.datos.pagado;
                pendiente.value = resultado.datos.pendiente;
                nmedidor.value = resultado.datos.nmedidor;
                periodo.value = resultado.datos.periodo;

                setTimeout(() => {
                    recibido.focus();
                }, 1000);
                estado.classList.remove("estado-pendiente", "estado-pagado");
                if (resultado.datos.estado === "PENDIENTE") {
                    btnGuardar.disabled = false;
                    btnGuardar.dataset.id = resultado.datos.idrecibos;
                    estado.innerHTML = "PENDIENTE";
                    estado.classList.add("estado-pendiente");
                }else {
                    btnGuardar.disabled = true;
                    estado.innerHTML = "PAGADO";
                    estado.classList.add("estado-pagado");
                }

            }

        } catch (error) {
            Swal.close();
            nrecibo.focus();
        }
    }
});
////////////////////////BOTON CANCELAR/////

btnCancelar.addEventListener("click", function () {
    window.location.href = "pago.php";
});

////////////////////////BOTON GUARDAR ///////////////
btnGuardar.addEventListener("click", async function () {
    const nreciboValido = validarCampo(nrecibo);
    const recibidoValido = validarCampo(recibido);
    const nmedidorValido = validarCampo(nmedidor);
    const empleadoValido = validarCampo(empleado);
    const fechaValido = validarCampo(fecha);

    if (btnGuardar.textContent.trim() == "Guardar") {


        if (nreciboValido && recibidoValido && empleadoValido && fechaValido) {
            if (recibido.value > (pendiente.value)) {
                Swal.fire({
                    position: "top-end",
                    icon: "info",
                    title: "Poseidón",
                    text: "El PAGO Excede a lo adeudado",
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                try {
                    const datos = new FormData(formulario);
                    datos.append("opcion", "guardar");
                    datos.append("idrecibos", btnGuardar.dataset.id);

                    btnGuardar.disabled = true;
                    btnGuardar.textContent = "Procesando...";

                    // Enviar datos
                    // await hace que JavaScript ESPERE
                    const respuesta = await fetch("DAOPago.php", {
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
                        //todo bien
                        Swal.fire({
                            position: "top-end",
                            icon: "success",
                            title: "Poseidón",
                            text: resultado.mensaje,
                            showConfirmButton: false,
                            timer: 1500
                        }).then(() => {//cuando desaparece el mensaje se recarga la pagina
                            window.location.href = "pago.php";
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
                    btnGuardar.textContent = "Guardar";
                }
            }
        }
    }
    });
}
//////////////////////////////////////LIMPIAR TODOS LOS CAMPOS///////////
document.addEventListener("DOMContentLoaded", async () => {

    //LLENAMOS EL SELECT DE LOS CAJEROS (empleados con cargo CAJERO)
    try {
        const datos = new FormData();
        datos.append("opcion", "consultarCajeros");

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
        select.innerHTML = `<option value="">[Seleccione Cajero]</option>`;

        resultado.forEach(cajero => {
            const option = document.createElement("option");
            option.value = cajero.idempleado;
            option.textContent = cajero.nombre;

            select.appendChild(option);
        });

    } catch (error) {
        console.error(error);
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