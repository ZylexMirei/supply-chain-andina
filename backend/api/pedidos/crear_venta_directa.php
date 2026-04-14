<?php
// backend/api/ventas.php
require_once '../../conexion.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jsonResponse(["status" => "error", "message" => "Método no permitido"], 405);
}

$data = json_decode(file_get_contents("php://input"), true) ?: [];

// Esperamos recibir una lista de productos a vender: [{"id_producto": 1, "cantidad": 80}]
$carrito = $data['carrito'] ?? [];

if (empty($carrito)) {
    jsonResponse(["status" => "error", "message" => "El carrito está vacío"], 400);
}

try {
    // INICIAMOS TRANSACCIÓN: Es "Todo o Nada" (Protege la base de datos)
    $pdo->beginTransaction();

    foreach ($carrito as $item) {
        $id = (int) ($item['id_producto'] ?? 0);
        $cantidad = (float) ($item['cantidad'] ?? 0);

        if ($id <= 0 || $cantidad <= 0) {
            throw new Exception('Carrito inválido.');
        }

        // 1. Verificamos si el producto existe
        $stmt = $pdo->prepare("SELECT nombre FROM producto WHERE id_producto = ?");
        $stmt->execute([$id]);
        $producto = $stmt->fetch();

        if (!$producto) {
            throw new Exception("Producto no encontrado: $id");
        }

        // 2. Descontamos de forma atómica para evitar sobreventa por concurrencia
        $update = $pdo->prepare("UPDATE producto SET stock_actual = stock_actual - ? WHERE id_producto = ? AND stock_actual >= ?");
        $update->execute([$cantidad, $id, $cantidad]);
        if ($update->rowCount() === 0) {
            throw new Exception("Stock insuficiente para: " . $producto['nombre']);
        }
    }

    // Si el bucle termina sin errores, CONFIRMAMOS los cambios en la BD
    $pdo->commit();
    jsonResponse(["status" => "success", "message" => "Venta procesada. El stock ha sido actualizado."]);

} catch (Exception $e) {
    // Si hubo un error (ej. falta de stock), DESHACEMOS cualquier cambio a medias
    $pdo->rollBack();
    error_log('Error procesando venta directa: ' . $e->getMessage());
    jsonResponse(["status" => "error", "message" => "No se pudo procesar la venta."], 409);
}
?>