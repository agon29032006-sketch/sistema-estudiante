function validarCampo(campo) {
    const vacio = campo.value.trim() === "";
    campo.classList.toggle("is-invalid", vacio);
    campo.classList.toggle("is-valid", !vacio);

    return !vacio;
}

const formulario = document.getElementById("formulario");
const btnGuardar = document.getElementById("btnGuardar");
const desde = document.getElementById("desde");
const hasta = document.getElementById("hasta");
const precio = document.getElementById("precio");
const tipo = document.getElementById("tipo");

const campos = [desde, hasta, precio, tipo];

if (formulario) {
    ////////////////////VALIDACION DE CAMPOS VACIOS

    campos.forEach(function (campo) {
        campo.addEventListener("blur", function () {
            validarCampo(campo);
        });
    });

    //////////////VALIDAR QUE EL SUELOD SEAN SOLO NUMEROS///////////////
    precio.addEventListener("input", function () {
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

    this.value = valor;
});

    /////////////////FECHAS, NO PUEDAN SER FUTURAS/////////////

  //////////DESDE Y HASTA SOLO NUMERO
desde.addEventListener("input", function () {
    // Permitir solo números y un punto decimal
    let valor = this.value.replace(/[^0-9]/g, "");
    this.value = valor;
});

hasta.addEventListener("input", function () {
    // Permitir solo números y un punto decimal
    let valor = this.value.replace(/[^0-9]/g, "");
    this.value = valor;
});

    //////////////BOTON CANCELAR///////
    btnCancelar.addEventListener("click", function () {
        window.location.href = "tarifa.php"
    });

 btnGuardar.addEventListener("click", async function () {
    const desdeValido = validarCampo(desde);
    const hastaValido = validarCampo(desde);
    const tipoValido = validarCampo(tipo);
    const precioValido = validarCampo(precio);


    if (btnGuardar.textContent.trim() == "Guardar") {

        if (desdeValido && hastaValido  && tipoValido && precioValido) {

            if (Number(hasta.value) < Number(desde.value)) {
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: "Poseidón",
                    text: "El rango no es correcto",
                    showConfirmButton: false,
                    timer: 1500
                });

            } else {        
         try {
                    const datos = new FormData(formulario);
                    datos.append("opcion", "guardar");
                     // datos.append("idmedidor", btnGuardar.dataset.id);
                    btnGuardar.disabled = true;
                    btnGuardar.textContent = "Procesando...";

                    // Enviar datos 
                    // await hace que JavaScript ESPERE
                    const respuesta = await fetch("DAOTarifa.php", {
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
 
    // LLENAR SELECT EMPLEADO (quien elabora la lectura: empleados con cargo LECTOR)
    try {
        const datos = new FormData();
        datos.append("opcion", "consultarLectores");
 
        const respuesta = await fetch("DAOEmpleado.php", { method: "POST", body: datos });
        if (!respuesta.ok) {
            throw new Error("Error HTTP: " + respuesta.status);
        }
 
        const resultado = await respuesta.json();
 
        empleado.innerHTML = '<option value="">[Seleccion]</option>';
        resultado.forEach(emp => {
            const opcion = document.createElement("option");
            opcion.value = emp.idempleado;
            opcion.textContent = emp.nombre;
            empleado.appendChild(opcion);
        });
    } catch (error) {
        console.error(error);
    }
 
    // LLENAR SELECT AÑO (el HTML lo trae vacío)
    const anioActual = new Date().getFullYear();
    anio.innerHTML = '<option value="">[Seleccion]</option>';
    for (let a = anioActual - 1; a <= anioActual + 1; a++) {
        const opcion = document.createElement("option");
        opcion.value = a;
        opcion.textContent = a;
        anio.appendChild(opcion);
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