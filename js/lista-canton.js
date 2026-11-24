
//////////PROCESA AL TERMINAR DE CARGAR LA PAGINA
document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById("users-table");
    const filtro = document.getElementById("table-filter");
    const paginacion = document.getElementById("table-pagination");
    const btnImprimir = document.getElementById("print-table");

    const contador = document.getElementById("total-registros");

    if (!contenedor) return;
    const tabla = new Tabulator(contenedor, {
        data: [],
        layout: "fitColumns",
        pagination: true,
        paginationElement: paginacion,
        paginationSize: 10,
        paginationSizeSelector: [10, 25, 50, 100],
        movableColumns: true,
        columns: [

            { title: "ID", field: "idcanton" },
            { title: "Nombre", field: "nombre" },
           
            {
                title: "Acciones", field: "acciones", hozAlign: "center", headerSort: false,
                formatter: function () {
                    return `
                    <button type="button" class="btn btn-outline-secondary btn-editar">
                        <i class="bi bi-pencil" aria-hidden="true"> </i>
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-eliminar">
                        <i class="bi bi-trash" aria-hidden="true"> </i>
                    </button>
                    `;
                },
                cellClick: function (e, cell) {
                    const canton = cell.getRow().getData();

                    if (e.target.closest(".btn-editar")) {
                        location.href = "canton.php?id=" + canton.idcanton;
                    }

                    if (e.target.closest(".btn-eliminar")) {
                        Swal.fire({
                            title: "Poseidon",
                            text: "Confirmar Eliminacion de Registro?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Si, Confirmo"
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                try {

                                    const datos = new FormData();

                                    datos.append("idcanton", canton.idcanton);
                                    datos.append("opcion", "eliminar");

                                    const respuesta = await fetch("DAOcanton.php", {
                                        method: "POST",
                                        body: datos
                                    });

                                    //verificar respuesta

                                    if (!respuesta.ok) {
                                        throw new Error("Error de Comunicacion" + respuesta.status);
                                    }

                                    const resultado = await respuesta.json();


                                    if (resultado.estado) {
                                        Swal.fire({
                                            position: "top-end",
                                            icon: "success",
                                            title: "Poseidon",
                                            text: resultado.mensaje,
                                            showConfirmButton: false,
                                            timer: 1500
                                        }).then(() => {//cuando desaparece el mensaje se recarga la pagina
                                            window.location.href = "lista-canton.php";
                                        });
                                    }
                                } catch (error) {
                                    console.error(error);
                                }
                            }
                        });
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

        const respuesta = await fetch("DAOcanton.php", {
            method: "POST",
            body: datos
        });

        if (!respuesta.ok) {
            throw new Error("Error HTTP: " + respuesta.status);
        }

        const canton = await respuesta.json();
        Swal.close();

        if (!Array.isArray(canton)) {
            throw new Error(canton.error || "Respuesta no válida");
        }

        await tabla.replaceData(canton);
        actualizarContador();

    } catch (error) {
        Swal.close();
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

                    { field: "nombre", type: "like", value: valor },
                    
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