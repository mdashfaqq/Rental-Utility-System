<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

// ✅ PREFLIGHT
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ✅ ONLY POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

// ✅ VALIDATION
if (
    !$data ||
    !isset($data["quotation_id"]) ||
    !isset($data["items"]) ||
    !is_array($data["items"])
) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid payload"
    ]);
    exit();
}

$quotation_id = $data["quotation_id"];

try {

    $db->beginTransaction();

    // 🔹 CHECK QUOTATION EXISTS
    $check = $db->prepare("SELECT id FROM quotations WHERE id = :id");
    $check->execute([":id" => $quotation_id]);

    if ($check->rowCount() === 0) {
        throw new Exception("Quotation not found");
    }

    $total_amount = 0;
    
    // GET ALL SENT ITEM IDS
$itemIds = array_filter(
    array_column($data["items"], "id")
);

// CREATE PLACEHOLDERS
$placeholders = implode(',', array_fill(0, count($itemIds), '?'));

// DELETE REMOVED ITEMS
if (!empty($itemIds)) {

    $delete = $db->prepare("
        DELETE FROM quotation_items
        WHERE quotation_id = ?
        AND id NOT IN ($placeholders)
    ");

    $delete->execute(array_merge([$quotation_id], $itemIds));

} else {

    // IF ALL ITEMS REMOVED
    $deleteAll = $db->prepare("
        DELETE FROM quotation_items
        WHERE quotation_id = ?
    ");

    $deleteAll->execute([$quotation_id]);
}


    // 🔹 UPDATE EACH ITEM (IMPORTANT CHANGE)
    $updateItem = $db->prepare("
        UPDATE quotation_items
        SET quantity = :qty,
            price = :price,
            rental_days = :days,
            total = :total
        WHERE id = :item_id AND quotation_id = :qid
    ");

  foreach ($data["items"] as $item) {

    $qty = (int) $item["quantity"];
    $price = (float) $item["price"];
    $days = (int) $item["rental_days"];
    $total = $qty * $price * $days;

    $total_amount += $total;

    // EXISTING ITEM → UPDATE
    if (!empty($item["id"])) {

        $updateItem->execute([
            ":item_id" => $item["id"],
            ":qid" => $quotation_id,
            ":qty" => $qty,
            ":price" => $price,
            ":days" => $days,
            ":total" => $total
        ]);

    } else {

        // NEW ITEM → INSERT
        $insert = $db->prepare("
            INSERT INTO quotation_items
            (
                quotation_id,
                product_id,
                product_name,
                quantity,
                price,
                rental_days,
                total
            )
            VALUES
            (
                :qid,
                :product_id,
                :product_name,
                :qty,
                :price,
                :days,
                :total
            )
        ");

        $insert->execute([
            ":qid" => $quotation_id,
            ":product_id" => $item["product_id"],
            ":product_name" => $item["product_name"],
            ":qty" => $qty,
            ":price" => $price,
            ":days" => $days,
            ":total" => $total
        ]);
    }
}

    // 🔹 UPDATE QUOTATION TOTAL ONLY
    $updateQuotation = $db->prepare("
        UPDATE quotations
        SET total_amount = :total
        WHERE id = :id
    ");

    $updateQuotation->execute([
        ":id" => $quotation_id,
        ":total" => $total_amount
    ]);

    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "Items updated successfully",
        "total_amount" => $total_amount
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