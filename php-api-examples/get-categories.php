
<?php
require_once 'config.php';

try {
    $stmt = $pdo->query("SELECT * FROM categories");
    $categories = $stmt->fetchAll();
    
    // Transform to match frontend structure
    $result = array_map(function($category) {
        return [
            'id' => $category['id'],
            'name' => $category['name'],
            'hourlyRate' => (float)$category['hourly_rate'],
            'minuteRate' => (float)$category['minute_rate'],
            'travelCost' => (float)($category['travel_cost'] ?? 0) // Add travel cost
        ];
    }, $categories);
    
    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
