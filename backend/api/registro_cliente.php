<?php
require_once __DIR__ . '/../conexion.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jsonResponse(["status" => "error", "message" => "Método no permitido"], 405);
}

$data = json_decode(file_get_contents("php://input"), true) ?: [];
$nombre = trim($data['nombre'] ?? '');
$email = trim($data['email'] ?? '');
$password = (string) ($data['password'] ?? '');
$telefono = trim($data['telefono'] ?? '');

if ($nombre === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 6) {
    jsonResponse(
        [
            "status" => "error",
            "message" => "Datos inválidos. Verifica nombre, correo y contraseña (mínimo 6 caracteres)."
        ],
        400
    );
}

try {
    $exists = $pdo->prepare("SELECT id FROM usuario WHERE email = ? LIMIT 1");
    $exists->execute([$email]);
    if ($exists->fetch()) {
        jsonResponse(["status" => "error", "message" => "Ese correo ya está registrado."], 409);
    }

    $rolStmt = $pdo->prepare("SELECT id FROM rol WHERE LOWER(nombre) LIKE '%cliente%' LIMIT 1");
    $rolStmt->execute();
    $rolId = (int) ($rolStmt->fetchColumn() ?: 0);
    if ($rolId <= 0) {
        $rolFallback = $pdo->prepare("SELECT id FROM rol ORDER BY id ASC LIMIT 1");
        $rolFallback->execute();
        $rolId = (int) ($rolFallback->fetchColumn() ?: 1);
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $insert = $pdo->prepare("
        INSERT INTO usuario (id_rol, nombre, email, password, codigo_otp)
        VALUES (?, ?, ?, ?, NULL)
    ");
    $insert->execute([$rolId, $nombre, $email, $hashed]);
    $idUsuario = (int) $pdo->lastInsertId();

    if ($telefono !== '') {
        try {
            $insertCliente = $pdo->prepare("INSERT INTO cliente (nombre, tipo) VALUES (?, ?)");
            $insertCliente->execute([$nombre, 'web']);
        } catch (Throwable $ignored) {
            // El registro en cliente es opcional y no debe bloquear el alta de usuario.
        }
    }

    jsonResponse(
        [
            "status" => "success",
            "message" => "Registro exitoso. Ya puedes iniciar sesión.",
            "user" => [
                "id" => $idUsuario,
                "nombre" => $nombre,
                "email" => $email
            ]
        ],
        201
    );
} catch (Throwable $e) {
    error_log('Registro cliente error: ' . $e->getMessage());
    jsonResponse(["status" => "error", "message" => "No se pudo registrar en este momento."], 500);
}

