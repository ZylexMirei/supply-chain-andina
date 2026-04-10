<?php
// backend/api/ventas.php
require_once '../../conexion.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

// Esperamos recibir una lista de productos a vender: [{"id_producto": 1, "cantidad": 80}]
$carrito = $data['carrito'] ?? [];

if (empty($carrito)) {
    die(json_encode(["status" => "error", "message" => "El carrito está vacío"]));
}

try {
    // INICIAMOS TRANSACCIÓN: Es "Todo o Nada" (Protege la base de datos)
    $pdo->beginTransaction();

    foreach ($carrito as $item) {
        $id = $item['id_producto'];
        $cantidad = $item['cantidad'];

        // 1. Verificamos cuánto stock hay realmente en la base de datos
        $stmt = $pdo->prepare("SELECT nombre, stock_actual FROM producto WHERE id_producto = ?");
        $stmt->execute([$id]);
        $producto = $stmt->fetch();

        // 2. Si intentan vender más de lo que hay, abortamos todo
        if (!$producto || $producto['stock_actual'] < $cantidad) {
            throw new Exception("Stock insuficiente para: " . ($producto['nombre'] ?? "Producto ID $id") . ". Solo quedan " . $producto['stock_actual']);
        }

        // 3. Descontamos el stock de la tabla
        $update = $pdo->prepare("UPDATE producto SET stock_actual = stock_actual - ? WHERE id_producto = ?");
        $update->execute([$cantidad, $id]);
    }

    // Si el bucle termina sin errores, CONFIRMAMOS los cambios en la BD
    $pdo->commit();
    echo json_encode(["status" => "success", "message" => "Venta procesada. El stock ha sido actualizado."]);

} catch (Exception $e) {
    // Si hubo un error (ej. falta de stock), DESHACEMOS cualquier cambio a medias
    $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>