<?php

$nombre = $_POST['nombre'] ?? '';
$idcanton = $_POST['idcanton'] ?? '';
$opcion = $_POST['opcion'] ?? '';

if ($opcion == "guardar") {
    require_once "../config/conexion.php";

    //$clave = password_hash($password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO canton (nombre) VALUES(?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $nombre);
    if ($stmt->execute()) {
        echo json_encode([
            "estado" => true,
            "mensaje" => "Datos Guardados Correctamente"
        ]);
    } else {
        echo json_encode([
            "estado" => false,
            "mensaje" => "Error al guardar los datos"
        ]);
    }
    $stmt->close();
    $conexion->close();
}
if ($opcion == "modificar") {
    require_once "../config/conexion.php";

    $sql = "UPDATE canton set nombre=? WHERE idcanton=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("si", $nombre, $idcanton);
    if ($stmt->execute()) {
        echo json_encode([
            "estado" => true,
            "mensaje" => "Datos Modificados Correctamente"
        ]);
    } else {
        echo json_encode([
            "estado" => false,
            "mensaje" => "Error al modificar los datos"
        ]);
    }
    $stmt->close();
    $conexion->close();
}
if ($opcion == "eliminar") {

    require_once "../config/conexion.php";

    $sql = "DELETE FROM canton WHERE idcanton=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $idcanton);
    if ($stmt->execute()) {
        echo json_encode([
            "estado" => true,
            "mensaje" => "Datos Eliminados Correctamente"
        ]);
    } else {
        echo json_encode([
            "estado" => false,
            "mensaje" => "Error al eliminar los datos"
        ]);
    }
    $stmt->close();
    $conexion->close();
}
if ($opcion == "consultar") {
    require_once "../config/conexion.php";

    try {
        $sql = "SELECT  * FROM canton
                ORDER BY nombre";

        $resultado = $conexion->query($sql);

        if (!$resultado) {
            throw new Exception("Error al consultar los registros");
        }
        $registros = [];

        while ($fila = $resultado->fetch_assoc()) {
            //$empleados[] = $fila;
            $registros[] = [
                'idcanton' => $fila['idcanton'],
                'nombre' => $fila['nombre'],

            ];
        }

        echo json_encode(
            $registros,
            JSON_UNESCAPED_UNICODE
        );

        $resultado->free();
        $conexion->close();
    } catch (Throwable $e) {

        echo json_encode([
            "mensaje" => "No se pudieron obtener los registros"
        ], JSON_UNESCAPED_UNICODE);
    }
}
if ($opcion == "consultarIndividual") {
    require_once "../config/conexion.php";

    $sql = "SELECT * FROM canton WHERE idcanton=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $idcanton);

    $stmt->execute();

    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $datos = $resultado->fetch_assoc();
        echo json_encode([
            "estado" => true,
            "datos" => [
                "idcanton" => $datos["idcanton"],
                "nombre" => $datos["nombre"],
               
            ]
        ]);
    } else {
        echo json_encode([
            "estado" => false,
            "datos" => "No Existe"
        ]);
    }
    $stmt->close();
    $conexion->close();
}