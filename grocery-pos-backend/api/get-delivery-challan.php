<?php
include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../config/cors.php'; 

header("Content-Type: application/json");

$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode(["success" => false]);
    exit();
}

$db = (new Database())->getConnection();

// challan
$stmt = $db->prepare("
    SELECT 
        dc.*,
        i.id AS invoice_id
    FROM delivery_challans dc
    LEFT JOIN invoices i
        ON i.challan_id = dc.id
    WHERE dc.id = ?
");
$stmt->execute([$id]);
$challan = $stmt->fetch(PDO::FETCH_ASSOC);

// items
$stmt = $db->prepare("
    SELECT * FROM delivery_challan_items 
    WHERE challan_id = ?
");
$stmt->execute([$id]);

echo json_encode([
    "success" => true,
    "challan" => $challan,
    "items" => $stmt->fetchAll(PDO::FETCH_ASSOC)
]);