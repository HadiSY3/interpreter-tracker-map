
<?php
require_once 'config.php';

try {
    // Query to get all assignments with related data (interpreter, location, category)
    $stmt = $pdo->prepare("
        SELECT a.*, 
               i.id as interpreter_id, i.name as interpreter_name, i.email as interpreter_email, 
               i.phone as interpreter_phone, i.languages as interpreter_languages,
               l.id as location_id, l.name as location_name, l.address as location_address, 
               l.coordinates as location_coordinates, l.visit_count as location_visit_count,
               c.id as category_id, c.name as category_name, c.hourly_rate as category_hourly_rate, 
               c.minute_rate as category_minute_rate
        FROM assignments a
        LEFT JOIN interpreters i ON a.interpreter_id = i.id
        LEFT JOIN locations l ON a.location_id = l.id
        LEFT JOIN categories c ON a.category_id = c.id
    ");
    $stmt->execute();
    $assignments = $stmt->fetchAll();

    // Transform the flat result into nested objects
    $result = [];
    foreach ($assignments as $row) {
        $assignment = [
            'id' => $row['id'],
            'clientName' => $row['client_name'],
            'startTime' => $row['start_time'],
            'endTime' => $row['end_time'],
            'notes' => $row['notes'],
            'language' => $row['language'],
            'paid' => (bool)$row['paid'],
            'location' => [
                'id' => $row['location_id'],
                'name' => $row['location_name'],
                'address' => $row['location_address'],
                'coordinates' => json_decode($row['location_coordinates']),
                'visitCount' => (int)$row['location_visit_count']
            ],
            'category' => [
                'id' => $row['category_id'],
                'name' => $row['category_name'],
                'hourlyRate' => (float)$row['category_hourly_rate'],
                'minuteRate' => (float)$row['category_minute_rate']
            ]
        ];

        // Only add interpreter if one exists
        if ($row['interpreter_id']) {
            $assignment['interpreter'] = [
                'id' => $row['interpreter_id'],
                'name' => $row['interpreter_name'],
                'email' => $row['interpreter_email'],
                'phone' => $row['interpreter_phone'],
                'languages' => json_decode($row['interpreter_languages'])
            ];
        }

        $result[] = $assignment;
    }

    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
