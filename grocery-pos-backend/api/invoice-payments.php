<?php

include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");

$db = (new Database())->getConnection();

$invoice_id = $_GET["invoice_id"] ?? null;

if (!$invoice_id) {

    echo json_encode([
        "success" => false,
        "message" => "Invoice ID required"
    ]);

    exit();
}

try {

    $stmt = $db->prepare("

        SELECT

            p.id,
            p.amount,
            p.payment_method,
            p.reference_no,
            p.notes,
            p.created_at,

            pa.amount AS allocated_amount

        FROM payment_allocations pa

        INNER JOIN payments p
            ON pa.payment_id = p.id

        WHERE pa.invoice_id = ?

        ORDER BY p.id DESC

    ");

    $stmt->execute([$invoice_id]);

    $payments =
        $stmt->fetchAll(PDO::FETCH_ASSOC);

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