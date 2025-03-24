
<?php
require_once 'config.php';

try {
    $stmt = $pdo->query("SELECT * FROM locations");
    $locations = $stmt->fetchAll();
    
    // Transform to match frontend structure
    $result = array_map(function($location) {
        return [
            'id' => $location['id'],
            'name' => $location['name'],
            'address' => $location['address'],
            'coordinates' => json_decode($location['coordinates']),
            'visitCount' => (int)$location['visit_count']
        ];
    }, $locations);
    
    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
