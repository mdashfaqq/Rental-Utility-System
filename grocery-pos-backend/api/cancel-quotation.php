<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id)) {
    echo json_encode([
        "success" => false,
        "message" => "Quotation ID required"
    ]);
    exit;
}

$db = (new Database())->getConnection();

$query = "UPDATE quotations 
          SET status = 'cancelled'
          WHERE id = :id";

$stmt = $db->prepare($query);

$stmt->bindParam(":id", $data->id);

$success = $stmt->execute();

echo json_encode([
    "success" => $success
]);