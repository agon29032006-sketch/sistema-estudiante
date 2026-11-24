<?php

// Inicia la sesión para poder verificar los datos de acceso del usuario.
session_start();

// Convierte el rol almacenado en sesión en una lista limpia de roles.
$roles = array_map('trim', explode(',', $_SESSION['rol'] ?? ''));

// Verifica que el usuario haya iniciado sesión y tenga el rol de administrador.
if (empty($_SESSION['autenticado']) || !in_array('admin', $roles, true)) {
    http_response_code(403);
    echo json_encode([
        "estado" => false,
        "mensaje" => "No tienes permiso para consultar estos indicadores"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Obtiene la acción solicitada desde el formulario o petición AJAX.
$opcion = $_POST['opcion'] ?? '';

// Consulta los indicadores que se muestran en el panel principal.
if ($opcion == "consulta") {
    // Incluye la conexión a la base de datos.
    require_once "../config/conexion.php";

    try {
        // Consulta el total recaudado durante el mes actual.
        $sql = "SELECT IFNULL(SUM(monto), 0) AS total_mes
            FROM pagos
            WHERE fecha >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
            AND fecha < DATE_FORMAT(CURDATE() + INTERVAL 1 MONTH, '%Y-%m-01')";

        // Prepara y ejecuta la consulta del total mensual.
        $stmt = $conexion->prepare($sql);
        $stmt->execute();

        // Obtiene la primera fila del resultado.
        $resultado = $stmt->get_result();
        $fila = $resultado->fetch_assoc();

        // Formatea el monto con dos decimales y separadores visibles.
        $sumaMensual = number_format($fila['total_mes'], 2, ".", ",");

        // Consulta la cantidad de consumos pendientes de medidores activos.
        $sql = "SELECT COUNT(*) AS pendientesPago
            FROM consumo AS c
            INNER JOIN medidor AS m
                ON c.idmedidor = m.idmedidor
            WHERE m.estado = 'ACTIVO'
            AND c.estado = 'PENDIENTE'";

        // Prepara y ejecuta la consulta de pagos pendientes.
        $stmt = $conexion->prepare($sql);
        $stmt->execute();

        // Obtiene la cantidad de consumos pendientes.
        $resultado = $stmt->get_result();
        $fila = $resultado->fetch_assoc();
        $pendientesPago = $fila['pendientesPago'];

        // Consulta la cantidad total de socios registrados.
        $sql = "SELECT COUNT(*) AS numeroSocio
            FROM socio";

        // Prepara y ejecuta la consulta de socios.
        $stmt = $conexion->prepare($sql);
        $stmt->execute();

        // Obtiene la cantidad total de socios.
        $resultado = $stmt->get_result();
        $fila = $resultado->fetch_assoc();
        $numeroSocio = $fila['numeroSocio'];

        // Devuelve los indicadores al cliente en formato JSON.
        echo json_encode([
            "estado" => true,
            "sumaMensual" => $sumaMensual,
            "pendientesPago" => $pendientesPago,
            "numeroSocio" => $numeroSocio
        ], JSON_UNESCAPED_UNICODE);

        // Libera los datos obtenidos y cierra la sentencia preparada.
        $resultado->free();
        $stmt->close();

    // Captura cualquier error ocurrido durante las consultas.
    } catch (Throwable $e) {
        // Devuelve una respuesta de error sin mostrar detalles internos.
        echo json_encode([
            "estado" => false,
            "mensaje" => "No se pudieron obtener los registros"
        ], JSON_UNESCAPED_UNICODE);
    }
}