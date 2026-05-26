<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();

// 🔹 Get all quotations
$query = "
SELECT
    q.*,
    dc.id AS challan_id
FROM quotations q
LEFT JOIN delivery_challans dc
    ON dc.quotation_id = q.id
ORDER BY q.id DESC
";

$stmt = $db->prepare($query);
$stmt->execute();

$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// ✅ ALWAYS return array
echo json_encode($data ?: []);