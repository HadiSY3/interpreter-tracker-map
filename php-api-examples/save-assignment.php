
<?php
require_once 'config.php';

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input data']);
    exit;
}

// Sanitize input
$data = sanitizeInput($data);

try {
    // Begin transaction
    $pdo->beginTransaction();

    // Check if it's an update or insert
    $checkStmt = $pdo->prepare("SELECT id FROM assignments WHERE id = ?");
    $checkStmt->execute([$data['id']]);
    $exists = $checkStmt->fetch();

    if ($exists) {
        // Update existing assignment
        $stmt = $pdo->prepare("
            UPDATE assignments SET
                client_name = ?,
                location_id = ?,
                category_id = ?,
                start_time = ?,
                end_time = ?,
                notes = ?,
                interpreter_id = ?,
                language = ?,
                paid = ?,
                travel_distance = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $data['clientName'],
            $data['location']['id'],
            $data['category']['id'],
            $data['startTime'],
            $data['endTime'],
            $data['notes'] ?? null,
            $data['interpreter']['id'] ?? null,
            $data['language'] ?? null,
            $data['paid'] ? 1 : 0,
            $data['travelDistance'] ?? 0,
            $data['id']
        ]);
    } else {
        // Insert new assignment
        $stmt = $pdo->prepare("
            INSERT INTO assignments (
                id, client_name, location_id, category_id, start_time, end_time, 
                notes, interpreter_id, language, paid, travel_distance
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['id'],
            $data['clientName'],
            $data['location']['id'],
            $data['category']['id'],
            $data['startTime'],
            $data['endTime'],
            $data['notes'] ?? null,
            $data['interpreter']['id'] ?? null,
            $data['language'] ?? null,
            $data['paid'] ? 1 : 0,
            $data['travelDistance'] ?? 0
        ]);
    }

    // Commit transaction
    $pdo->commit();

    echo json_encode(['success' => true, 'id' => $data['id']]);
} catch (PDOException $e) {
    // Rollback transaction on error
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
