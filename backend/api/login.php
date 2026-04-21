<?php
require_once __DIR__ . '/../conexion.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jsonResponse(["status" => "error", "message" => "Método no permitido"], 405);
}

$data = json_decode(file_get_contents("php://input"), true) ?: [];
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
    jsonResponse(["status" => "error", "message" => "Credenciales inválidas"], 400);
}

// 1. Buscamos al usuario en el esquema actual (usuario + rol)
$stmt = $pdo->prepare("
    SELECT
        u.id,
        COALESCE(r.nombre, 'cliente') AS rol,
        u.nombre,
        u.password
    FROM usuario u
    LEFT JOIN rol r ON r.id = u.id_rol
    WHERE u.email = ?
    LIMIT 1
");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && (password_verify($password, $user['password']) || hash_equals((string) $user['password'], (string) $password))) {
    if (hash_equals((string) $user['password'], (string) $password)) {
        $rehash = $pdo->prepare("UPDATE usuario SET password = ? WHERE id = ?");
        $rehash->execute([password_hash($password, PASSWORD_DEFAULT), $user['id']]);
    }

    // Login normal para esquema vigente.
    jsonResponse([
        "status" => "success",
        "message" => "Login exitoso",
        "user" => [
            "nombre" => $user['nombre'],
            "rol" => $user['rol']
        ]
    ]);

} else {
    jsonResponse(["status" => "error", "message" => "Usuario o clave incorrectos"], 401);
}
?>