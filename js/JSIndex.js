const cerrarSesion = document.getElementById("cerrarSesion");
const sumaMensual = document.getElementById("sumaMensual");
const pendientesPago = document.getElementById("pendientesPago");
const numeroSocio = document.getElementById("numeroSocio");

if (cerrarSesion) {
    cerrarSesion.addEventListener("click", function (event) {
        event.preventDefault();

        Swal.fire({
            title: "¿Cerrar sesión?",
            text: "¿Estás seguro que deseas salir del sistema?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, cerrar sesión",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = "salir.php";
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    if (!sumaMensual || !pendientesPago || !numeroSocio) {
        return;
    }

    try {
        const datos = new FormData();
        datos.append("opcion", "consulta");

        Swal.fire({
            title: "Consultando...",
            text: "Espere",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading()
        });

        const respuesta = await fetch("DAOIndex.php", {
            method: "POST",
            body: datos
        });

        if (!respuesta.ok) {
            throw new Error("Error HTTP: " + respuesta.status);
        }

        const resultado = await respuesta.json();
        Swal.close();
        if (!resultado.estado) {
            throw new Error(resultado.mensaje || "No se pudieron cargar los datos.");
        }

        sumaMensual.textContent = "$" + resultado.sumaMensual;
        pendientesPago.textContent = resultado.pendientesPago;
        numeroSocio.textContent = resultado.numeroSocio;
    } catch (error) {
        Swal.close();
        console.error("Error al cargar el resumen:", error);
        Swal.fire({
            icon: "error",
            title: "Error al cargar los datos",
            text: error.message
        });
    }
});
