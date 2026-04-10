<?php
require_once '../../conexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$codigo_ingresado = $data['codigo'] ?? '';

if (!$email || !$codigo_ingresado) {
    die(json_encode(["status" => "error", "message" => "Faltan datos"]));
}

// Buscamos usando el email
$stmt = $pdo->prepare("
    SELECT u.id_usuario, u.rol, e.nombre 
    FROM usuario u
    JOIN empleado e ON u.id_empleado = e.id_empleado
    WHERE u.email = ? 
    AND u.codigo_seguridad = ? 
    AND u.expiracion_codigo > NOW()
");
$stmt->execute([$email, $codigo_ingresado]);
$user = $stmt->fetch();

if ($user) {
    // Si coincide, actualizamos su estado
    $update = $pdo->prepare("
        UPDATE usuario 
        SET correo_verificado = 1, 
            codigo_seguridad = NULL, 
            expiracion_codigo = NULL 
        WHERE id_usuario = ?
    ");
    $update->execute([$user['id_usuario']]);

    echo json_encode([
        "status" => "success",
        "message" => "¡Correo verificado con exito!",
        "user" => [
            "nombre" => $user['nombre'],
            "rol" => $user['rol']
        ]
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Código incorrecto o expirado."]);
}
?>