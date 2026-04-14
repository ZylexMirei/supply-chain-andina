<?php
// backend/api/aprobar_pedido.php
require_once '../../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true) ?: [];
    $id_pedido = (int) ($data['id_pedido'] ?? 0);

    if ($id_pedido <= 0) {
        jsonResponse(["status" => "error", "message" => "Falta el ID del pedido"], 400);
    }

    try {
        $pdo->beginTransaction();

        // 1. Verificamos que el pedido exista y siga "Pendiente"
        $stmt = $pdo->prepare("SELECT estado FROM pedido WHERE id_pedido = ?");
        $stmt->execute([$id_pedido]);
        $pedido = $stmt->fetch();

        if (!$pedido || $pedido['estado'] !== 'Pendiente') {
            throw new Exception("El pedido no existe o ya fue procesado.");
        }

        // 2. Obtenemos los productos que el cliente quiere comprar
        $stmt_detalle = $pdo->prepare("SELECT id_producto, cantidad FROM detalle_pedido WHERE id_pedido = ?");
        $stmt_detalle->execute([$id_pedido]);
        $detalles = $stmt_detalle->fetchAll();

        // 3. Revisamos stock y lo descontamos
        $stmt_verificar = $pdo->prepare("SELECT nombre FROM producto WHERE id_producto = ?");
        $stmt_descontar = $pdo->prepare("UPDATE producto SET stock_actual = stock_actual - ? WHERE id_producto = ? AND stock_actual >= ?");

        foreach ($detalles as $item) {
            $id_producto = (int) $item['id_producto'];
            $cantidad_pedida = (float) $item['cantidad'];

            if ($cantidad_pedida <= 0) {
                throw new Exception('Cantidad inválida en detalle de pedido.');
            }

            $stmt_verificar->execute([$id_producto]);
            $producto = $stmt_verificar->fetch();
            if (!$producto) {
                throw new Exception("Producto no encontrado: $id_producto");
            }

            $stmt_descontar->execute([$cantidad_pedida, $id_producto, $cantidad_pedida]);
            if ($stmt_descontar->rowCount() === 0) {
                throw new Exception("Stock insuficiente para el producto: " . $producto['nombre']);
            }
        }

        // 4. Cambiamos el estado del pedido a "Aprobado"
        $stmt_actualizar_pedido = $pdo->prepare("UPDATE pedido SET estado = 'Aprobado' WHERE id_pedido = ?");
        $stmt_actualizar_pedido->execute([$id_pedido]);

        $pdo->commit();
        jsonResponse(["status" => "success", "message" => "Pedido #$id_pedido aprobado. El stock ha sido descontado."]);

    } catch (Exception $e) {
        $pdo->rollBack();
        error_log('Error aprobando pedido: ' . $e->getMessage());
        jsonResponse(["status" => "error", "message" => "No se pudo aprobar el pedido."], 409);
    }
} else {
    jsonResponse(["status" => "error", "message" => "Método no permitido"], 405);
}
?>