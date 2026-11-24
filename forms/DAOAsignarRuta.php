<?php
$empleado = $_POST['empleado'] ?? '';
$ruta = $_POST['ruta'] ?? '';

$opcion = $_POST['opcion'] ?? '';

if ($opcion == "guardar") {
    require_once "../config/conexion.php";

    try {
        $sql = "INSERT INTO empleado_ruta (idempleado, idruta) VALUES(?,?)";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("ii", $empleado, $ruta);
        if ($stmt->execute()) {
            echo json_encode([
                "estado" => true,
                "mensaje" => "Datos Guardados Correctamente"
            ]);
        }
        $stmt->close();
    } catch (mysqli_sql_exception $e) {//cuando el empleado ya tiene asignada una ruta, arroja una exepcion.
        if ($e->getCode() == 1062) {
            echo json_encode([
                "estado" => false,
                "mensaje" => "Este empleado ya tiene asignada esa ruta"
            ]);
        } else {
            echo json_encode([
                "estado" => false,
                "mensaje" => "Ocurrio un error al guardar la Ruta"
            ]);
        }
    } finally {
        $conexion->close();
    }
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
    $idempleado_ruta = $_POST['idempleado_ruta'] ?? '';

    require_once "../config/conexion.php";

    $sql = "DELETE FROM empleado_ruta WHERE idempleado_ruta=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $idempleado_ruta);
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

        $conexion->close();
    } catch (Throwable $e) {

        echo json_encode([
            "mensaje" => "No se pudieron obtener los registros"
        ], JSON_UNESCAPED_UNICODE);
    }
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

        echo json_encode(
            [
                'estado' => true,
                'datos' => $rutas
            ],
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