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
        if ($key === '') {
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
loadEnvFromFile(dirname(__DIR__) . '/.env');

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

function envValue(string $key, string $default = ''): string
{
    $value = getenv($key);
    return ($value === false || $value === '') ? $default : $value;
}

$host = envValue('DB_HOST', 'localhost');
$port = envValue('DB_PORT', '3306');
$db = envValue('DB_NAME', 'supply_chain_db');
$user = envValue('DB_USER', 'root');
$pass = envValue('DB_PASS', '');

define('SMTP_USER', getenv('SMTP_USER') ?: '');
define('SMTP_PASS', getenv('SMTP_PASS') ?: '');

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    error_log(
        sprintf(
            'DB connection failed (host=%s port=%s db=%s user=%s): %s',
            $host,
            $port,
            $db,
            $user,
            $e->getMessage()
        )
    );
    jsonResponse(
        [
            "status" => "error",
            "message" => "Error de conexión con la base de datos. Verifica backend/.env (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS)."
        ],
        500
    );
}
?>