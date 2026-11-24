<?php
require_once "../config/conexion.php";

error_reporting(0);
ini_set('display_errors', 1);

// Captura unificada y ordenada de todas las variables POST / REQUEST
$opcion     = $_REQUEST["opcion"] ?? '';
$idcontrato = $_POST['idcontrato'] ?? $_REQUEST['idcontrato'] ?? '';
$idsocio    = $_POST['idsocio'] ?? '';
$idempleado1= $_POST['empleado1'] ?? '';
$cargo1     = $_POST['cargo1'] ?? '';
$idempleado2= $_POST['empleado2'] ?? '';
$cargo2     = $_POST['cargo2'] ?? '';
$fecha      = $_POST['fecha'] ?? '';
$prima      = $_POST['prima'] ?? '0';
$monto      = $_POST['monto'] ?? '0';

// Variables de empleado por si acaso se usan en otras opciones
$idempleado = $_POST['idempleado'] ?? '';
$dui        = $_POST['dui'] ?? '';
$nombre     = $_POST['nombre'] ?? '';
$apellido   = $_POST['apellido'] ?? '';


if ($opcion == "guardar") {
    $ncontrato = getNumeroContrato($conexion);

    $sql = "INSERT INTO contrato (ncontrato, fecha, monto, prima, idsocio, idempleado1, cargo1, idempleado2, cargo2) VALUES (?,?,?,?,?,?,?,?,?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssddiisis", $ncontrato, $fecha, $monto, $prima, $idsocio, $idempleado1, $cargo1, $idempleado2, $cargo2);
    
    if ($stmt->execute()) {
        echo json_encode([
            "estado" => true,
            "mensaje" => "Contrato Guardado Correctamente"
        ]);
    } else {
        echo json_encode([
            "estado" => false,
            "mensaje" => "Error al guardar en base de datos: " . $stmt->error
        ]);
    }
    $stmt->close();
    $conexion->close();
    exit;
}

if ($opcion == "modificar") {
    $sql = "UPDATE contrato SET fecha = ?, monto = ?, idsocio = ?, idempleado1 = ?, cargo1 = ?, idempleado2 = ?, cargo2 = ? WHERE idcontrato = ?";
    $stmt = $conexion->prepare($sql);
    
    // AQUÍ ESTÁ LA CORRECCIÓN: "sdiisisi" (8 letras exactas para las 8 variables)
    $stmt->bind_param("sdiisisi", $fecha, $monto, $idsocio, $idempleado1, $cargo1, $idempleado2, $cargo2, $idcontrato);

    if ($stmt->execute()) {
        echo json_encode([
            "estado" => true,
            "mensaje" => "Contrato Modificado Correctamente"
        ]);
    } else {
        echo json_encode([
            "estado" => false,
            "mensaje" => "Error al modificar: " . $stmt->error
        ]);
    }
    $stmt->close();
    $conexion->close();
    exit;
}

if ($opcion == "eliminar") {
    try {
        // No dejar eliminar si el contrato ya tiene un medidor asignado
        $sqlVerifica = "SELECT COUNT(*) AS total FROM medidor WHERE idcontrato = ?";
        $stmtVerifica = $conexion->prepare($sqlVerifica);
        $stmtVerifica->bind_param("i", $idcontrato);
        $stmtVerifica->execute();
        $filaVerifica = $stmtVerifica->get_result()->fetch_assoc();
        $stmtVerifica->close();

        if ($filaVerifica['total'] > 0) {
            echo json_encode([
                "estado" => false,
                "mensaje" => "No se puede eliminar: el contrato tiene un medidor asignado"
            ]);
            $conexion->close();
            exit;
        }

        $sql = "DELETE FROM contrato WHERE idcontrato = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $idcontrato);

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
    } catch (Throwable $e) {
        echo json_encode([
            "estado" => false,
            "mensaje" => "No se puede eliminar: el contrato tiene registros relacionados"
        ]);
    }
    $conexion->close();
    exit;
}

if ($opcion == "consultarDUI") {
    $sql = "SELECT dui FROM empleado WHERE dui=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $dui);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        echo json_encode([
            "estado" => true,
            "mensaje" => "Este Dui ya existe"
        ]);
    } else {
        echo json_encode([
            "estado" => false,
            "mensaje" => "a"
        ]);
    }
    $stmt->close();
    $conexion->close();
    exit;
}

