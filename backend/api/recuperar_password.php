<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../vendor/autoload.php';
require_once '../../conexion.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jsonResponse(["status" => "error", "message" => "Método no permitido"], 405);
}

$data = json_decode(file_get_contents("php://input"), true) ?: [];
$email = trim($data['email'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(["status" => "error", "message" => "Correo inválido"], 400);
}

$stmt = $pdo->prepare("
    SELECT u.id_usuario, COALESCE(e.nombre, 'Usuario') AS nombre
    FROM usuario u
    LEFT JOIN empleado e ON u.id_empleado = e.id_empleado
    WHERE u.email = ?
    LIMIT 1
");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    jsonResponse(["status" => "error", "message" => "No existe una cuenta con ese correo."], 404);
}

$codigo = (string) random_int(100000, 999999);

$update = $pdo->prepare("
    UPDATE usuario
    SET codigo_seguridad = ?,
        expiracion_codigo = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
    WHERE id_usuario = ?
");
$update->execute([$codigo, $user['id_usuario']]);

$mail = new PHPMailer(true);
try {
    if (!SMTP_USER || !SMTP_PASS) {
        throw new Exception('SMTP no configurado');
    }

    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = SMTP_USER;
    $mail->Password = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom(SMTP_USER, 'Seguridad - Andina S.R.L.');
    $mail->addAddress($email, $user['nombre']);
    $mail->isHTML(true);
    $mail->Subject = 'Recuperación de contraseña';
    $mail->Body = "<h2>Hola {$user['nombre']}</h2>
                   <p>Recibimos una solicitud para recuperar tu contraseña.</p>
                   <p>Tu código de recuperación es: <b>{$codigo}</b></p>
                   <p>Este código expira en 15 minutos.</p>";

    $mail->send();
} catch (Exception $e) {
    error_log('Error enviando recuperación de contraseña: ' . $e->getMessage());
    jsonResponse(["status" => "error", "message" => "No se pudo enviar el correo de recuperación."], 500);
}

jsonResponse([
    "status" => "success",
    "message" => "Te enviamos un código de recuperación a tu correo."
]);
?>
