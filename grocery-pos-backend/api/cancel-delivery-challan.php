<?php

include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id)) {
    echo json_encode([
        "success" => false,
        "message" => "Challan ID required"
    ]);
    exit;
}

$db = (new Database())->getConnection();

try {

    $db->beginTransaction();

    // 1. Check if invoice exists
    $invoiceCheck = $db->prepare("
        SELECT id 
        FROM invoices
        WHERE challan_id = :id
        LIMIT 1
    ");

    $invoiceCheck->execute([
        ":id" => $data->id
    ]);

    if ($invoiceCheck->fetch()) {

        $db->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "Cannot cancel challan after invoice generation"
        ]);

        exit;
    }

    // 2. Get challan + quotation
    $challanQuery = $db->prepare("
SELECT quotation_id, status
FROM delivery_challans
WHERE id = :id
    ");

    $challanQuery->execute([
        ":id" => $data->id
    ]);

    $challan = $challanQuery->fetch(PDO::FETCH_ASSOC);
    
    if ($challan['status'] === 'cancelled') {

    $db->rollBack();

    echo json_encode([
        "success" => false,
        "message" => "Challan is already cancelled"
    ]);

    exit;
}

if ($challan['status'] === 'completed') {

    $db->rollBack();

    echo json_encode([
        "success" => false,
        "message" => "Completed challans cannot be cancelled"
    ]);

    exit;
}

    if (!$challan) {

        $db->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "Challan not found"
        ]);

        exit;
    }

    // 3. Restore stock
    $itemsQuery = $db->prepare("
        SELECT product_id, quantity_sent
        FROM delivery_challan_items
        WHERE challan_id = :id
    ");

    $itemsQuery->execute([
        ":id" => $data->id
    ]);

    $items = $itemsQuery->fetchAll(PDO::FETCH_ASSOC);

    foreach ($items as $item) {

        $updateStock = $db->prepare("
            UPDATE products
            SET stock = stock + :qty
            WHERE id = :product_id
        ");

        $updateStock->execute([
":qty" => $item['quantity_sent'],
            ":product_id" => $item['product_id']
        ]);
    }

    // 4. Cancel challan
    $cancelChallan = $db->prepare("
        UPDATE delivery_challans
        SET status = 'cancelled'
        WHERE id = :id
    ");

    $cancelChallan->execute([
        ":id" => $data->id
    ]);

    // 5. Revert quotation back to approved
    $updateQuotation = $db->prepare("
        UPDATE quotations
        SET status = 'approved'
        WHERE id = :quotation_id
    ");

    $updateQuotation->execute([
        ":quotation_id" => $challan['quotation_id']
    ]);

    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "Delivery challan cancelled successfully"
    ]);

} catch (Exception $e) {

    $db->rollBack();

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}