<?php
// backend/api/compras.php
require_once '../../conexion.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $proveedor = $data['proveedor'] ?? 'Proveedor General';
    $documento = $data['documento'] ?? 'S/N';
    $mercaderia = $data['mercaderia'] ?? []; 
    $total_compra = $data['total_compra'] ?? 0;

    if (empty($mercaderia)) {
        die(json_encode(["status" => "error", "message" => "No hay mercadería para ingresar."]));
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
            $id_producto = $item['id_producto'];
            $cantidad = $item['cantidad'];
            $costo = $item['costo'];

            // A. Guardamos el detalle histórico
            $stmt_detalle->execute([$id_compra, $id_producto, $cantidad, $costo]);
            
            // B. ¡MAGIA SCM! Sumamos el stock al almacén físico
            $stmt_sumar_stock->execute([$cantidad, $id_producto]);
        }

        $pdo->commit();
        echo json_encode([
            "status" => "success", 
            "message" => "Ingreso de almacén registrado. Stock actualizado con éxito.",
            "id_compra" => $id_compra
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["status" => "error", "message" => "Error en la base de datos: " . $e->getMessage()]);
    }
} else {
    // Si envían un GET, mostramos el historial de compras
    try {
        $stmt = $pdo->query("SELECT * FROM compra ORDER BY fecha DESC");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>