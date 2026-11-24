<?php

$opcion = $_POST['opcion'] ?? '';

if ($opcion == "consultar") {
    require_once "../config/conexion.php";

    try {
        $sql = "SELECT re.nrecibo,ca.nombre,
        ru.nombre AS nombreRuta,
        re.idrecibo AS idrecibos,
        me.nmedidor,
        CONCAT(co.mes, '-', co.anio) AS periodo,
        co.fecha_lectura,
        co.fecha_vencimiento,
        co.lectura_actual,
        co.lectura_anterior,
        (co.lectura_actual - co.lectura_anterior) AS metros,
        re.monto
FROM recibos AS re
INNER JOIN consumo AS co
    ON re.idconsumo=co.idconsumo
INNER JOIN medidor AS me
    ON me.idmedidor=co.idmedidor
INNER JOIN ruta AS ru
    ON ru.idruta=me.idruta
INNER JOIN canton AS ca
    ON ca.idcanton=me.idcanton
    WHERE re.estado='PENDIENTE'";    

        $stmt = $conexion->prepare($sql);
        $stmt->execute();

        $resultado = $stmt->get_result();

        $registros = [];
        $correlativo = 1;

        while ($fila = $resultado->fetch_assoc()) {
            $registros[] = [
                'nrecibo'           => $fila['nrecibo'],
                'nmedidor'          => $fila['nmedidor'],
                'idrecibos'         => $fila['idrecibos'],
                'periodo'           => $fila['periodo'],
                'fecha_lectura'     => date('d-m-Y', strtotime($fila['fecha_lectura'])),
                'fecha_vencimiento' => date('d-m-Y', strtotime($fila['fecha_vencimiento'])),
                'lectura_actual'    => $fila['lectura_actual'],
                'lectura_anterior'  => $fila['lectura_anterior'],
                'metros'            => $fila['metros'],
                'monto'             => "$" . number_format($fila['monto'], 2, ".", ","),
                'nombreCanton'      => $fila['nombre'],
                'nombreRuta'        => $fila['nombreRuta']
            ];
        }
        echo json_encode(
            $registros,
            JSON_UNESCAPED_UNICODE
        );

        $resultado->free();
        $stmt->close();
    } catch (Throwable $e) {
        error_log("DAORecibos consultar: " . $e->getMessage());
        echo json_encode([
            "mensaje" => "Error al consultar los recibos: " . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
}


if ($opcion == 'generar') {

    require_once "../config/conexion.php";
    //header('Content-Type: application/json; charset=utf-8');

    $recibos = json_decode($_POST['recibos'] ?? '', true);

    if (!is_array($recibos) || empty($recibos)) {
        echo json_encode([
            "estado" => false,
            "mensaje" => "No hay recibos seleccionados"
        ]);
        exit;
    }

    $fechaGeneracion = date("Y-m-d H:i:s");
    $resultado = [];

    try {
        // Iniciar la transacción
        $conexion->begin_transaction();

        // Bloquear correlativo
        $sql = "SELECT prefijo, ultimo
                FROM tiraje
                WHERE estado = 'ACTIVO'
                FOR UPDATE";

        $consulta = $conexion->query($sql);

        // Comprobar que exista un único tiraje activo
        if ($consulta->num_rows != 1) {
            throw new Exception(
                "Debe existir exactamente un tiraje activo"
            );
        }

        $fila = $consulta->fetch_assoc();

        $nuevoNumero = (int)$fila['ultimo'];
        $prefijo = $fila['prefijo'];

        // Preparar INSERT una sola vez
        $sql = "INSERT INTO recibos
                (idconsumo, nrecibo, fecha_generacion,
                 metros, precio_unitario, monto, pagado, pendiente, estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $conexion->prepare($sql);  

        foreach ($recibos as $item) {

            $idconsumo = (int)$item['idconsumo'];
            $metros = (float)$item['metros'];
            //$precio_unitario = (float)$item['precio_unitario'];

            $monto = (float) str_replace(['$', ','], '', $item['monto']); //Elimina $ y comas de los miles 1000
            $precio_unitario = (float) str_replace(['$', ','], '', $item['precio_unitario']); //Elimina $ y comas de los miles

            $pagado = 0;
            $estado = "PENDIENTE";

            // Incrementar número por cada recibo
            $nuevoNumero++;

            // Formato 00001
            $numeroFormateado = str_pad($nuevoNumero, 5, '0', STR_PAD_LEFT);

            $nrecibo = $prefijo . "-" . $numeroFormateado;

            $stmt->bind_param("issidddds", $idconsumo, $nrecibo, $fechaGeneracion, $metros, $precio_unitario, $monto,
            $pagado, $monto, $estado);

            if (!$stmt->execute()) {
                throw new Exception(
                    "Error al generar recibo: ".$nrecibo
                );
            }

            $resultado[] = [
                "idconsumo" => $idconsumo,
                "nrecibo" => $nrecibo,
                "metros" => $metros,
                "monto" => $monto
            ];
        }

        $stmt->close();

        // Actualizar último número generado
        $sql = "UPDATE tiraje
                SET ultimo = ?
                WHERE estado = 'ACTIVO'";

        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $nuevoNumero);
        $stmt->execute();
        $stmt->close();

        // Confirmar transacción
        $conexion->commit();

        echo json_encode([
            "estado" => true,
            "mensaje" => "Recibos generados satisfactoriamente. Total Generados: " . count($resultado),
            "total" => count($resultado),
            "recibos" => $resultado
        ]);
    } catch (Throwable $e) {

        $conexion->rollback();

        echo json_encode([
            "estado" => false,
            "mensaje" => $e->getMessage()
        ]);
    }
}
