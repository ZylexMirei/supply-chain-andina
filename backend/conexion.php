<?php
function loadEnvFromFile(string $filePath): void
{
    if (!is_file($filePath) || !is_readable($filePath)) {
        return;
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#')) {
            continue;
        }

        $parts = explode('=', $trimmed, 2);
        if (count($parts) !== 2) {
            continue;
        }

        $key = trim($parts[0]);
        $value = trim($parts[1]);
        if ($key === '' || getenv($key) !== false) {
            continue;
        }

        if (
            (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
            (str_starts_with($value, "'") && str_ends_with($value, "'"))
        ) {
            $value = substr($value, 1, -1);
        }

        putenv("$key=$value");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

loadEnvFromFile(__DIR__ . '/.env');

$allowedOrigin = getenv('APP_ALLOWED_ORIGIN') ?: 'http://localhost:5173';
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($requestOrigin && $requestOrigin === $allowedOrigin) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
}
header("Vary: Origin");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Content-Type: application/json');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function jsonResponse(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

$host = getenv('DB_HOST') ?: 'localhost';
$db = getenv('DB_NAME') ?: 'supply_chain_db';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';

define('SMTP_USER', getenv('SMTP_USER') ?: '');
define('SMTP_PASS', getenv('SMTP_PASS') ?: '');

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    error_log('DB connection failed: ' . $e->getMessage());
    jsonResponse(["status" => "error", "message" => "Error de conexión con la base de datos."], 500);
}
?>