<?php
require_once '../../conexion.php';
header('Content-Type: application/json');

$metodo = $_SERVER['REQUEST_METHOD'];
switch ($metodo) {
    case 'GET':
        // REGLA RGV-B100-01 y RGP-B100-02: Catálogo con estado de Inventario (ROP)
        try {
            $stmt = $pdo->query("
                SELECT 
                    id_producto, 
                    nombre, 
                    marca, 
                    categoria, 
                    precio_venta, 
                    costo_compra,
                    (precio_venta - costo_compra) AS ganancia,
                    stock_actual,
                    stock_minimo, 
                    stock_maximo,
                    -- AQUI OCURRE LA MAGIA DEL INVENTARIO:
                    CASE 
                        WHEN stock_actual <= 0 THEN 'AGOTADO'
                        WHEN stock_actual <= stock_minimo THEN 'REORDEN'
                        ELSE 'NORMAL'
                    END as estado_stock
                FROM producto 
                ORDER BY categoria, nombre ASC
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