if ($opcion == "consultar") {
    try {
        // Cambiamos s.idsocio por c.idsocio para que siempre muestre el ID real del contrato
        $sql = "SELECT c.idcontrato, c.idsocio, s.dui, s.nombre, s.apellido, c.ncontrato, c.fecha, c.monto, m.nmedidor,
                CASE WHEN m.idcontrato IS NOT NULL THEN 'Asignado' ELSE 'Sin asignar' END AS asignado
                FROM contrato AS c
                LEFT JOIN socio AS s ON c.idsocio = s.idsocio 
                LEFT JOIN medidor AS m ON m.idcontrato = c.idcontrato"; 

        $resultado = $conexion->query($sql);

        if (!$resultado) {
            throw new Exception("Error al consultar los contratos");
        }

        $registros = [];
        $correlativo = 1;

        while ($fila = $resultado->fetch_assoc()) {
            $registros[] = [
                'Correlativo' => $correlativo++,
                'idcontrato' => $fila['idcontrato'],
                'idsocio' => $fila['idsocio'],
                'dui' => $fila['dui'],
                'nombre' => $fila['nombre'],
                'apellido' => $fila['apellido'],
                'ncontrato' => $fila['ncontrato'],
                'fecha' => date('d-m-Y', strtotime($fila['fecha'])),
                'monto' => number_format($fila['monto'], 2, '.', ','),
                'asignado' => $fila['asignado']
            ];
        }

        echo json_encode($registros, JSON_UNESCAPED_UNICODE);
        $resultado->free();
        $conexion->close();
        exit;
    } catch (Throwable $e) {
        echo json_encode([
            "mensaje" => "No se pudieron obtener los registros"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

if ($opcion == "consultarIndividual") {
    $sql = "SELECT c.idcontrato, s.idsocio, s.dui, s.nombre, s.apellido,
                   c.ncontrato, c.fecha, c.monto, c.idempleado1,
                   c.cargo1, c.idempleado2, c.cargo2
            FROM contrato AS c
            INNER JOIN socio AS s
            ON s.idsocio = c.idsocio
            WHERE c.idcontrato = ?";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $idcontrato);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $fila = $resultado->fetch_assoc();

        echo json_encode([
            "estado" => true,
            "datos" => [
                'idcontrato' => $fila['idcontrato'],
                'idsocio' => $fila['idsocio'],
                'dui' => $fila['dui'],
                'nombre' => $fila['nombre'],
                'apellido' => $fila['apellido'],
                'ncontrato' => $fila['ncontrato'],
                'fecha' => $fila['fecha'],
                'monto' => $fila['monto'],
                'idempleado1' => $fila['idempleado1'],
                'cargo1' => $fila['cargo1'],
                'idempleado2' => $fila['idempleado2'],
                'cargo2' => $fila['cargo2']
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
    exit;
}

if ($opcion == "consultarLectores") {
    try {
        $sql = "SELECT e.idempleado, CONCAT(e.nombre,' ',e.apellido) as nombre
                FROM empleado AS e
                INNER JOIN cargo AS c ON c.idcargo=e.idcargo
                WHERE c.nombre ='LECTOR'
                ORDER BY e.nombre, e.apellido";

        $resultado = $conexion->query($sql);

        if (!$resultado) {
            throw new Exception("Error al consultar los registros");
        }
        $empleados = [];

        while ($fila = $resultado->fetch_assoc()) {
            $empleados[] = [
                'idempleado' => $fila['idempleado'],
                'nombre' => $fila['nombre'],
            ];
        }

        echo json_encode($empleados, JSON_UNESCAPED_UNICODE);
        $resultado->free();
        $conexion->close();
        exit;
    } catch (Throwable $e) {
        echo json_encode([
            "mensaje" => "No se pudieron obtener los registros"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

function getCanton($id, $conexion) {
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

function getNumeroContrato($conexion) {
    $sql = "SELECT MAX(ncontrato) AS numero FROM contrato";
    $resultado = $conexion->query($sql);
    $nuevoNumero = 0;

    if ($resultado && $fila = $resultado->fetch_assoc()) {
        $nuevoNumero = intval($fila['numero']);
    }

    return $nuevoNumero + 1;
}

if ($opcion == "consultarMedidor") {
    require_once "../config/conexion.php";

    $sql = "SELECT c.idcontrato, s.idsocio, 
            s.dui, 
            s.nombre, 
            s.apellido, 
            c.ncontrato, 
            c.fecha, 
            m.nmedidor, 
            m.lectura_inicial, 
            COALESCE(NULLIF(m.idcanton, ''), 0) AS idcanton, 
            COALESCE(NULLIF(m.idruta, ''), 0) AS idruta, 
            m.direccion, 
            m.referencia, m.idmedidor, m.estado 
            FROM contrato AS c 
            INNER JOIN socio AS s 
                ON s.idsocio = c.idsocio 
            LEFT JOIN medidor AS m 
                ON c.idcontrato = m.idcontrato 
            WHERE c.idcontrato = ?";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $idcontrato);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $fila = $resultado->fetch_assoc();
        echo json_encode([
            "estado" => true,
            "datos" => [
                'idcontrato' => $fila['idcontrato'],
                'idsocio' => $fila['idsocio'],
                'dui' => $fila['dui'],
                'nombre' => $fila['nombre'],
                'apellido' => $fila['apellido'],
                'direccion' => $fila['direccion'],
                'referencia' => $fila['referencia'],
                'idcanton' => $fila['idcanton'],
                'idruta' => $fila['idruta'],
                'nmedidor' => $fila['nmedidor'],
                'lectura_inicial' => $fila['lectura_inicial'],
                'ncontrato' => $fila['ncontrato'],
                'fecha' => $fila['fecha'],
                'idmedidor' => $fila['idmedidor'],
                'estado' => $fila['estado']
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
    exit;
}
?>