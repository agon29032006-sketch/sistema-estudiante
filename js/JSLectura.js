//JSLectura.js
function validarCampo(campo) {
    const vacio = campo.value === null || campo.value.trim() === "";
    campo.classList.toggle("is-invalid", vacio);
    campo.classList.toggle("is-valid", !vacio);
    return !vacio;
}

const formulario = document.getElementById("formulario");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const nmedidor = document.getElementById("nmedidor");
const nombre = document.getElementById("nombre");
const lecturaAnterior = document.getElementById("lecturaAnterior");
const lecturaActual = document.getElementById("lecturaActual");
const fecha = document.getElementById("fecha");
const empleado = document.getElementById("empleado");
const aviso = document.getElementById("aviso");
const fechaVencimiento = document.getElementById("fechaVencimiento");
const fechaAnterior = document.getElementById("fechaAnterior");
const anio = document.getElementById("anio");
const mes = document.getElementById("mes");
const canton = document.getElementById("canton");
const ruta = document.getElementById("ruta");
const direccion = document.getElementById("direccion");

const campos = [lecturaActual, fecha, fechaVencimiento];

if (formulario) {
    ///////////////////// VALIDACION DE CAMPOS VACIOS
    campos.forEach(function (campo) {
        campo.addEventListener("blur", function () {
            validarCampo(campo);
        });
    });

    ///////////////////// PASAR TODO A MAYUSCULAS
    const campos1 = [aviso];

    campos1.forEach(function (campo) {
        campo.addEventListener("input", function () {
            campo.value = campo.value.toUpperCase();
            validarCampo(campo);
        });
    });

    ///////////////////// N° MEDIDOR SOLO NUMEROS
    nmedidor.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
    });

    ///////////////////// FECHAS, NO PUEDEN SER FUTURAS
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = String(hoy.getMonth() + 1).padStart(2, "0");
    const diaActual = String(hoy.getDate()).padStart(2, "0");

    const fechaActual = `${anioActual}-${mesActual}-${diaActual}`;

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

    ///////////////////// BUSQUEDA DE MEDIDOR (ENTER) - PARA OBTENER DATOS
    nmedidor.addEventListener("keydown", async function (e) {
        if (e.key !== "Enter") return;

        e.preventDefault();
        e.stopPropagation();

        try {
            const datos = new FormData();
            datos.append("opcion", "consultarConsumo");
            datos.append("nmedidor", nmedidor.value);

            Swal.fire({
                title: "Espere...",
                text: "Consultando",
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading()
            });

            const respuesta = await fetch("DAOLectura.php", {
                method: "POST",
                body: datos
            });

            if (!respuesta.ok) {
                throw new Error("Error HTTP: " + respuesta.status);
            }

            const resultado = await respuesta.json();

            Swal.close();

            if (resultado.estado) {
                nombre.value = resultado.datos.nombre;
                fechaAnterior.value = resultado.datos.fecha_lectura || "";
                lecturaAnterior.value = resultado.datos.lectura_anterior;
                canton.value = resultado.datos.canton;
                ruta.value = resultado.datos.ruta;
                direccion.value = resultado.datos.direccion;
                btnGuardar.dataset.id = resultado.datos.idmedidor;

                validarCampo(nombre);
                validarCampo(nmedidor);
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Poseidón",
                    text: "No se encontró el medidor"
                });
            }
        } catch (error) {
            Swal.close();
            console.error("Error al consultar el medidor:", error);
        }
    });

    ///////////////////// BOTON CANCELAR
    btnCancelar.addEventListener("click", function () {
        window.location.href = "lectura.php";
    });

    ///////////////////// BOTON GUARDAR
    btnGuardar.addEventListener("click", async function () {
        const nmedidorValido = validarCampo(nmedidor);
        const lecturaActualValido = validarCampo(lecturaActual);
        const fechaValido = validarCampo(fecha);
        const nombreValido = validarCampo(nombre);
        const empleadoValido = validarCampo(empleado);
        const fechaVencimientoValido = validarCampo(fechaVencimiento);
        const mesValido = validarCampo(mes);
        const anioValido = validarCampo(anio);

        if (btnGuardar.textContent.trim() == "Guardar") {

        if (nmedidorValido && lecturaActualValido && fechaValido && nombreValido &&
            empleadoValido && fechaVencimientoValido && mesValido && anioValido) {
                if(Number(lecturaActual.value) < Number(lecturaAnterior.value)) {
                    Swal.fire({
                        icon: "warning",
                        title: "Lectura Incorrecta",
                        text: "La lectura actual no puede ser menor que la anterior."
                    });
                    return;
                }
                else{

            try {
                const datos = new FormData(formulario);
                datos.append("opcion", "guardar");
                datos.append("idmedidor", btnGuardar.dataset.id || "");

                btnGuardar.disabled = true;
                btnGuardar.textContent = "Procesando...";

                // await hace que JavaScript ESPERE
                const respuesta = await fetch("DAOLectura.php", {
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
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Poseidón",
                        text: resultado.mensaje,
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        window.location.href = "lectura.php";
                    });
                } else {
                    Swal.fire({
                        position: "top-end",
                        icon: "error",
                        title: "Poseidón",
                        text: resultado.mensaje,
                        showConfirmButton: false,
                        timer: 2000
                    });
                }
            } catch (error) {
                console.error("Error al procesar:", error);
            } finally {
                btnGuardar.disabled = false;
                btnGuardar.textContent = "Guardar";
            }
        }
        }}
    });
}

///////////////////// PROCESA AL TERMINAR DE CARGAR LA PAGINA
document.addEventListener("DOMContentLoaded", async () => {

    ///// LLENAMOS EL SELECT DE AÑO
    if (anio) {
        const anioHoy = new Date().getFullYear();
        anio.innerHTML = '<option value="">[Seleccion]</option>';

        for (let a = anioHoy + 1; a >= anioHoy - 5; a--) {
            const opcion = document.createElement("option");
            opcion.value = a;
            opcion.textContent = a;
            anio.appendChild(opcion);
        }

        anio.value = anioHoy; // año actual por defecto
    }

    ///// LLENAMOS EL SELECT DE EMPLEADOS (LECTORES)
    try {
        const datos = new FormData();
        datos.append("opcion", "consultarLectores");

        const respuesta = await fetch("DAOContrato.php", {
            method: "POST",
            body: datos
        });

        if (!respuesta.ok) {
            throw new Error("Error HTTP: " + respuesta.status);
        }

        const resultado = await respuesta.json();

        if (empleado && Array.isArray(resultado)) {
            empleado.innerHTML = '<option value="">[SELECCIONE]</option>';

            resultado.forEach(emp => {
                const opcion = document.createElement("option");
                opcion.value = emp.idempleado;
                opcion.textContent = emp.nombre;
                empleado.appendChild(opcion);
            });
        }
    } catch (error) {
        console.error("Error cargando empleados:", error);
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