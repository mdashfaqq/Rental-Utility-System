<?php
include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../config/cors.php'; 

header("Content-Type: application/json");

$db = (new Database())->getConnection();

$stmt = $db->prepare("
    SELECT * FROM delivery_challans
    ORDER BY id DESC
");

$stmt->execute();

echo json_encode([
    "success" => true,
    "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
]);