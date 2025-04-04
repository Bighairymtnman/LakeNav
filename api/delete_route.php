<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

$routeId = $_GET['id'] ?? null;

if ($routeId) {
    try {
        $pdo->beginTransaction();

        // Delete waypoints first
        $stmt = $pdo->prepare("DELETE FROM waypoints WHERE route_id = ?");
        $stmt->execute([$routeId]);

        // Then delete the route
        $stmt = $pdo->prepare("DELETE FROM routes WHERE id = ?");
        $result = $stmt->execute([$routeId]);

        $pdo->commit();

        if ($result) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Route not found']);
        }
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No route ID provided']);
}
?>
