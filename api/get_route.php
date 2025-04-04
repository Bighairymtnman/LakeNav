<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

$routeId = $_GET['id'] ?? null;

if ($routeId) {
    try {
        // Get route details
        $stmt = $pdo->prepare("
            SELECT r.*, w.lat, w.lng, w.sequence 
            FROM routes r
            LEFT JOIN waypoints w ON r.id = w.route_id
            WHERE r.id = ?
            ORDER BY w.sequence
        ");
        $stmt->execute([$routeId]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if ($results) {
            $route = [
                'id' => $results[0]['id'],
                'name' => $results[0]['name'],
                'created_at' => $results[0]['created_at'],
                'waypoints' => []
            ];
            
            foreach ($results as $row) {
                if ($row['lat'] !== null) {
                    $route['waypoints'][] = [
                        'lat' => floatval($row['lat']),
                        'lng' => floatval($row['lng']),
                        'sequence' => intval($row['sequence'])
                    ];
                }
            }
            
            echo json_encode(['success' => true, 'route' => $route]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Route not found']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No route ID provided']);
}
?>
