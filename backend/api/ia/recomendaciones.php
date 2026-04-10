<?php
// backend/api/ia/recomendaciones.php
require_once '../../conexion.php';
header('Content-Type: application/json');

$id_producto_actual = $_GET['id'] ?? null;

if (!$id_producto_actual) {
    die(json_encode(["status" => "error", "message" => "Falta el ID del producto."]));
}

try {
    // ALGORITMO DE CO-OCURRENCIA (Cross-Selling)
    // 1. Busca todos los pedidos donde se compró este producto.
    // 2. Busca qué OTROS productos estaban en esos mismos pedidos.
    // 3. Los cuenta y te devuelve los 3 que más se repiten.
    
    $stmt = $pdo->prepare("
        SELECT p.id_producto, p.nombre, p.marca, p.precio_venta, COUNT(dp.id_producto) as frecuencia_compra
        FROM detalle_pedido dp
        JOIN producto p ON dp.id_producto = p.id_producto
        WHERE dp.id_pedido IN (
            SELECT id_pedido FROM detalle_pedido WHERE id_producto = ?
        )
        AND dp.id_producto != ? -- Excluimos el producto que ya está viendo
        GROUP BY p.id_producto
        ORDER BY frecuencia_compra DESC
        LIMIT 3
    ");
    
    // Le pasamos el ID dos veces (una para la subconsulta, otra para la exclusión)
    $stmt->execute([$id_producto_actual, $id_producto_actual]);
    $recomendaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($recomendaciones) > 0) {
        echo json_encode([
            "status" => "success",
            "mensaje_ui" => "¿Te gustaría acompañarlo con...?",
            "data" => $recomendaciones
        ]);
    } else {
        echo json_encode([
            "status" => "success",
            "mensaje_ui" => "No hay suficientes datos para recomendaciones aún.",
            "data" => []
        ]);
    }

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
