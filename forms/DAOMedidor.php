<?php
// Desactiva la salida de errores en pantalla para no romper el formato JSON
error_reporting(0);

// Indica explícitamente a JavaScript que la respuesta es un JSON
header('Content-Type: application/json; charset=utf-8');

// Variables de texto
$direccion = $_POST['direccion'] ?? '';
$referencia = $_POST['referencia'] ?? '';
$nmedidor = $_POST['nmedidor'] ?? '';
$inicio = $_POST['inicio'] ?? '';
$estado = $_POST['estado'] ?? '';
$opcion = $_POST['opcion'] ?? '';

// Variables numéricas: Las convertimos a entero explícitamente con (int)
// Esto evita el "Fatal error" en bind_param por conflicto de tipos (esperar int y recibir string vacío)
$canton = isset($_POST['canton']) ? (int)$_POST['canton'] : 0;
$ruta = isset($_POST['ruta']) ? (int)$_POST['ruta'] : 0;
$idcontrato = isset($_POST['idcontrato']) ? (int)$_POST['idcontrato'] : 0;
$idmedidor = isset($_POST['idmedidor']) ? (int)$_POST['idmedidor'] : 0;

require_once "../config/conexion.php";

if ($opcion == "guardar") {
    try {
        $sql = "INSERT INTO medidor (idcontrato, nmedidor, lectura_inicial, idcanton, idruta, direccion, referencia, estado) VALUES(?,?,?,?,?,?,?,?)";
        $stmt = $conexion->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Error al preparar consulta: " . $conexion->error);
        }

        $stmt->bind_param("issiisss", $idcontrato, $nmedidor, $inicio, $canton, $ruta, $direccion, $referencia, $estado);
        
        if ($stmt->execute()) {
            echo json_encode([
                "estado" => true,
                "mensaje" => "Datos Guardados Correctamente"
            ]);
        } else {
            // Si hay error (ej. número de medidor duplicado), lo devuelve ordenadamente
            echo json_encode([
                "estado" => false,
                "mensaje" => "Error al guardar: " . $stmt->error
            ]);
        }
        $stmt->close();
    } catch (Throwable $e) {
        echo json_encode([
            "estado" => false,
            "mensaje" => "Excepción: " . $e->getMessage()
        ]);
    }
}

elseif ($opcion == "modificar") {
    try {
        $sql = "UPDATE medidor set nmedidor=?, lectura_inicial=?, idcanton=?, idruta=?, direccion=?, referencia=?, estado=? WHERE idmedidor=?";
        $stmt = $conexion->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Error al preparar consulta: " . $conexion->error);
        }

        $stmt->bind_param("ssiisssi", $nmedidor, $inicio, $canton, $ruta, $direccion, $referencia, $estado, $idmedidor);
        
        if ($stmt->execute()) {
            echo json_encode([
                "estado" => true,
                "mensaje" => "Datos Modificados Correctamente"
            ]);
        } else {
            echo json_encode([
                "estado" => false,
                "mensaje" => "Error al modificar: " . $stmt->error
            ]);
        }
        $stmt->close();
    } catch (Throwable $e) {
        echo json_encode([
            "estado" => false,
            "mensaje" => "Excepción: " . $e->getMessage()
        ]);
    }
}

elseif ($opcion == "consultar") {
    try {
        $sql = "SELECT m.idmedidor, s.dui, s.nombre, s.apellido, c.ncontrato, m.nmedidor, m.estado, ru.nombre AS ruta
        FROM contrato AS c
        INNER JOIN socio AS s ON s.idsocio = c.idsocio
        INNER JOIN medidor AS m ON m.idcontrato = c.idcontrato
        INNER JOIN ruta AS ru ON ru.idruta = m.idruta
        ORDER BY c.ncontrato";

        $resultado = $conexion->query($sql);

        if (!$resultado) {
            throw new Exception("Error en la consulta: " . $conexion->error);
        }

        $registros = [];
        $correlativo = 1;
        while ($fila = $resultado->fetch_assoc()) {
            $registros[] = [
                'idmedidor' => $fila['idmedidor'],
                'dui' => $fila['dui'],
                'nombre' => $fila['nombre'],
                'apellido' => $fila['apellido'],
                'ncontrato' => $fila['ncontrato'],
                'nmedidor' => $fila['nmedidor'],
                'estado' => $fila['estado'],
                'ruta' => $fila['ruta'],
                'correlativo' => $correlativo++
            ];
        }

        echo json_encode($registros, JSON_UNESCAPED_UNICODE);
        $resultado->free();
    } catch (Throwable $e) {
        echo json_encode([
            "estado" => false,
            "mensaje" => "No se pudieron obtener los registros: " . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
}

// Cerrar conexión general si se abrió
if (isset($conexion) && $conexion instanceof mysqli) {
    $conexion->close();
}