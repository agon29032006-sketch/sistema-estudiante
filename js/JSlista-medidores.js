/////////////////////////////////////////PROCESA AL TERMINAR DE CARGAR LA PAGINA
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
                    "page_size": "Registros por página",
                    "first": "Primera",
                    "first_title": "Primera página",
                    "last": "Última",
                    "last_title": "Última página",
                    "prev": "Anterior",
                    "prev_title": "Página anterior",
                    "next": "Siguiente",
                    "next_title": "Página siguiente",
                    "all": "Todos",
                    "counter": {
                        "showing": "Mostrando",
                        "of": "de",
                        "rows": "registros",
                        "pages": "páginas"
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
            { title: "Corr.", field: "correlativo", visible: true },
            { title: "ID", field: "idmedidor", visible: false },
            { title: "DUI", field: "dui" },
            { title: "Nombre", field: "nombre" },
            { title: "Apellido", field: "apellido" },
            { title: "N. Contrato", field: "ncontrato" },
            { title: "N° Medidor", field: "nmedidor" },
            { title: "Ruta", field: "ruta" },
            {
                title: "Estado", field: "estado", hozAlign: "center", headerSort: false,
                formatter: function (cell) {
                    const asignado = cell.getValue();

                    if (asignado === "ACTIVO") {
                        return `<span style="color: green; font-size: 20px;" title="Activo">
                                    <i class="bi bi-check-circle-fill"></i>
                                </span>`;
                    } else {
                        if (asignado === "SUSPENDIDO") {
                            return `<span style="color: #FFC107; font-size: 20px;" title="Suspendido">
                                        <i class="bi bi-x-circle-fill" style="color: #FFC107;"></i>
                                    </span>`;
                        } else {
                            return `<span style="color: red; font-size: 20px;" title="Inactivo">
                                        <i class="bi bi-x-circle-fill"></i>
                                    </span>`;
                        }
                    }
                }
            },
            {
                title: "Acciones", field: "acciones", hozAlign: "center", headerSort: false,
                formatter: function () {
                    return `
                        <select class="form-select form-select-sm accion-medidor">
                            <option value="">Seleccionar...</option>
                            <option value="historial">Historial</option>
                        </select>
                    `;
                },
                cellEdited: function (cell) {
                    console.log(cell.getValue());
                },

                cellClick: function (e, cell) {
                    if (e.target.matches(".accion-medidor")) {
                        e.target.onchange = function () {
                            const accion = this.value;
                            const medidor = cell.getRow().getData();
                            if (accion === "historial") {
                                //alert(""+medidor.idmedidor);
                                location.href = "historial.php?id=" + medidor.idmedidor;
                            }
                            this.value = "";
                        };
                    }
                }
            }
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

        const respuesta = await fetch("DAOMedidor.php", {
            method: "POST",
            body: datos
        });
        if (!respuesta.ok) {
            throw new Error("Error HTTP: " + respuesta.status);
        }

        const empleados = await respuesta.json();
        Swal.close();

        if (!Array.isArray(empleados)) {
            throw new Error(empleados.error || "Respuesta no válida");
        }

        await tabla.replaceData(empleados);
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