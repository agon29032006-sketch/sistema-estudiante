<?php
$dui = $_POST['dui'] ?? '';
$nombre = $_POST['nombre'] ?? '';
$apellido = $_POST['apellido'] ?? '';
$telefono = $_POST['telefono'] ?? '';
$fecha = $_POST['fecha'] ?? '';
$nit = $_POST['nit'] ?? '';
$direccion = $_POST['direccion'] ?? '';
$canton = $_POST['canton'] ?? '';
$profesion = $_POST['profesion'] ?? '';

$idsocio = $_POST['idsocio'] ?? '';

$opcion = $_POST['opcion'] ?? '';

if ($opcion == "guardar") {
    require_once "../config/conexion.php";

    $sql = "INSERT INTO socio (dui, nombre, apellido, telefono, fecha_nacimiento, profesion, idcanton, nit, direccion) 
    VALUES (?,?,?,?,?,?,?,?,?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssssssiss", $dui, $nombre, $apellido, $telefono, $fecha, $profesion, $canton, $nit, $direccion);
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

    $sql = "UPDATE socio set dui=?, nombre=?, apellido=?, telefono=?, fecha_nacimiento=?, profesion=?, idcanton=?, nit=?, direccion=?
     WHERE idsocio=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssssssissi", $dui, $nombre, $apellido, $telefono, $fecha, $profesion, $canton, $nit, $direccion, $idsocio);
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

    $sql = "DELETE FROM socio WHERE idsocio=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $idsocio);
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

if ($opcion == "consultarDUI") {
    require_once "../config/conexion.php";

    $sql = "SELECT * FROM socio WHERE dui=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $dui);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $fila = $resultado->fetch_assoc();
        echo json_encode([
            "estado" => true,
            "datos" => [
                'idsocio' => $fila['idsocio'],
                'dui' => $fila['dui'],
                'nombre' => $fila['nombre'],
                'apellido' => $fila['apellido'],
                'telefono' => $fila['telefono'],
                'fecha_nacimiento' => $fila['fecha_nacimiento'],
                'nit' => $fila['nit'],
                'profesion' => $fila['profesion'],
                'direccion' => $fila['direccion'],
                'idcanton' => $fila['idcanton']
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

// ESTA FUE LA OPCIÓN QUE SE CORRIGIÓ PARA EL CONTRATO
if ($opcion == "consultarDUIsocio") {
    require_once "../config/conexion.php";

    $sql = "SELECT idsocio, dui, CONCAT(nombre, ' ', apellido) AS nombreCompleto FROM socio WHERE dui=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $dui);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $fila = $resultado->fetch_assoc();
        echo json_encode([
            "estado" => true,
            "datos" => [
                'idsocio' => $fila['idsocio'],
                'dui' => $fila['dui'],
                'nombre' => $fila['nombreCompleto']
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

if ($opcion == "consultar") {
    require_once "../config/conexion.php";

    try {
        $sql = "SELECT * FROM socio ORDER BY nombre, apellido";
        $resultado = $conexion->query($sql);

        if (!$resultado) {
            throw new Exception("Error al consultar los registros");
        }

        $registros = [];
        while ($fila = $resultado->fetch_assoc()) {
            $registros[] = [
                'idsocio' => $fila['idsocio'],
                'dui' => $fila['dui'],
                'nombre' => $fila['nombre'],
                'apellido' => $fila['apellido'],
                'telefono' => $fila['telefono'],
                'fecha_nacimiento' => date('d-m-Y', strtotime($fila['fecha_nacimiento'])),
                'nit' => $fila['nit'],
                'profesion' => $fila['profesion'],
                'direccion' => $fila['direccion'],
                'idcanton' => getCanton($fila['idcanton'], $conexion)
            ];
        }

        echo json_encode($registros, JSON_UNESCAPED_UNICODE);
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

    $sql = "SELECT * FROM socio WHERE idsocio=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $idsocio);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $fila = $resultado->fetch_assoc();
        echo json_encode([
            "estado" => true,
            "datos" => [
                'idsocio' => $fila['idsocio'],
                'dui' => $fila['dui'],
                'nombre' => $fila['nombre'],
                'apellido' => $fila['apellido'],
                'telefono' => $fila['telefono'],
                'fecha_nacimiento' => $fila['fecha_nacimiento'],
                'nit' => $fila['nit'],
                'profesion' => $fila['profesion'],
                'direccion' => $fila['direccion'],
                'idcanton' => $fila['idcanton']
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

function getCanton($id, $conexion)
{
    $sql = "SELECT nombre FROM canton WHERE idcanton = ?";
    $html = $conexion->prepare($sql);
    $html->bind_param("i", $id);
    $html->execute();
    $resultado = $html->get_result();
    
    $canton = "";
    if ($fila = $resultado->fetch_assoc()) {
        $canton = $fila['nombre'];
    }
    $html->close();
    return $canton;
}
?>