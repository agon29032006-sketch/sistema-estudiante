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
const empleado1 = document.getElementById("empleado1");
const empleado2 = document.getElementById("empleado2");
const cargo1 = document.getElementById("cargo1");
const cargo2 = document.getElementById("cargo2");
const numero = document.getElementById("numero");
const fecha = document.getElementById("fecha");
const monto = document.getElementById("monto");

const campos = [dui, nombre, empleado1, empleado2, cargo1, cargo2, numero, fecha, monto];

if (formulario) {
    //////////////////// VALIDACION DE CAMPOS VACIOS
    campos.forEach(function (campo) {
        if (campo) {
            campo.addEventListener("blur", function () {
                validarCampo(campo);
            });
        }
    });

    //////////////////// PASAR TODO A MAYUSCULAS (Cargos)
    const campos1 = [cargo1, cargo2];
    campos1.forEach(function (campo) {
        if (campo) {
            campo.addEventListener("input", function () {
                campo.value = campo.value.toUpperCase();
                validarCampo(campo);
            });
        }
    });

    ////////////////////////// FORMATO DE DUI //////////////
    if (dui) {
        dui.addEventListener("input", function () {
            let valor = dui.value.replace(/\D/g, "");
            valor = valor.substring(0, 9);
            if (valor.length > 8) {
                valor = valor.substring(0, 8) + "-" + valor.substring(8);
            }
            dui.value = valor;
        });
    }

    ///////////////////////////// VALIDAR QUE EL MONTO SEAN SOLO NUMEROS //////////////
    if (monto) {
        monto.addEventListener("input", function () {
            let valor = this.value.replace(/[^0-9.]/g, "");

            // Evitar más de un punto decimal
            const partes = valor.split(".");
            if (partes.length > 2) {
                valor = partes[0] + "." + partes.slice(1).join("");
            }

            // Permitir solo dos decimales
            const posicion = valor.indexOf(".");
            if (posicion !== -1) {
                valor = valor.substring(0, posicion + 3);
            }

            this.value = valor;
        });
    }

    //////////////////// BUSQUEDA DE DUI PARA REPETIDOS ///////////
    if (dui) {
        dui.addEventListener("keyup", async function () {
            if (dui.value.length === 10) {
                try {
                    const datos = new FormData();
                    datos.append("opcion", "consultarDUIsocio");
                    datos.append("dui", dui.value);

                    Swal.fire({
                        title: "Espere...",
                        text: "Consultando DUI",
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

                    Swal.close();

                    if (resultado.estado) {
                        dui.value = resultado.datos.dui;
                        nombre.value = resultado.datos.nombre;

                        // CAMBIO: ahora se guarda como idsocio (antes era "id" y se pisaba con el idcontrato)
                        btnGuardar.dataset.idsocio = resultado.datos.idsocio;
                        btnGuardar.disabled = false;
                        validarCampo(nombre);
                        validarCampo(dui);
                    }

                } catch (error) {
                    Swal.close();
                    console.error("Error al consultar DUI:", error);
                }
            }
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener("click", function () {
            window.location.href = "contrato.php";
        });
    }

    if (btnGuardar) {
        btnGuardar.addEventListener("click", async function () {
            const duiValido = validarCampo(dui);
            const nombreValido = validarCampo(nombre);
            const empleado1Valido = validarCampo(empleado1);
            const cargo1Valido = validarCampo(cargo1);
            const montoValido = validarCampo(monto);
            const fechaValido = validarCampo(fecha);

            if (duiValido && nombreValido && empleado1Valido && cargo1Valido && fechaValido && montoValido) {
                // El modo se decide por la URL (?id=...), no por el texto del botón
                const parametrosUrl = new URLSearchParams(window.location.search);
                const esModificacion = parametrosUrl.has("id");
                let guardadoOk = false;

                try {
                    const datos = new FormData(formulario);

                    datos.append("opcion", esModificacion ? "modificar" : "guardar");
                    datos.append("idsocio", btnGuardar.dataset.idsocio || "");

                    if (esModificacion) {
                        datos.append("idcontrato", parametrosUrl.get("id"));
                    }

                    btnGuardar.disabled = true;
                    btnGuardar.textContent = "Procesando...";

                    const respuesta = await fetch("DAOContrato.php", {
                        method: "POST",
                        body: datos
                    });

                    if (!respuesta.ok) {
                        throw new Error("Error HTTP: " + respuesta.status);
                    }

                    const resultado = await respuesta.json();

                    if (resultado.estado) {
                        guardadoOk = true;
                        await Swal.fire({
                            position: "top-end",
                            icon: "success",
                            title: "Poseidón",
                            text: resultado.mensaje,
                            showConfirmButton: false,
                            timer: 1500
                        });

                        if (esModificacion) {
                            window.location.href = "contrato.php";
                            return;
                        }
                        limpiarCampos();
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
                    console.error("Error al procesar:", error);
                } finally {
                    btnGuardar.textContent = esModificacion ? "Modificar" : "Guardar";
                    // Si se guardó uno nuevo, limpiarCampos() ya lo deshabilitó; si falló, lo dejamos habilitado
                    btnGuardar.disabled = guardadoOk && !esModificacion;
                }
            }
        });
    }
}

////////////////___ LIMPIAR TODOS LOS CAMPOS ___///////////
function limpiarCampos() {
    campos.forEach(function (campo) {
        if (campo) {
            campo.value = "";
            campo.classList.remove("is-invalid");
            campo.classList.remove("is-valid");
        }
    });
    if (btnGuardar) {
        btnGuardar.disabled = true;
        delete btnGuardar.dataset.idsocio;
    }
}

////////// PROCESA AL TERMINAR DE CARGAR LA PAGINA
document.addEventListener("DOMContentLoaded", async () => {

    // 1. LÓGICA DE LA FECHA (Bloquear fechas futuras)
    const inputFecha = document.getElementById("fecha");
    if (inputFecha) {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");
        const fechaActual = `${anio}-${mes}-${dia}`;

        inputFecha.max = fechaActual;
        if (!inputFecha.value) {
            inputFecha.value = fechaActual;
        }

        inputFecha.addEventListener("change", function () {
            if (this.value > fechaActual) {
                Swal.fire({
                    icon: "warning",
                    title: "Fecha inválida",
                    text: "No puedes seleccionar una fecha futura."
                });
                this.value = "";
            }
        });
    }

    // 2. LLENAR EL SELECT DEL CARGO
    try {
        const datosCargo = new FormData();
        datosCargo.append("opcion", "consultar");

        const respuestaCargo = await fetch("DAOcargo.php", {
            method: "POST",
            body: datosCargo
        });

        if (respuestaCargo.ok) {
            const resultadoCargo = await respuestaCargo.json();
            const selectCargo = document.getElementById("cargo");
            if (selectCargo) {
                selectCargo.innerHTML = `<option value="0">[SELECCIONE UN CARGO]</option>`;
                resultadoCargo.forEach(cargo => {
                    const option = document.createElement("option");
                    option.value = cargo.idcargo;
                    option.textContent = cargo.nombre;
                    selectCargo.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error("Error cargando cargos:", error);
    }

    // 3. LLENAR EL SELECT DE EMPLEADOS (Para empleado1 y empleado2)
    try {
        const datosEmp = new FormData();
        datosEmp.append("opcion", "consultar");

        const respuestaEmp = await fetch("DAOempleado.php", {
            method: "POST",
            body: datosEmp
        });

        if (respuestaEmp.ok) {
            const resultadoEmp = await respuestaEmp.json();
            const select1 = document.getElementById("empleado1");
            const select2 = document.getElementById("empleado2");

            if (select1) select1.innerHTML = `<option value="">[SELECCIONE]</option>`;
            if (select2) select2.innerHTML = `<option value="">[SELECCIONE]</option>`;

            resultadoEmp.forEach(empleado => {
                if (select1) {
                    const opt1 = document.createElement("option");
                    opt1.value = empleado.idempleado;
                    opt1.textContent = empleado.nombre + " " + empleado.apellido;
                    select1.appendChild(opt1);
                }
                if (select2) {
                    const opt2 = document.createElement("option");
                    opt2.value = empleado.idempleado;
                    opt2.textContent = empleado.nombre + " " + empleado.apellido;
                    select2.appendChild(opt2);
                }
            });
        }
    } catch (error) {
        console.error("Error cargando empleados:", error);
    }

    // 4. CONSULTAR INDIVIDUALMENTE SI EXISTE UN ID EN LA URL (Modificar)
    const parametros = new URLSearchParams(window.location.search);
    const idcontrato = parametros.get("id");

    if (idcontrato) {
        try {
            const datosInd = new FormData();
            datosInd.append("opcion", "consultarIndividual");
            datosInd.append("idcontrato", idcontrato);

            Swal.fire({
                title: "Consultando...",
                text: "Espere",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading()
            });

            const respuestaInd = await fetch("DAOContrato.php", {
                method: "POST",
                body: datosInd
            });

            if (!respuestaInd.ok) {
                throw new Error("Error HTTP: " + respuestaInd.status);
            }

            const resultadoInd = await respuestaInd.json();
            
            Swal.close();

            if (resultadoInd.estado) {
                dui.value = resultadoInd.datos.dui;
                
                nombre.value = resultadoInd.datos.nombre + " " + resultadoInd.datos.apellido;

                empleado1.value = resultadoInd.datos.idempleado1;
                empleado2.value = resultadoInd.datos.idempleado2;

                cargo1.value = resultadoInd.datos.cargo1;
                cargo2.value = resultadoInd.datos.cargo2;

                numero.value = resultadoInd.datos.ncontrato;
                fecha.value = resultadoInd.datos.fecha;
                monto.value = resultadoInd.datos.monto;

                validarCampo(dui);
                validarCampo(nombre);
                validarCampo(fecha);
                validarCampo(monto);

                btnGuardar.textContent = "Modificar";
                // CAMBIO: ahora van separados el id del socio y el del contrato
                btnGuardar.dataset.idsocio = resultadoInd.datos.idsocio;
                btnGuardar.dataset.idcontrato = resultadoInd.datos.idcontrato;
                btnGuardar.disabled = false;
                dui.disabled = true;
            }

        } catch (error) {
            Swal.close();
            console.error("Error al consultar el contrato:", error);
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

