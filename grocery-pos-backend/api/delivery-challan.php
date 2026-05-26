<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

$db = (new Database())->getConnection();
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["items"])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid payload"]);
    exit();
}

try {

    $db->beginTransaction(); // 🔥 IMPORTANT

    // 🔹 1. Insert challan (WITH STATUS)
$stmt = $db->prepare("
    INSERT INTO delivery_challans 
    (
        quotation_id,
        customer_name,
        customer_phone,
        start_date,
        end_date,
        status
    )
    VALUES (
        :quotation_id,
        :name,
        :phone,
        :start,
        :end,
        'active'
    )
");

$stmt->execute([
    ":quotation_id" => $data["quotation_id"] ?? null,
    ":name"         => $data["customer_name"] ?? "Walk-in",
    ":phone"        => $data["customer_phone"] ?? "",
    ":start"        => $data["start_date"] ?? null,
    ":end"          => $data["end_date"] ?? null
]);

    $challan_id = $db->lastInsertId();

    // 🔹 2. Process items
    foreach ($data["items"] as $item) {

        $product_id = $item["product_id"] ?? null;
        $qty        = $item["quantity_sent"] ?? 0;

        if (!$product_id || $qty <= 0) {
            throw new Exception("Invalid item data");
        }

        // 🔥 CHECK STOCK
        $check = $db->prepare("SELECT stock FROM products WHERE id = :id");
        $check->execute([":id" => $product_id]);
        $product = $check->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            throw new Exception("Product not found: " . $product_id);
        }

        if ($product["stock"] < $qty) {
            throw new Exception("Insufficient stock for product ID: " . $product_id);
        }

        // 🔹 Insert item
        $stmt = $db->prepare("
            INSERT INTO delivery_challan_items
            (challan_id, product_id, product_name, quantity_sent, rental_days)
            VALUES (:cid, :pid, :name, :qty, :days)
        ");

        $stmt->execute([
            ":cid"  => $challan_id,
            ":pid"  => $product_id,
            ":name" => $item["product_name"] ?? "",
            ":qty"  => $qty,
            ":days" => $item["rental_days"] ?? 1
        ]);

        // 🔥 REDUCE STOCK
        $update = $db->prepare("
            UPDATE products 
            SET stock = stock - :qty 
            WHERE id = :id
        ");

        $update->execute([
            ":qty" => $qty,
            ":id"  => $product_id
        ]);
    }
// 🔥 UPDATE QUOTATION STATUS (CRITICAL FIX)
if (isset($data["quotation_id"])) {
    $updateQuotation = $db->prepare("
        UPDATE quotations 
        SET status = 'approved'
        WHERE id = :id
    ");

    $updateQuotation->execute([
        ":id" => $data["quotation_id"]
    ]);
}

    $db->commit(); // 🔥 commit all

    echo json_encode([
        "success" => true,
        "challan_id" => $challan_id
    ]);

} catch (Exception $e) {

    if ($db->inTransaction()) {
        $db->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}