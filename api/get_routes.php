<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

try {
    // Get all routes with their waypoints
    $stmt = $pdo->query("
        SELECT r.*, GROUP_CONCAT(CONCAT(w.lat, ',', w.lng, ',', w.sequence) ORDER BY w.sequence) as waypoints
        FROM routes r
        LEFT JOIN waypoints w ON r.id = w.route_id
        GROUP BY r.id
        ORDER BY r.created_at DESC
    ");
    
    $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format waypoints data
    foreach ($routes as &$route) {
        if ($route['waypoints']) {
            $waypoints = [];
            $waypointStrings = explode(',', $route['waypoints']);
            for ($i = 0; $i < count($waypointStrings); $i += 3) {
                $waypoints[] = [
                    'lat' => floatval($waypointStrings[$i]),
                    'lng' => floatval($waypointStrings[$i + 1]),
                    'sequence' => intval($waypointStrings[$i + 2])
                ];
            }
            $route['waypoints'] = $waypoints;
        } else {
            $route['waypoints'] = [];
        }
    }
    
    echo json_encode(['success' => true, 'routes' => $routes]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
