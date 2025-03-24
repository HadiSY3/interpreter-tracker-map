
<?php
require_once 'config.php';

try {
    $stmt = $pdo->query("SELECT * FROM interpreters");
    $interpreters = $stmt->fetchAll();
    
    // Transform to match frontend structure
    $result = array_map(function($interpreter) {
        return [
            'id' => $interpreter['id'],
            'name' => $interpreter['name'],
            'email' => $interpreter['email'],
            'phone' => $interpreter['phone'],
            'languages' => json_decode($interpreter['languages']),
            'assignmentCount' => (int)$interpreter['assignment_count']
        ];
    }, $interpreters);
    
    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
