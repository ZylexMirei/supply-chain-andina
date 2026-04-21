<?php
require_once __DIR__ . '/../../conexion.php';
header('Content-Type: application/json');

$metodo = $_SERVER['REQUEST_METHOD'];
switch ($metodo) {
    case 'GET':
        // REGLA RGV-B100-01 y RGP-B100-02: Catálogo con estado de Inventario (ROP)
        try {
            $stmt = $pdo->query("
                SELECT 
                    p.id AS id_producto,
                    p.id_categoria,
                    p.nombre,
                    p.marca,
                    COALESCE(c.nombre, 'Sin categoría') AS categoria,
                    p.precio_venta,
                    p.costo_compra,
                    (p.precio_venta - p.costo_compra) AS ganancia,
                    COALESCE(i.stock_actual, p.stock, 0) AS stock_actual,
                    COALESCE(i.stock_minimo, 0) AS stock_minimo,
                    COALESCE(i.stock_maximo, 0) AS stock_maximo,
                    -- AQUI OCURRE LA MAGIA DEL INVENTARIO:
                    CASE 
                        WHEN COALESCE(i.stock_actual, p.stock, 0) <= 0 THEN 'AGOTADO'
                        WHEN COALESCE(i.stock_actual, p.stock, 0) <= COALESCE(i.stock_minimo, 0) THEN 'REORDEN'
                        ELSE 'NORMAL'
                    END as estado_stock
                FROM producto p
                LEFT JOIN categoria c ON c.id = p.id_categoria
                LEFT JOIN inventario i ON i.id_producto = p.id
                ORDER BY categoria, p.nombre ASC
            ");
            $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                "status" => "success", 
                "total" => count($productos),
                "data" => $productos
            ]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Error al cargar catálogo: " . $e->getMessage()]);
        }
        break;

    case 'POST':
        // Aquí programaremos la lógica para CREAR un nuevo alimento
        // (Respetando la regla RGP-B100-02: stock_maximo > stock_minimo)
        echo json_encode(["status" => "info", "message" => "Endpoint para crear producto listo para programarse"]);
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Método no soportado"]);
        break;
}
?>
