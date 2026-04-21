<?php
// backend/api/ia/prediccion.php
require_once __DIR__ . '/../../conexion.php';
header('Content-Type: application/json');

$id_producto = $_GET['id'] ?? 1; // Por defecto analizamos el producto 1 (Coca-Cola)

try {
    // 1. Buscamos el producto y su stock actual
    $stmt_prod = $pdo->prepare("
        SELECT p.nombre, COALESCE(i.stock_actual, p.stock, 0) AS stock_actual, COALESCE(i.stock_maximo, 0) AS stock_maximo
        FROM producto p 
        LEFT JOIN inventario i ON p.id = i.id_producto
        WHERE p.id = ?
    ");
    $stmt_prod->execute([$id_producto]);
    $producto = $stmt_prod->fetch(PDO::FETCH_ASSOC);

    if (!$producto) {
        die(json_encode(["status" => "error", "message" => "Producto no encontrado."]));
    }

  // 2. Extraemos el historial de ventas de los últimos 3 meses
    $stmt_ventas = $pdo->prepare("
        SELECT MONTH(p.fecha) as mes, SUM(dp.cantidad) as total_vendido
        FROM pedido p
        JOIN detalle_pedido dp ON p.id = dp.id_pedido
        WHERE dp.id_producto = ? AND p.estado = 'Aprobado' 
        AND p.fecha >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
        GROUP BY MONTH(p.fecha)
        ORDER BY MAX(p.fecha) DESC
        LIMIT 3
    ");
    $stmt_ventas->execute([$id_producto]);
    $ventas = $stmt_ventas->fetchAll(PDO::FETCH_ASSOC);
    // 3. ALGORITMO DE INTELIGENCIA: Promedio Ponderado
    $prediccion_ventas = 0;
    
    if (count($ventas) > 0) {
        $total_ponderado = 0;
        $divisor_pesos = 0;
        
        // Le damos peso 3 al mes actual/anterior, peso 2 al más antiguo, etc.
        foreach ($ventas as $index => $venta) {
            $peso = 3 - $index; // Mes 1 (peso 3), Mes 2 (peso 2), Mes 3 (peso 1)
            $total_ponderado += ($venta['total_vendido'] * $peso);
            $divisor_pesos += $peso;
        }
        
        $prediccion_ventas = ceil($total_ponderado / $divisor_pesos);
    } else {
        // Si no hay historial, la IA sugiere el 20% del stock máximo como arranque
        $prediccion_ventas = ceil($producto['stock_maximo'] * 0.20);
    }

    // 4. Calcular cuánto necesitamos comprar realmente
    // (Lo que vamos a vender) - (Lo que ya tenemos en almacén)
    $cantidad_a_comprar = $prediccion_ventas - $producto['stock_actual'];
    
    // Si tenemos más stock del que vamos a vender, no compramos nada (0)
    if ($cantidad_a_comprar < 0) $cantidad_a_comprar = 0;

    // 5. Devolvemos el veredicto de la IA
    echo json_encode([
        "status" => "success",
        "data" => [
            "producto" => $producto['nombre'],
            "stock_actual" => $producto['stock_actual'],
            "ia_prediccion_ventas_30_dias" => $prediccion_ventas,
            "ia_sugerencia_compra" => $cantidad_a_comprar,
            "nivel_confianza" => count($ventas) > 1 ? "Alto" : "Bajo (Faltan datos históricos)",
            "mensaje" => $cantidad_a_comprar > 0 
                ? "La IA sugiere comprar $cantidad_a_comprar unidades para cubrir la demanda del próximo mes." 
                : "Tienes suficiente stock para el próximo mes. No es necesario comprar."
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>