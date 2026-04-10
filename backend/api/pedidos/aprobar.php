<?php
// backend/api/aprobar_pedido.php
require_once '../../conexion.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id_pedido = $data['id_pedido'] ?? null;

    if (!$id_pedido) {
        die(json_encode(["status" => "error", "message" => "Falta el ID del pedido"]));
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
        $stmt_verificar = $pdo->prepare("SELECT nombre, stock_actual FROM producto WHERE id_producto = ?");
        $stmt_descontar = $pdo->prepare("UPDATE producto SET stock_actual = stock_actual - ? WHERE id_producto = ?");

        foreach ($detalles as $item) {
            $id_producto = $item['id_producto'];
            $cantidad_pedida = $item['cantidad'];

            // Verificamos si hay suficiente stock físico
            $stmt_verificar->execute([$id_producto]);
            $producto = $stmt_verificar->fetch();

            if ($producto['stock_actual'] < $cantidad_pedida) {
                throw new Exception("Stock insuficiente para el producto: " . $producto['nombre']);
            }

            // Descontamos el stock
            $stmt_descontar->execute([$cantidad_pedida, $id_producto]);
        }

        // 4. Cambiamos el estado del pedido a "Aprobado"
        $stmt_actualizar_pedido = $pdo->prepare("UPDATE pedido SET estado = 'Aprobado' WHERE id_pedido = ?");
        $stmt_actualizar_pedido->execute([$id_pedido]);

        $pdo->commit();
        echo json_encode(["status" => "success", "message" => "Pedido #$id_pedido aprobado. El stock ha sido descontado."]);

    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Método no permitido"]);
}
?>