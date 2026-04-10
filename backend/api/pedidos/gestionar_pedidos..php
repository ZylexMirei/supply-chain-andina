<?php
// backend/api/pedidos.php
require_once '../../conexion.php';
header('Content-Type: application/json');

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'POST':
        // 1. LA CARA PÚBLICA: Un cliente envía su carrito de compras
        $data = json_decode(file_get_contents("php://input"), true);
        
        $cliente = $data['cliente'] ?? 'Cliente General';
        $telefono = $data['telefono'] ?? '';
        $carrito = $data['carrito'] ?? []; // Array de productos
        $total = $data['total'] ?? 0;

        if (empty($carrito)) {
            die(json_encode(["status" => "error", "message" => "El carrito está vacío"]));
        }

        try {
            $pdo->beginTransaction();

            // A. Creamos la cabecera del pedido (Estado: Pendiente)
            $stmt = $pdo->prepare("INSERT INTO pedido (nombre_cliente, telefono_cliente, total) VALUES (?, ?, ?)");
            $stmt->execute([$cliente, $telefono, $total]);
            $id_pedido = $pdo->lastInsertId();

            // B. Guardamos cada producto dentro del pedido
            $stmt_detalle = $pdo->prepare("INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_venta) VALUES (?, ?, ?, ?)");
            
            foreach ($carrito as $item) {
                $stmt_detalle->execute([
                    $id_pedido, 
                    $item['id_producto'], 
                    $item['cantidad'], 
                    $item['precio']
                ]);
            }

            $pdo->commit();
            echo json_encode(["status" => "success", "message" => "Pedido #$id_pedido registrado correctamente. Esperando aprobación."]);

        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(["status" => "error", "message" => "Error al registrar el pedido: " . $e->getMessage()]);
        }
        break;

    case 'GET':
        // 2. LA CARA PRIVADA: El almacenero quiere ver los pedidos pendientes
        try {
            $stmt = $pdo->query("
                SELECT p.id_pedido, p.nombre_cliente, p.total, p.estado, p.fecha,
                       COUNT(d.id_detalle) as total_items
                FROM pedido p
                LEFT JOIN detalle_pedido d ON p.id_pedido = d.id_pedido
                GROUP BY p.id_pedido
                ORDER BY p.fecha DESC
            ");
            $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(["status" => "success", "data" => $pedidos]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;
}
?>