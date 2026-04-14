<?php
// backend/api/compras.php
require_once '../../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true) ?: [];
    
    $proveedor = trim($data['proveedor'] ?? 'Proveedor General');
    $documento = trim($data['documento'] ?? 'S/N');
    $mercaderia = $data['mercaderia'] ?? []; 
    $total_compra = (float) ($data['total_compra'] ?? 0);

    if (empty($mercaderia)) {
        jsonResponse(["status" => "error", "message" => "No hay mercadería para ingresar."], 400);
    }

    if ($total_compra < 0) {
        jsonResponse(["status" => "error", "message" => "El total de compra no puede ser negativo."], 400);
    }

    try {
        // Iniciamos la transacción ACID para proteger el inventario
        $pdo->beginTransaction();

        // 1. Registramos la cabecera de la compra
        $stmt = $pdo->prepare("INSERT INTO compra (proveedor, documento_respaldo, total_compra) VALUES (?, ?, ?)");
        $stmt->execute([$proveedor, $documento, $total_compra]);
        $id_compra = $pdo->lastInsertId();

        // Preparar consultas para el bucle
        $stmt_detalle = $pdo->prepare("INSERT INTO detalle_compra (id_compra, id_producto, cantidad_ingresada, costo_unitario) VALUES (?, ?, ?, ?)");
        $stmt_sumar_stock = $pdo->prepare("UPDATE producto SET stock_actual = stock_actual + ? WHERE id_producto = ?");

        // 2. Procesamos cada producto que llegó en el camión
        foreach ($mercaderia as $item) {
            $id_producto = (int) ($item['id_producto'] ?? 0);
            $cantidad = (float) ($item['cantidad'] ?? 0);
            $costo = (float) ($item['costo'] ?? 0);

            if ($id_producto <= 0 || $cantidad <= 0 || $costo < 0) {
                throw new InvalidArgumentException('Se detectaron productos inválidos en la compra.');
            }

            // A. Guardamos el detalle histórico
            $stmt_detalle->execute([$id_compra, $id_producto, $cantidad, $costo]);
            
            // B. ¡MAGIA SCM! Sumamos el stock al almacén físico
            $stmt_sumar_stock->execute([$cantidad, $id_producto]);
        }

        $pdo->commit();
        jsonResponse([
            "status" => "success", 
            "message" => "Ingreso de almacén registrado. Stock actualizado con éxito.",
            "id_compra" => $id_compra
        ]);

    } catch (InvalidArgumentException $e) {
        $pdo->rollBack();
        jsonResponse(["status" => "error", "message" => $e->getMessage()], 400);
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log('Error registrando compra: ' . $e->getMessage());
        jsonResponse(["status" => "error", "message" => "No se pudo registrar la compra."], 500);
    }
} else {
    
    try {
        $stmt = $pdo->query("SELECT * FROM compra ORDER BY fecha DESC");
        jsonResponse(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        error_log('Error listando compras: ' . $e->getMessage());
        jsonResponse(["status" => "error", "message" => "No se pudo listar las compras."], 500);
    }
}
?>