<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");

// 🔥 Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db = (new Database())->getConnection();

$phone = $_GET["phone"] ?? "";

try {

    // ✅ Customer specific payments
    if ($phone) {

        $stmt = $db->prepare("
            SELECT *
            FROM payments
            WHERE customer_phone = ?
            ORDER BY id DESC
        ");

        $stmt->execute([$phone]);

    } else {

        // ✅ Fetch all payments
        $stmt = $db->prepare("
            SELECT *
            FROM payments
            ORDER BY id DESC
        ");

        $stmt->execute();
    }

    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "payments" => $payments
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}