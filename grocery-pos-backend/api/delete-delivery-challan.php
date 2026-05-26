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

    // 1. Get challan info
    $challanQuery = $db->prepare("
        SELECT quotation_id, status
        FROM delivery_challans
        WHERE id = :id
    ");

    $challanQuery->execute([
        ":id" => $data->id
    ]);

    $challan = $challanQuery->fetch(PDO::FETCH_ASSOC);

    if (!$challan) {

        $db->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "Challan not found"
        ]);

        exit;
    }

    // 2. Only cancelled challans can be deleted
    if ($challan['status'] !== 'cancelled') {

        $db->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "Only cancelled challans can be deleted"
        ]);

        exit;
    }


    // 4. Delete challan items
    $deleteItems = $db->prepare("
        DELETE FROM delivery_challan_items
        WHERE challan_id = :id
    ");

    $deleteItems->execute([
        ":id" => $data->id
    ]);

    // 5. Delete challan
    $deleteChallan = $db->prepare("
        DELETE FROM delivery_challans
        WHERE id = :id
    ");

    $deleteChallan->execute([
        ":id" => $data->id
    ]);

    // 6. Revert quotation to approved
    if (!empty($challan['quotation_id'])) {

        $updateQuotation = $db->prepare("
            UPDATE quotations
            SET status = 'draft'
            WHERE id = :id
        ");

        $updateQuotation->execute([
            ":id" => $challan['quotation_id']
        ]);
    }

    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "Delivery challan deleted successfully"
    ]);

} catch (Exception $e) {

    if ($db->inTransaction()) {
        $db->rollBack();
    }

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}