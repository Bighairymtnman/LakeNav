<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['name']) && !empty($data['waypoints'])) {
    try {
        $pdo->beginTransaction();

        // Insert route
        $stmt = $pdo->prepare("INSERT INTO routes (name) VALUES (?)");
        $stmt->execute([$data['name']]);
        $routeId = $pdo->lastInsertId();

        // Insert waypoints
        $stmt = $pdo->prepare("INSERT INTO waypoints (route_id, lat, lng, sequence) VALUES (?, ?, ?, ?)");
        foreach ($data['waypoints'] as $index => $waypoint) {
            $stmt->execute([$routeId, $waypoint['lat'], $waypoint['lng'], $index + 1]);
        }

        $pdo->commit();
        echo json_encode(['success' => true, 'route_id' => $routeId]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid data']);
}
?>
