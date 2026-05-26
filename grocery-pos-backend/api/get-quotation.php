<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();

// 🔹 Get ID safely
$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode([
        "success" => false,
        "message" => "Quotation ID is required"
    ]);
    exit;
}

// 🔹 Fetch quotation
$q = $db->prepare("
    SELECT
        q.*,
        dc.id AS challan_id,
        i.id AS invoice_id
    FROM quotations q

    LEFT JOIN delivery_challans dc
        ON dc.quotation_id = q.id

    LEFT JOIN invoices i
        ON i.challan_id = dc.id

    WHERE q.id = :id
");
$q->execute([":id" => $id]);
$quotation = $q->fetch(PDO::FETCH_ASSOC);

// 🔹 Fetch items
$i = $db->prepare("SELECT * FROM quotation_items WHERE quotation_id = :id");
$i->execute([":id" => $id]);
$items = $i->fetchAll(PDO::FETCH_ASSOC);

// 🔹 Handle not found
if (!$quotation) {
    echo json_encode([
        "success" => false,
        "message" => "Quotation not found"
    ]);
    exit;
}

// ✅ Proper response
echo json_encode([
    "success" => true,
    "quotation" => $quotation,
    "items" => $items ?: []
]);