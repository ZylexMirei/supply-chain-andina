<?php
require_once __DIR__ . '/../../conexion.php';
header('Content-Type: application/json');

function tableHasColumn(PDO $pdo, string $table, string $column): bool
{
    $stmt = $pdo->prepare("
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
        LIMIT 1
    ");
    $stmt->execute([$table, $column]);
    return (bool) $stmt->fetchColumn();
}

$metodo = $_SERVER['REQUEST_METHOD'];
switch ($metodo) {
    case 'GET':
        // REGLA RGV-B100-01 y RGP-B100-02: Catálogo con estado de Inventario (ROP)
        try {
            $imagenUrlField = 'NULL';
            if (tableHasColumn($pdo, 'producto', 'imagen_url')) {
                $imagenUrlField = 'p.imagen_url';
            } elseif (tableHasColumn($pdo, 'producto', 'url_imagen')) {
                $imagenUrlField = 'p.url_imagen';
            } elseif (tableHasColumn($pdo, 'producto', 'imagen')) {
                $imagenUrlField = 'p.imagen';
            }

            $stmt = $pdo->query("
                SELECT 
                    p.id AS id_producto,
                    p.id_categoria,
                    p.nombre,
                    p.marca,
                    $imagenUrlField AS imagen_url,
                    COALESCE(c.nombre, 'Sin categoría') AS categoria,
                    p.precio_venta,
                    p.costo_compra,
                    (p.precio_venta - p.costo_compra) AS ganancia,
                    COALESCE(inv.stock_actual, 0) AS stock_actual,
                    COALESCE(inv.stock_minimo, 0) AS stock_minimo,
                    COALESCE(inv.stock_maximo, 0) AS stock_maximo,
                    (COALESCE(inv.stock_actual, 0) > 0) AS disponible_para_venta,
                    -- AQUI OCURRE LA MAGIA DEL INVENTARIO:
                    CASE 
                        WHEN COALESCE(inv.stock_actual, 0) <= 0 THEN 'AGOTADO'
                        WHEN COALESCE(inv.stock_actual, 0) <= COALESCE(inv.stock_minimo, 0) THEN 'REORDEN'
                        ELSE 'NORMAL'
                    END as estado_stock
                FROM producto p
                LEFT JOIN categoria c ON c.id = p.id_categoria
                LEFT JOIN (
                    SELECT
                        i.id_producto,
                        SUM(COALESCE(i.stock_actual, 0)) AS stock_actual,
                        MIN(COALESCE(i.stock_minimo, 0)) AS stock_minimo,
                        MAX(COALESCE(i.stock_maximo, 0)) AS stock_maximo
                    FROM inventario i
                    GROUP BY i.id_producto
                ) inv ON inv.id_producto = p.id
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
