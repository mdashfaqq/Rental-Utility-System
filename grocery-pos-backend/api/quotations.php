<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';


// ✅ HANDLE PREFLIGHT FIRST
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}



$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

// ✅ VALIDATION
if (!$data || !isset($data["items"])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid payload"
    ]);
    exit();
}

try {
    
    $gstStmt = $db->prepare("
    SELECT value
    FROM settings
    WHERE type = 'tax'
    AND `key` = 'gstRate'
    LIMIT 1
");

$gstStmt->execute();

$gstSetting =
    $gstStmt->fetch(PDO::FETCH_ASSOC);

$gstPercentage =
    (float)($gstSetting["value"] ?? 18);

    // 🔹 Insert quotation
$query = "INSERT INTO quotations 
(
    customer_name,
    customer_phone,
    start_date,
    end_date,
    subtotal,
    discount,
    discount_type,
    discount_amount,
    total_amount,
gst_enabled,
gst_percentage,
gst_amount
) 
VALUES (
    :name,
    :phone,
    :start,
    :end,
    :subtotal,
    :discount,
    :discount_type,
    :discount_amount,
    :total,
    :gst_enabled,
:gst_percentage,
:gst_amount

)";

    $stmt = $db->prepare($query);
$stmt->execute([

    ":name" =>
        $data["customer_name"] ?? "",

    ":phone" =>
        $data["customer_phone"] ?? "",

    ":start" =>
        $data["start_date"] ?? null,

    ":end" =>
        $data["end_date"] ?? null,

    ":subtotal" =>
        (float)($data["subtotal"] ?? 0),

    ":discount" =>
        (float)($data["discount_value"] ?? 0),

    ":discount_type" =>
        $data["discount_type"] ?? "amount",

    ":discount_amount" =>
        (float)($data["discount_amount"] ?? 0),

    ":total" =>
        (float)($data["total_amount"] ?? 0),

    ":gst_enabled" =>
        isset($data["gst_enabled"])
            ? (int)$data["gst_enabled"]
            : 0,
            
":gst_percentage" => $gstPercentage,

":gst_amount" =>
    isset($data["gst_enabled"]) &&
    (int)$data["gst_enabled"] === 1
        ? round(
            (
                (float)($data["subtotal"] ?? 0) *
                $gstPercentage
            ) / 100,
            2
        )
        : 0,
]);

    $quotation_id = $db->lastInsertId();

    // 🔹 Insert items
    foreach ($data["items"] as $item) {

        $query = "INSERT INTO quotation_items 
            (quotation_id, product_id, product_name, quantity, price, rental_days, total)
            VALUES (:qid, :pid, :name, :qty, :price, :days, :total)";

        $stmt = $db->prepare($query);
$quantity = isset($item["quantity"])
    ? (int)$item["quantity"]
    : (isset($item["quantity_sent"]) ? (int)$item["quantity_sent"] : 0);

$stmt->execute([
    ":qid" => $quotation_id,
    ":pid" => $item["product_id"] ?? 0,
    ":name" => $item["product_name"] ?? "",
    ":qty" => $quantity, // ✅ FIXED
    ":price" => (float)($item["price"] ?? 0),
    ":days" => (int)($item["rental_days"] ?? 1),
    ":total" => (float)($item["total"] ?? 0)
]);
    }

echo json_encode([
    "success" => true,
    "id" => $quotation_id
]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}