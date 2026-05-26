<?php
include_once '../config/cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$phone = $_GET['phone'] ?? '';

if (!$phone) {
    echo json_encode(['success' => false, 'message' => 'Phone number required']);
    exit;
}

$stmt = $db->prepare("SELECT * FROM customers WHERE phone = ?");
$stmt->execute([$phone]);
$customer = $stmt->fetch(PDO::FETCH_ASSOC);

if ($customer) {
    echo json_encode(['success' => true, 'customer' => $customer]);
} else {
    echo json_encode(['success' => false, 'message' => 'Customer not found']);
}
