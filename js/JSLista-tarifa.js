
//////////PROCESA AL TERMINAR DE CARGAR LA PAGINA
document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("users-table");
    const filtro = document.getElementById("table-filter");
    const paginacion = document.getElementById("table-pagination");
    const btnImprimir = document.getElementById("print-table");

    const contador = document.getElementById("total-registros");

    if (!contenedor) return;
    const tabla = new Tabulator(contenedor, {
        locale: "es-es",
        langs: {
            "es-es": {
                "pagination": {
                    "page_size": "Registros por pÃ¡gina",
                    "first": "Primera",
                    "first_title": "Primera pÃ¡gina",
                    "last": "Ãšltima",
                    "last_title": "Ãšltima pÃ¡gina",
                    "prev": "Anterior",
                    "prev_title": "PÃ¡gina anterior",
                    "next": "Siguiente",
                    "next_title": "PÃ¡gina siguiente",
                    "all": "Todos",
                    "counter": {
                        "showing": "Mostrando",
                        "of": "de",
                        "rows": "registros",
                        "pages": "pÃ¡ginas"
                    }
                },
                "data": {
                    "loading": "Cargando...",
                    "error": "Error al cargar los datos"
                },
                "headerFilters": {
                    "default": "Filtrar columna..."
                }
            }
        },
        data: [],
        layout: "fitColumns",
        pagination: true,
        paginationElement: paginacion,
        paginationSize: 10,
        paginationSizeSelector: [10, 25, 50, 100],
        movableColumns: true,
        columns: [
    { title: "ID", field: "idtarifa", visible: false },
    { title: "Desde", field: "desde", hozAlign: "center" },
    { title: "Hasta", field: "hasta", hozAlign: "center" },
    { title: "Precio ($)", field: "precio", hozAlign: "right" },
    { title: "Tipo", field: "tipo" }
  
        ]
    });


    function actualizarContador() {
        const total = tabla.getDataCount("active");
        contador.textContent = `Total de Registros: ${total}`;
    }

    tabla.on("dataLoaded", actualizarContador);
    tabla.on("dataFiltered", actualizarContador);
    tabla.on("dataChanged", actualizarContador);
    tabla.on("dataFiltered", function (filters, filas) {
        contador.textContent = `Total de Registros: ${filas.length}`;
    });


    try {

        Swal.fire({
            title: "Cargando...",
            text: "Espere",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => Swal.showLoading()
        });

        const datos = new FormData();
        datos.append("opcion", "consultar");

        const respuesta = await fetch("DAOTarifa.php", {
            method: "POST",
            body: datos
        });

        if (!respuesta.ok) {
            throw new Error("Error HTTP: " + respuesta.status);
        }

        const registros = await respuesta.json();
        Swal.close();

        if (!Array.isArray(registros)) {
            throw new Error(registros.error || "Respuesta no valida");
        }

        await tabla.replaceData(registros);
        actualizarContador();

    } catch (error) {
        console.error("Error al cargar registros:", error);
        contenedor.textContent = "No se pudieron cargar los registros.";
    }

    if (filtro) {
        filtro.addEventListener("input", () => {
            const valor = filtro.value.trim();

            if (!valor) {
                tabla.clearFilter();
                return;
            }

            tabla.setFilter([
                [
               //pa buscar
                    { field: "dui", type: "like", value: valor },
                    { field: "nombre", type: "like", value: valor },
                    { field: "apellido", type: "like", value: valor },
                    { field: "ncontrato", type: "like", value: valor },
                    { field: "nmedidor", type: "like", value: valor },
                    { field: "estado", type: "like", value: valor }
                    

                ]
            ]);
        });
    }


    btnImprimir?.addEventListener("click", () => {
        alert("Filtro: " + filtro.value);
    });


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


