<?php
require_once '../../conexion.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jsonResponse(["status" => "error", "message" => "Método no permitido"], 405);
}

$data = json_decode(file_get_contents("php://input"), true) ?: [];
$email = trim($data['email'] ?? '');
$codigo_ingresado = trim((string) ($data['codigo'] ?? ''));

if (!$email || !$codigo_ingresado) {
    jsonResponse(["status" => "error", "message" => "Faltan datos"], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^\d{6}$/', $codigo_ingresado)) {
    jsonResponse(["status" => "error", "message" => "Datos de verificación inválidos"], 400);
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

    jsonResponse([
        "status" => "success",
        "message" => "¡Correo verificado con exito!",
        "user" => [
            "nombre" => $user['nombre'],
            "rol" => $user['rol']
        ]
    ]);
} else {
    jsonResponse(["status" => "error", "message" => "Código incorrecto o expirado."], 401);
}
?>