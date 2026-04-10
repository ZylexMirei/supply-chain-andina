<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../vendor/autoload.php';
require_once '../../conexion.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// 1. Buscamos al usuario
$stmt = $pdo->prepare("SELECT u.id_usuario, u.rol, u.correo_verificado, e.nombre FROM usuario u JOIN empleado e ON u.id_empleado = e.id_empleado WHERE u.email = ? AND u.password = ?");
$stmt->execute([$email, $password]);
$user = $stmt->fetch();

if ($user) {
    
    // --- CASO A: EL USUARIO AÚN NO HA VERIFICADO SU CORREO ---
    if ($user['correo_verificado'] == 0) {
        

        $codigo = rand(100000, 999999);
       
        $update = $pdo->prepare("
            UPDATE usuario 
            SET codigo_seguridad = ?, 
                expiracion_codigo = DATE_ADD(NOW(), INTERVAL 15 MINUTE) 
            WHERE id_usuario = ?
        ");
        $update->execute([$codigo, $user['id_usuario']]);
        
        // Enviamos el correo
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = SMTP_USER;
            $mail->Password   = SMTP_PASS;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            $mail->setFrom(SMTP_USER, 'Seguridad - Andina S.R.L.');
            $mail->addAddress($email, $user['nombre']);

            $mail->isHTML(true);
            $mail->Subject = 'Tu codigo de verificacion';
            $mail->Body    = "<h2>Hola {$user['nombre']}</h2>
                              <p>Tu código de seguridad es: <b>{$codigo}</b></p>
                              <p>Este código expirará en 15 minutos. No lo compartas con nadie.</p>";

            $mail->send();
        } catch (Exception $e) {}

        // Le avisamos al Frontend que tiene que mostrar la pantalla de "Ingresa tu código"
        echo json_encode([
            "status" => "pending_verification",
            "message" => "Te enviamos un código de 6 dígitos a tu correo.",
            "id_usuario" => $user['id_usuario'] // El frontend lo necesitará
        ]);
        exit(); // Detenemos el script aquí
    }

    // --- CASO B: EL USUARIO YA ESTÁ VERIFICADO (Login Normal) ---
    echo json_encode([
        "status" => "success",
        "message" => "Login exitoso",
        "user" => [
            "nombre" => $user['nombre'],
            "rol" => $user['rol']
        ]
    ]);

} else {
    echo json_encode(["status" => "error", "message" => "Usuario o clave incorrectos"]);
}
?>