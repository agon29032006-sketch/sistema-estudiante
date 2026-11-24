<?php

$opcion = $_POST['opcion'] ?? '';

if ($opcion == "consultar") {
    require_once "../config/conexion.php";

    try {

        $sql="SELECT
            ca.nombre,
            ru.nombre AS nombreRuta,
            c.idconsumo,
            m.nmedidor,
            CONCAT(c.mes, '-', c.anio) AS periodo,
            c.fecha_lectura,
            c.fecha_vencimiento,
            c.lectura_actual,
            c.lectura_anterior,

            (c.lectura_actual - c.lectura_anterior) AS metros,

            t.precio AS precio_unitario,

            CASE
                WHEN t.tipo_cobro = 'FIJO' THEN t.precio

                WHEN t.tipo_cobro = 'POR_METRO' THEN
                    (c.lectura_actual - c.lectura_anterior) * t.precio
            END AS monto,
            t.tipo_cobro,
            c.estado
        
        FROM medidor AS m

        INNER JOIN canton AS ca
            ON ca.idcanton = m.idcanton
        
        INNER JOIN ruta AS ru
            ON ru.idruta = m.idruta
            
        LEFT JOIN consumo AS c
            ON c.idmedidor = m.idmedidor

        LEFT JOIN tarifa AS t
            ON t.idtarifa = (
                SELECT t2.idtarifa
                FROM tarifa AS t2
                WHERE (c.lectura_actual - c.lectura_anterior)
                    BETWEEN t2.desde AND t2.hasta
                ORDER BY t2.desde DESC
                LIMIT 1
            )
            
        WHERE c.idconsumo IS NOT NULL
          AND NOT EXISTS (
            SELECT 1
            FROM recibos AS r
            WHERE r.idconsumo = c.idconsumo
        );";

        $stmt = $conexion->prepare($sql);
        $stmt->execute();

        $resultado = $stmt->get_result();

        $registros = [];
        $correlativo = 1;

        while ($fila = $resultado->fetch_assoc()) {
            $registros[] = [
                'nmedidor'      => $fila['nmedidor'],
                'idconsumo'           => $fila['idconsumo'],
                'periodo'             => $fila['periodo'],
                'fecha_lectura'       => date('d-m-Y', strtotime($fila['fecha_lectura'])),
                'fecha_vencimiento'   => date('d-m-Y', strtotime($fila['fecha_vencimiento'])),
                'lectura_actual'      => $fila['lectura_actual'],
                'lectura_anterior'    => $fila['lectura_anterior'],
                'metros'              => $fila['metros'],
                'estado'              => $fila['estado'],
                'monto'               => "$" . number_format($fila['monto'], 2, ".", ","),
                'nombreCanton'        => $fila['nombre'],
                'nombreRuta'          => $fila['nombreRuta'],
                'precio_unitario'     => "$" . number_format($fila['precio_unitario'], 2, ".", ",")
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

if ($opcion == 'imprimir') {

    require_once "../config/conexion.php";

    try {
        $recibos = json_decode($_POST['recibos'], true);

        if (empty($recibos)) {
            throw new Exception("No se recibieron recibos.");
        }

        $informacion = [];

        foreach ($recibos as $item) {

            $idrecibos = (int)$item['idrecibos'];

            // Consultar información completa del recibo
            $sql = "SELECT concat(socio.nombre,' ',socio.apellido) as nombreSocio,
            medidor.direccion,
            recibos.nrecibo,
            canton.nombre AS nombreCanton,
            ruta.nombre AS nombreRuta,
            recibos.idrecibo AS idrecibos,
            medidor.nmedidor,
            CONCAT(consumo.mes, '-', consumo.anio) AS periodo,
            DATE_FORMAT(consumo.fecha_lectura, '%d/%m/%Y') AS fecha_lectura,
            DATE_FORMAT(consumo.fecha_vencimiento, '%d/%m/%Y') as fecha_vencimiento,
            consumo.lectura_actual,
            consumo.lectura_anterior,
            (consumo.lectura_actual - consumo.lectura_anterior) AS metros,
            recibos.monto,
            recibos.precio_unitario
        FROM recibos
        INNER JOIN consumo
            ON recibos.idconsumo=consumo.idconsumo
        INNER JOIN medidor
            ON medidor.idmedidor=consumo.idmedidor
        INNER JOIN ruta
            ON ruta.idruta=medidor.idruta
        INNER JOIN canton
            ON canton.idcanton=medidor.idcanton
        INNER JOIN contrato
            ON medidor.idcontrato=contrato.idcontrato
        INNER JOIN socio AS socio
            ON contrato.idsocio=socio.idsocio
        where recibos.estado='PENDIENTE' AND recibos.idrecibo = ?";

            $stmt = $conexion->prepare($sql);
            $stmt->bind_param("i", $idrecibos);
            $stmt->execute();

            $resultado = $stmt->get_result();

            if ($fila = $resultado->fetch_assoc()) {
                $informacion[] = $fila;
            }

            $stmt->close();
        }

        echo json_encode([
            "estado" => true,
            "mensaje" => "Recibos consultados correctamente.",
            "recibos" => $informacion
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "estado" => false,
            "mensaje" => $e->getMessage()
        ]);
    }
}
