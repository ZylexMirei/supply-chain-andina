<?php
// backend/api/pedidos.php
require_once '../../conexion.php';
header('Content-Type: application/json');

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'POST':
        // 1. LA CARA PÚBLICA: Un cliente envía su carrito de compras
        $data = json_decode(file_get_contents("php://input"), true) ?: [];
        
        $cliente = trim($data['cliente'] ?? 'Cliente General');
        $telefono = trim($data['telefono'] ?? '');
        $carrito = $data['carrito'] ?? []; // Array de productos
        $total = (float) ($data['total'] ?? 0);

        if (empty($carrito)) {
            jsonResponse(["status" => "error", "message" => "El carrito está vacío"], 400);
        }

        if ($total < 0) {
            jsonResponse(["status" => "error", "message" => "Total inválido."], 400);
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
                $idProducto = (int) ($item['id_producto'] ?? 0);
                $cantidad = (float) ($item['cantidad'] ?? 0);
                $precio = (float) ($item['precio'] ?? 0);
                if ($idProducto <= 0 || $cantidad <= 0 || $precio < 0) {
                    throw new InvalidArgumentException('Se detectaron productos inválidos.');
                }

                $stmt_detalle->execute([
                    $id_pedido, 
                    $idProducto, 
                    $cantidad, 
                    $precio
                ]);
            }

            $pdo->commit();
            jsonResponse(["status" => "success", "message" => "Pedido #$id_pedido registrado correctamente. Esperando aprobación."]);

        } catch (InvalidArgumentException $e) {
            $pdo->rollBack();
            jsonResponse(["status" => "error", "message" => $e->getMessage()], 400);
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log('Error registrando pedido: ' . $e->getMessage());
            jsonResponse(["status" => "error", "message" => "Error al registrar el pedido."], 500);
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
            
            jsonResponse(["status" => "success", "data" => $pedidos]);
        } catch (PDOException $e) {
            error_log('Error listando pedidos: ' . $e->getMessage());
            jsonResponse(["status" => "error", "message" => "No se pudo listar los pedidos."], 500);
        }
        break;
    default:
        jsonResponse(["status" => "error", "message" => "Método no permitido"], 405);
}
?>