<?php
require_once '../../conexion.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jsonResponse(["status" => "error", "message" => "Método no permitido"], 405);
}

$data = json_decode(file_get_contents("php://input"), true) ?: [];
$email = trim($data['email'] ?? '');
$codigo = trim((string) ($data['codigo'] ?? ''));
$newPassword = (string) ($data['newPassword'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(["status" => "error", "message" => "Correo inválido"], 400);
}

if (!preg_match('/^\d{6}$/', $codigo)) {
    jsonResponse(["status" => "error", "message" => "Código inválido"], 400);
}

if (strlen($newPassword) < 6) {
    jsonResponse(["status" => "error", "message" => "La nueva contraseña debe tener al menos 6 caracteres."], 400);
}

$stmt = $pdo->prepare("
    SELECT id_usuario
    FROM usuario
    WHERE email = ?
      AND codigo_seguridad = ?
      AND expiracion_codigo > NOW()
    LIMIT 1
");
$stmt->execute([$email, $codigo]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    jsonResponse(["status" => "error", "message" => "Código incorrecto o expirado."], 401);
}

$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

$update = $pdo->prepare("
    UPDATE usuario
    SET password = ?,
        codigo_seguridad = NULL,
        expiracion_codigo = NULL
    WHERE id_usuario = ?
");
$update->execute([$hashedPassword, $user['id_usuario']]);

jsonResponse([
    "status" => "success",
    "message" => "Contraseña actualizada correctamente. Ahora puedes iniciar sesión."
]);
?>
