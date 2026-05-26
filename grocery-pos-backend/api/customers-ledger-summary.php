<?php
include_once __DIR__ . '/../config/cors.php'; 
include_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");

$db = (new Database())->getConnection();

try {

$stmt = $db->query("

SELECT

    i.customer_phone,

    MAX(i.customer_name) AS customer_name,

    ROUND(
        SUM(i.total_amount),
        2
    ) AS total,

    ROUND(
        SUM(i.paid_amount),
        2
    ) AS paid,

    ROUND(
        SUM(i.total_amount) -
        SUM(i.paid_amount),
        2
    ) AS balance

FROM invoices i

GROUP BY i.customer_phone

ORDER BY balance DESC

");

    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "customers" => $customers
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}