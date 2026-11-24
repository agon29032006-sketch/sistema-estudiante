<?php
$nombre = $_POST['nombre'] ?? '';
$descripcion = $_POST['descripcion'] ?? '';

$idruta = $_POST['idruta'] ?? '';
$opcion = $_POST['opcion'] ?? '';

if ($opcion == "guardar") {
    require_once "../config/conexion.php";

    //$clave = password_hash($password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO ruta (nombre, descripcion) VALUES(?,?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ss", $nombre, $descripcion);
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

    $sql = "UPDATE ruta set nombre=?, descripcion=? WHERE idruta=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssi", $nombre, $descripcion, $idruta);
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

    $sql = "DELETE FROM ruta WHERE idruta=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $idruta);
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
        $sql = "SELECT idruta, nombre, descripcion
                FROM ruta
                ORDER BY nombre";

        $resultado = $conexion->query($sql);

        if (!$resultado) {
            throw new Exception("Error al consultar los registros");
        }
        $rutas = [];

        while ($fila = $resultado->fetch_assoc()) {
            //$empleados[] = $fila;
            $rutas[] = [
                'idruta' => $fila['idruta'],
                'nombre' => $fila['nombre'],
                'descripcion' => $fila['descripcion'],

            ];
        }

        echo json_encode(
            $rutas,
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

    $sql = "SELECT idruta, nombre, descripcion FROM ruta WHERE idruta=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $idruta);

    $stmt->execute();

    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $datos = $resultado->fetch_assoc();
        echo json_encode([
            "estado" => true,
            "datos" => [
                "idruta" => $datos["idruta"],
                "nombre" => $datos["nombre"],
                "descripcion" => $datos["descripcion"],

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
if ($opcion == "consultarRutas") {

    $idempleado = $_POST['idempleado'] ?? '';

    require_once "../config/conexion.php";

    try {
        $sql = "SELECT r.idruta, r.nombre, er.idempleado_ruta
                FROM ruta AS r
                INNER JOIN empleado_ruta AS er
                 ON r.idruta = er.idruta
                WHERE er.idempleado =? 
                ORDER BY r.nombre";

        $html = $conexion->prepare($sql);
        $html->bind_param("i", $idempleado);
        $html->execute();

        $resultado = $html->get_result();

        $rutas = [];

        if (!$resultado) {
            throw new Exception("Error al consultar los registros");
        }
        $rutas = [];

        while ($fila = $resultado->fetch_assoc()) {
            //$empleados[] = $fila;
            $rutas[] = [
                'idempleado_ruta' => $fila['idempleado_ruta'],
                'nombre' => $fila['nombre'],
            ];
        }

        echo json_encode([
            'estado' => true,
            'datos' => $rutas],
            JSON_UNESCAPED_UNICODE
        );

        $resultado->free();
        $html->close();
        $conexion->close();
    } catch (Throwable $e) {
        http_response_code(500);

        echo json_encode([
            "mensaje" => "No se pudieron obtener los registros"
        ], JSON_UNESCAPED_UNICODE);
    }
}