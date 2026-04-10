<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

$host = 'localhost';
$db   = 'supply_chain_db';
$user = 'root';
$pass = 'Vivapoyo2006*'; 

// --- CONFIGURACIÓN GMAIL (SEGURIDAD SMTP) ---
define('SMTP_USER', 'segundosemestreproyecto00@gmail.com');
define('SMTP_PASS', 'ghmd yvjq gdqy bpaf'); // Tu código de 16 letras

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(["error" => "Fallo de conexión: " . $e->getMessage()]));
}
?>